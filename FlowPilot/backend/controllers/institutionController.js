const pool = require('../db');
const { logAuditFromReq } = require('../services/auditService');

// Get list of institutions
exports.getAllInstitutions = async (req, res) => {
  try {
    const { search, state, status, category } = req.query;
    let query = `
      SELECT i.*,
             COUNT(DISTINCT a.id) AS total_applications,
             COUNT(DISTINCT c.id) AS total_compliance_items
      FROM institutions i
      LEFT JOIN applications a ON i.id = a.institution_id
      LEFT JOIN compliance_items c ON i.id = c.institution_id
      WHERE 1=1
    `;
    const params = [];

    // Enforce data isolation for institution users
    if (req.user.role === 'INSTITUTION') {
      query += ` AND i.id = ?`;
      params.push(req.user.institution_id);
    } else {
      if (search) {
        query += ` AND (i.name LIKE ? OR i.institution_code LIKE ? OR i.city LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      if (state) {
        query += ` AND i.state = ?`;
        params.push(state);
      }
      if (status) {
        query += ` AND i.status = ?`;
        params.push(status);
      }
      if (category) {
        query += ` AND i.category = ?`;
        params.push(category);
      }
    }

    query += ` GROUP BY i.id ORDER BY i.name ASC`;

    const [institutions] = await pool.query(query, params);
    return res.json({ success: true, count: institutions.length, data: institutions });
  } catch (error) {
    console.error('getAllInstitutions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve institutions.' });
  }
};

// Get single institution by ID
exports.getInstitutionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Institution isolation check
    if (req.user.role === 'INSTITUTION' && parseInt(req.user.institution_id, 10) !== parseInt(id, 10)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view other institutions.'
      });
    }

    const [institutions] = await pool.query(
      `SELECT * FROM institutions WHERE id = ?`,
      [id]
    );

    if (institutions.length === 0) {
      return res.status(404).json({ success: false, message: 'Institution not found.' });
    }

    const institution = institutions[0];

    // Fetch related applications
    const [applications] = await pool.query(
      `SELECT id, reference_no, application_type, current_stage, status, priority, due_date, submission_date
       FROM applications
       WHERE institution_id = ?
       ORDER BY created_at DESC`,
      [id]
    );

    // Fetch related compliance items
    const [compliance] = await pool.query(
      `SELECT id, requirement_title, requirement_type, due_date, status, evidence_note
       FROM compliance_items
       WHERE institution_id = ?
       ORDER BY due_date ASC`,
      [id]
    );

    // Fetch related EVC visits
    const [evcVisits] = await pool.query(
      `SELECT id, application_id, proposed_visit_date, lead_expert_name, visit_mode, status
       FROM evc_visits
       WHERE institution_id = ?
       ORDER BY proposed_visit_date ASC`,
      [id]
    );

    // Summary metrics
    const summary = {
      totalApplications: applications.length,
      pendingApplications: applications.filter(a => a.status === 'Pending' || a.status === 'In Progress').length,
      approvedApplications: applications.filter(a => a.status === 'Approved').length,
      rejectedApplications: applications.filter(a => a.status === 'Rejected').length,
      totalCompliance: compliance.length,
      overdueCompliance: compliance.filter(c => c.status === 'Overdue').length,
      pendingCompliance: compliance.filter(c => c.status === 'Pending' || c.status === 'Submitted').length
    };

    return res.json({
      success: true,
      data: {
        ...institution,
        applications,
        compliance,
        evcVisits,
        summary
      }
    });
  } catch (error) {
    console.error('getInstitutionById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve institution details.' });
  }
};

// Create new institution
exports.createInstitution = async (req, res) => {
  try {
    const {
      institution_code,
      name,
      category,
      state,
      city,
      address,
      pincode,
      contact_email,
      contact_phone,
      established_year,
      status
    } = req.body;

    if (!institution_code || !name || !state || !city || !contact_email) {
      return res.status(400).json({
        success: false,
        message: 'Institution Code, Name, State, City, and Contact Email are required fields.'
      });
    }

    // Check duplicate code
    const [existing] = await pool.query(
      'SELECT id FROM institutions WHERE institution_code = ?',
      [institution_code.trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `An institution with code "${institution_code}" already exists.`
      });
    }

    const [result] = await pool.query(
      `INSERT INTO institutions (institution_code, name, category, state, city, address, pincode, contact_email, contact_phone, established_year, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        institution_code.trim(),
        name.trim(),
        category || 'Engineering & Technology',
        state.trim(),
        city.trim(),
        address || '',
        pincode || '',
        contact_email.trim().toLowerCase(),
        contact_phone || '',
        established_year ? parseInt(established_year, 10) : null,
        status || 'Active'
      ]
    );

    await logAuditFromReq(
      req,
      'CREATE_INSTITUTION',
      'INSTITUTION',
      result.insertId,
      `Created institution "${name}" with code ${institution_code}.`
    );

    return res.status(201).json({
      success: true,
      message: 'Institution created successfully.',
      institutionId: result.insertId
    });
  } catch (error) {
    console.error('createInstitution error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create institution.' });
  }
};

// Update institution
exports.updateInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      state,
      city,
      address,
      pincode,
      contact_email,
      contact_phone,
      established_year,
      status
    } = req.body;

    // Check isolation if institution role
    if (req.user.role === 'INSTITUTION' && parseInt(req.user.institution_id, 10) !== parseInt(id, 10)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify other institutions.'
      });
    }

    // Institution user cannot change status or name/category; only contact details
    let updateFields = [];
    let params = [];

    if (req.user.role === 'ADMIN' || req.user.role === 'OFFICIAL') {
      if (name !== undefined) { updateFields.push('name = ?'); params.push(name.trim()); }
      if (category !== undefined) { updateFields.push('category = ?'); params.push(category); }
      if (state !== undefined) { updateFields.push('state = ?'); params.push(state.trim()); }
      if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }
    }

    if (city !== undefined) { updateFields.push('city = ?'); params.push(city.trim()); }
    if (address !== undefined) { updateFields.push('address = ?'); params.push(address); }
    if (pincode !== undefined) { updateFields.push('pincode = ?'); params.push(pincode); }
    if (contact_email !== undefined) { updateFields.push('contact_email = ?'); params.push(contact_email.trim().toLowerCase()); }
    if (contact_phone !== undefined) { updateFields.push('contact_phone = ?'); params.push(contact_phone); }
    if (established_year !== undefined) { updateFields.push('established_year = ?'); params.push(established_year ? parseInt(established_year, 10) : null); }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid update fields provided.' });
    }

    params.push(id);
    await pool.query(
      `UPDATE institutions SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    await logAuditFromReq(
      req,
      'UPDATE_INSTITUTION',
      'INSTITUTION',
      id,
      `Updated institution details for ID ${id}.`
    );

    return res.json({ success: true, message: 'Institution updated successfully.' });
  } catch (error) {
    console.error('updateInstitution error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update institution.' });
  }
};
