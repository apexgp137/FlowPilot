const pool = require('../db');
const { logAuditFromReq } = require('../services/auditService');

const VALID_STAGES = [
  'Submitted',
  'Scrutiny',
  'EVC / Review',
  'SAC/SHC',
  'Final Decision',
  'Completed',
  'Returned for Deficiency'
];

const VALID_STATUSES = [
  'Pending',
  'In Progress',
  'Returned',
  'Approved',
  'Rejected'
];

const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

// Helper to generate unique reference number
async function generateReferenceNumber() {
  const year = new Date().getFullYear();
  const [rows] = await pool.query(
    'SELECT MAX(id) as maxId FROM applications'
  );
  const nextNumber = (rows[0].maxId || 0) + 1001;
  return `AICTE-${year}-APP-${nextNumber}`;
}

// Get all applications with search and filters
exports.getAllApplications = async (req, res) => {
  try {
    const {
      search,
      status,
      stage,
      priority,
      institution_id,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    let query = `
      SELECT a.*,
             i.name AS institution_name,
             i.institution_code,
             i.state AS institution_state,
             u.name AS creator_name,
             u.email AS creator_email
      FROM applications a
      JOIN institutions i ON a.institution_id = i.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Enforce data isolation for institution users
    if (req.user.role === 'INSTITUTION') {
      query += ` AND a.institution_id = ?`;
      params.push(req.user.institution_id);
    } else if (institution_id) {
      query += ` AND a.institution_id = ?`;
      params.push(institution_id);
    }

    if (search) {
      query += ` AND (a.reference_no LIKE ? OR i.name LIKE ? OR a.application_type LIKE ? OR a.notes LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    if (stage) {
      query += ` AND a.current_stage = ?`;
      params.push(stage);
    }

    if (priority) {
      query += ` AND a.priority = ?`;
      params.push(priority);
    }

    // Safe sorting fields
    const allowedSortFields = ['created_at', 'due_date', 'submission_date', 'reference_no', 'priority', 'status', 'current_stage'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? `a.${sortBy}` : 'a.created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

    const [applications] = await pool.query(query, params);
    return res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('getAllApplications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve applications.' });
  }
};

// Get single application with details, history, EVC, and compliance
exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const [apps] = await pool.query(
      `SELECT a.*,
              i.name AS institution_name,
              i.institution_code,
              i.category AS institution_category,
              i.state AS institution_state,
              i.city AS institution_city,
              i.contact_email AS institution_email,
              i.contact_phone AS institution_phone,
              u.name AS creator_name,
              u.email AS creator_email
       FROM applications a
       JOIN institutions i ON a.institution_id = i.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = ?`,
      [id]
    );

    if (apps.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const application = apps[0];

    // Enforce data isolation
    if (req.user.role === 'INSTITUTION' && parseInt(req.user.institution_id, 10) !== parseInt(application.institution_id, 10)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view applications from other institutions.'
      });
    }

    // Get workflow history
    const [history] = await pool.query(
      `SELECT wh.*, u.name AS changed_by_name, u.role AS changed_by_role, u.email AS changed_by_email
       FROM workflow_history wh
       JOIN users u ON wh.changed_by = u.id
       WHERE wh.application_id = ?
       ORDER BY wh.created_at DESC`,
      [id]
    );

    // Get associated EVC visits
    const [evcVisits] = await pool.query(
      `SELECT ev.*, u.name AS scheduled_by_name
       FROM evc_visits ev
       LEFT JOIN users u ON ev.scheduled_by = u.id
       WHERE ev.application_id = ?
       ORDER BY ev.proposed_visit_date DESC`,
      [id]
    );

    // Get associated compliance items
    const [compliance] = await pool.query(
      `SELECT c.*, u.name AS verified_by_name
       FROM compliance_items c
       LEFT JOIN users u ON c.verified_by = u.id
       WHERE c.application_id = ? OR c.institution_id = ?
       ORDER BY c.due_date ASC`,
      [id, application.institution_id]
    );

    // Get document checks
    const [docChecks] = await pool.query(
      `SELECT * FROM document_checks WHERE application_id = ? ORDER BY created_at DESC`,
      [id]
    );

    return res.json({
      success: true,
      data: {
        ...application,
        history,
        evcVisits,
        compliance,
        docChecks
      }
    });
  } catch (error) {
    console.error('getApplicationById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve application details.' });
  }
};

// Create a new application
exports.createApplication = async (req, res) => {
  try {
    const {
      institution_id,
      application_type,
      academic_year = '2026-2027',
      workflow_route = 'Standard Bureau Review',
      priority = 'Medium',
      submission_date,
      due_date,
      program_level = 'Undergraduate',
      intake_requested = 0,
      notes
    } = req.body;

    // Determine target institution ID
    let targetInstId = institution_id;
    if (req.user.role === 'INSTITUTION') {
      targetInstId = req.user.institution_id;
    }

    if (!targetInstId || !application_type) {
      return res.status(400).json({
        success: false,
        message: 'Institution and Application Type are required.'
      });
    }

    // Verify institution exists
    const [inst] = await pool.query('SELECT id, name FROM institutions WHERE id = ?', [targetInstId]);
    if (inst.length === 0) {
      return res.status(404).json({ success: false, message: 'Specified institution does not exist.' });
    }

    const reference_no = await generateReferenceNumber();
    const subDate = submission_date || new Date().toISOString().split('T')[0];
    
    // Default due date = 45 days from submission if not provided
    let calculatedDueDate = due_date;
    if (!calculatedDueDate) {
      const d = new Date(subDate);
      d.setDate(d.getDate() + 45);
      calculatedDueDate = d.toISOString().split('T')[0];
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [insertRes] = await connection.query(
        `INSERT INTO applications (
          reference_no, institution_id, application_type, academic_year,
          workflow_route, current_stage, status, priority,
          submission_date, due_date, program_level, intake_requested, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, 'Submitted', 'Pending', ?, ?, ?, ?, ?, ?, ?)`,
        [
          reference_no,
          targetInstId,
          application_type,
          academic_year,
          workflow_route,
          VALID_PRIORITIES.includes(priority) ? priority : 'Medium',
          subDate,
          calculatedDueDate,
          program_level,
          parseInt(intake_requested, 10) || 0,
          notes || '',
          req.user.id
        ]
      );

      const appId = insertRes.insertId;

      // Log initial workflow history record
      await connection.query(
        `INSERT INTO workflow_history (application_id, previous_stage, new_stage, previous_status, new_status, action_type, changed_by, remarks)
         VALUES (?, 'None', 'Submitted', 'None', 'Pending', 'APPLICATION_SUBMITTED', ?, ?)`,
        [
          appId,
          req.user.id,
          `Application ${reference_no} submitted by ${req.user.name} for ${inst[0].name}.`
        ]
      );

      // Create an alert for bureau review
      await connection.query(
        `INSERT INTO alerts (title, category, institution_id, application_id, due_date, priority)
         VALUES (?, 'Workflow Action Pending', ?, ?, ?, ?)`,
        [
          `New Application ${reference_no} submitted by ${inst[0].name}`,
          targetInstId,
          appId,
          calculatedDueDate,
          priority === 'High' ? 'High' : 'Medium'
        ]
      );

      // Record audit
      await logAuditFromReq(
        req,
        'CREATE_APPLICATION',
        'APPLICATION',
        reference_no,
        `Created application ${reference_no} (${application_type}) for ${inst[0].name}.`,
        connection
      );

      await connection.commit();

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully.',
        applicationId: appId,
        reference_no
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('createApplication error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create application.' });
  }
};

// Update workflow stage and status (Atomic Transaction)
exports.updateApplicationWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_stage, status, priority, remarks, due_date } = req.body;

    // Only ADMIN and OFFICIAL can transition stages and approve/reject
    if (req.user.role === 'INSTITUTION') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Institution users are not authorized to update workflow stages or decision statuses.'
      });
    }

    // Fetch existing application
    const [existing] = await pool.query(
      'SELECT * FROM applications WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const currentApp = existing[0];

    // Validate stage if provided
    const nextStage = current_stage !== undefined ? current_stage : currentApp.current_stage;
    if (!VALID_STAGES.includes(nextStage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage "${nextStage}". Must be one of: ${VALID_STAGES.join(', ')}`
      });
    }

    // Validate status if provided
    const nextStatus = status !== undefined ? status : currentApp.status;
    if (!VALID_STATUSES.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${nextStatus}". Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const nextPriority = priority !== undefined ? priority : currentApp.priority;
    const nextDueDate = due_date !== undefined ? due_date : currentApp.due_date;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update application
      await connection.query(
        `UPDATE applications
         SET current_stage = ?, status = ?, priority = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [nextStage, nextStatus, nextPriority, nextDueDate, id]
      );

      // Record workflow history if stage or status changed
      if (nextStage !== currentApp.current_stage || nextStatus !== currentApp.status) {
        const actionType = nextStatus === 'Approved' ? 'APPROVAL_DECISION' :
                           nextStatus === 'Rejected' ? 'REJECTION_DECISION' :
                           nextStatus === 'Returned' ? 'RETURNED_DEFICIENCY' : 'STAGE_TRANSITION';

        await connection.query(
          `INSERT INTO workflow_history (application_id, previous_stage, new_stage, previous_status, new_status, action_type, changed_by, remarks)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            currentApp.current_stage,
            nextStage,
            currentApp.status,
            nextStatus,
            actionType,
            req.user.id,
            remarks || `Status transitioned to ${nextStatus} at stage ${nextStage} by ${req.user.name}.`
          ]
        );
      }

      // Record audit
      await logAuditFromReq(
        req,
        'UPDATE_WORKFLOW',
        'APPLICATION',
        currentApp.reference_no,
        `Updated ${currentApp.reference_no}: Stage [${currentApp.current_stage} -> ${nextStage}], Status [${currentApp.status} -> ${nextStatus}]. Remarks: ${remarks || 'None'}`,
        connection
      );

      // If status changed to Approved or Rejected, close/mark alerts or add decision alert
      if (nextStatus === 'Approved' || nextStatus === 'Rejected') {
        await connection.query(
          `INSERT INTO alerts (title, category, institution_id, application_id, priority)
           VALUES (?, 'General Notice', ?, ?, ?)`,
          [
            `Final Decision on ${currentApp.reference_no}: ${nextStatus}`,
            currentApp.institution_id,
            id,
            'High'
          ]
        );
      }

      await connection.commit();

      return res.json({
        success: true,
        message: 'Application workflow updated successfully.',
        data: {
          id: parseInt(id, 10),
          reference_no: currentApp.reference_no,
          current_stage: nextStage,
          status: nextStatus,
          priority: nextPriority
        }
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('updateApplicationWorkflow error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update application workflow.' });
  }
};

// Get workflow history for an application
exports.getApplicationHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check application exists and isolation
    const [apps] = await pool.query('SELECT id, institution_id, reference_no FROM applications WHERE id = ?', [id]);
    if (apps.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (req.user.role === 'INSTITUTION' && parseInt(req.user.institution_id, 10) !== parseInt(apps[0].institution_id, 10)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const [history] = await pool.query(
      `SELECT wh.*, u.name AS changed_by_name, u.role AS changed_by_role, u.email AS changed_by_email
       FROM workflow_history wh
       JOIN users u ON wh.changed_by = u.id
       WHERE wh.application_id = ?
       ORDER BY wh.created_at DESC`,
      [id]
    );

    return res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    console.error('getApplicationHistory error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve workflow history.' });
  }
};
