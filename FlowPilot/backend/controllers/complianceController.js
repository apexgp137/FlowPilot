const pool = require('../db');
const { logAuditFromReq } = require('../services/auditService');

// Get all compliance records with filters
exports.getAllCompliance = async (req, res) => {
  try {
    const { status, institution_id, search, overdue_only } = req.query;

    let query = `
      SELECT c.*,
             i.name AS institution_name,
             i.institution_code,
             i.state AS institution_state,
             v.name AS verified_by_name,
             a.reference_no AS application_ref
      FROM compliance_items c
      JOIN institutions i ON c.institution_id = i.id
      LEFT JOIN users v ON c.verified_by = v.id
      LEFT JOIN applications a ON c.application_id = a.id
      WHERE 1=1
    `;
    const params = [];

    // Enforce data isolation
    if (req.user.role === 'INSTITUTION') {
      query += ` AND c.institution_id = ?`;
      params.push(req.user.institution_id);
    } else if (institution_id) {
      query += ` AND c.institution_id = ?`;
      params.push(institution_id);
    }

    if (search) {
      query += ` AND (c.requirement_title LIKE ? OR c.requirement_type LIKE ? OR i.name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    if (overdue_only === 'true') {
      query += ` AND c.due_date < CURRENT_DATE() AND c.status != 'Verified'`;
    }

    query += ` ORDER BY c.due_date ASC`;

    const [items] = await pool.query(query, params);

    // Compute status flags like is_overdue and days_remaining
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const enrichedItems = items.map(item => {
      const dueDate = new Date(item.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isOverdue = diffDays < 0 && item.status !== 'Verified';
      const isUrgent = diffDays >= 0 && diffDays <= 7 && item.status !== 'Verified';

      return {
        ...item,
        diffDays,
        isOverdue,
        isUrgent
      };
    });

    return res.json({
      success: true,
      count: enrichedItems.length,
      data: enrichedItems
    });
  } catch (error) {
    console.error('getAllCompliance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve compliance records.' });
  }
};

// Get single compliance record
exports.getComplianceById = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query(
      `SELECT c.*,
              i.name AS institution_name,
              i.institution_code,
              i.contact_email AS institution_email,
              v.name AS verified_by_name,
              v.role AS verified_by_role,
              a.reference_no AS application_ref
       FROM compliance_items c
       JOIN institutions i ON c.institution_id = i.id
       LEFT JOIN users v ON c.verified_by = v.id
       LEFT JOIN applications a ON c.application_id = a.id
       WHERE c.id = ?`,
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Compliance record not found.' });
    }

    const item = items[0];

    // Enforce data isolation
    if (req.user.role === 'INSTITUTION' && parseInt(req.user.institution_id, 10) !== parseInt(item.institution_id, 10)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot access compliance records of other institutions.'
      });
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    console.error('getComplianceById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve compliance details.' });
  }
};

// Create new compliance item
exports.createCompliance = async (req, res) => {
  try {
    const {
      institution_id,
      application_id,
      requirement_title,
      requirement_type,
      description,
      due_date
    } = req.body;

    let targetInstId = institution_id;
    if (req.user.role === 'INSTITUTION') {
      targetInstId = req.user.institution_id;
    }

    if (!targetInstId || !requirement_title || !requirement_type || !due_date) {
      return res.status(400).json({
        success: false,
        message: 'Institution, Requirement Title, Requirement Type, and Due Date are required.'
      });
    }

    // Verify institution exists
    const [inst] = await pool.query('SELECT name FROM institutions WHERE id = ?', [targetInstId]);
    if (inst.length === 0) {
      return res.status(404).json({ success: false, message: 'Institution does not exist.' });
    }

    const [result] = await pool.query(
      `INSERT INTO compliance_items (
        institution_id, application_id, requirement_title, requirement_type,
        description, due_date, status, assigned_to
      ) VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [
        targetInstId,
        application_id || null,
        requirement_title.trim(),
        requirement_type.trim(),
        description || '',
        due_date,
        req.user.id
      ]
    );

    const complianceId = result.insertId;

    // Create deadline alert
    await pool.query(
      `INSERT INTO alerts (title, category, institution_id, application_id, compliance_id, due_date, priority)
       VALUES (?, 'Compliance Deadline', ?, ?, ?, ?, ?)`,
      [
        `Compliance Requirement: ${requirement_title}`,
        targetInstId,
        application_id || null,
        complianceId,
        due_date,
        'Medium'
      ]
    );

    await logAuditFromReq(
      req,
      'CREATE_COMPLIANCE',
      'COMPLIANCE',
      complianceId,
      `Created compliance item "${requirement_title}" for ${inst[0].name}.`
    );

    return res.status(201).json({
      success: true,
      message: 'Compliance requirement created successfully.',
      complianceId
    });
  } catch (error) {
    console.error('createCompliance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create compliance record.' });
  }
};

// Update compliance status / evidence
exports.updateCompliance = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      evidence_note,
      document_reference,
      requirement_title,
      requirement_type,
      description,
      due_date
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM compliance_items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Compliance record not found.' });
    }

    const currentItem = existing[0];

    // Data isolation check for institutions
    if (req.user.role === 'INSTITUTION') {
      if (parseInt(req.user.institution_id, 10) !== parseInt(currentItem.institution_id, 10)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You cannot modify compliance items for other institutions.'
        });
      }

      // Institution cannot mark item as 'Verified'!
      if (status === 'Verified') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Official verification must be completed by an authorized AICTE official.'
        });
      }

      // If institution updates evidence, status automatically transitions to 'Submitted' if not specified
      const targetStatus = status || (evidence_note ? 'Submitted' : currentItem.status);

      await pool.query(
        `UPDATE compliance_items
         SET evidence_note = ?, document_reference = ?, status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          evidence_note !== undefined ? evidence_note : currentItem.evidence_note,
          document_reference !== undefined ? document_reference : currentItem.document_reference,
          targetStatus,
          id
        ]
      );

      await logAuditFromReq(
        req,
        'SUBMIT_COMPLIANCE_EVIDENCE',
        'COMPLIANCE',
        id,
        `Institution submitted evidence for compliance item "${currentItem.requirement_title}". Ref: ${document_reference || 'N/A'}`
      );

      return res.json({
        success: true,
        message: 'Evidence submitted successfully. Awaiting official verification.'
      });
    }

    // ADMIN or OFFICIAL user can verify or modify all fields
    let nextStatus = status !== undefined ? status : currentItem.status;
    let verifiedBy = currentItem.verified_by;
    let verifiedAt = currentItem.verified_at;

    if (status === 'Verified' && currentItem.status !== 'Verified') {
      verifiedBy = req.user.id;
      verifiedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    } else if (status !== 'Verified' && currentItem.status === 'Verified') {
      verifiedBy = null;
      verifiedAt = null;
    }

    await pool.query(
      `UPDATE compliance_items
       SET requirement_title = ?, requirement_type = ?, description = ?, due_date = ?,
           status = ?, evidence_note = ?, document_reference = ?, verified_by = ?, verified_at = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        requirement_title !== undefined ? requirement_title : currentItem.requirement_title,
        requirement_type !== undefined ? requirement_type : currentItem.requirement_type,
        description !== undefined ? description : currentItem.description,
        due_date !== undefined ? due_date : currentItem.due_date,
        nextStatus,
        evidence_note !== undefined ? evidence_note : currentItem.evidence_note,
        document_reference !== undefined ? document_reference : currentItem.document_reference,
        verifiedBy,
        verifiedAt,
        id
      ]
    );

    await logAuditFromReq(
      req,
      nextStatus === 'Verified' ? 'VERIFY_COMPLIANCE' : 'UPDATE_COMPLIANCE',
      'COMPLIANCE',
      id,
      `Updated compliance item "${currentItem.requirement_title}". Status: [${currentItem.status} -> ${nextStatus}].`
    );

    return res.json({
      success: true,
      message: nextStatus === 'Verified' ? 'Compliance requirement officially verified.' : 'Compliance item updated successfully.'
    });
  } catch (error) {
    console.error('updateCompliance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update compliance record.' });
  }
};
