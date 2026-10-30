const pool = require('../db');
const { logAuditFromReq } = require('../services/auditService');

const VALID_EVC_STATUSES = ['Proposed', 'Confirmed', 'Completed', 'Rescheduled', 'Cancelled'];

// Get all EVC visits
exports.getAllVisits = async (req, res) => {
  try {
    const { status, institution_id, search, upcoming_only } = req.query;

    let query = `
      SELECT ev.*,
             i.name AS institution_name,
             i.institution_code,
             i.city AS institution_city,
             i.state AS institution_state,
             a.reference_no AS application_ref,
             a.application_type,
             u.name AS scheduled_by_name
      FROM evc_visits ev
      JOIN institutions i ON ev.institution_id = i.id
      JOIN applications a ON ev.application_id = a.id
      LEFT JOIN users u ON ev.scheduled_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Enforce data isolation
    if (req.user.role === 'INSTITUTION') {
      query += ` AND ev.institution_id = ?`;
      params.push(req.user.institution_id);
    } else if (institution_id) {
      query += ` AND ev.institution_id = ?`;
      params.push(institution_id);
    }

    if (status) {
      query += ` AND ev.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (i.name LIKE ? OR a.reference_no LIKE ? OR ev.lead_expert_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (upcoming_only === 'true') {
      query += ` AND ev.proposed_visit_date >= CURRENT_DATE() AND ev.status NOT IN ('Completed', 'Cancelled')`;
    }

    query += ` ORDER BY ev.proposed_visit_date ASC`;

    const [visits] = await pool.query(query, params);
    return res.json({ success: true, count: visits.length, data: visits });
  } catch (error) {
    console.error('getAllVisits error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve EVC visits.' });
  }
};

// Schedule a new EVC visit
exports.scheduleVisit = async (req, res) => {
  try {
    const {
      application_id,
      institution_id,
      proposed_visit_date,
      lead_expert_name,
      expert_panel,
      visit_mode = 'Physical On-Site',
      status = 'Proposed',
      visit_notes
    } = req.body;

    if (!application_id || !proposed_visit_date) {
      return res.status(400).json({
        success: false,
        message: 'Application ID and Proposed Visit Date are required.'
      });
    }

    // Look up application to get its institution_id
    const [appRows] = await pool.query(
      'SELECT id, institution_id, reference_no FROM applications WHERE id = ?',
      [application_id]
    );

    if (appRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Associated application not found.' });
    }

    const app = appRows[0];
    const targetInstId = institution_id || app.institution_id;

    // Check institution isolation
    if (req.user.role === 'INSTITUTION' && parseInt(req.user.institution_id, 10) !== parseInt(targetInstId, 10)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const [result] = await pool.query(
      `INSERT INTO evc_visits (
        application_id, institution_id, proposed_visit_date, lead_expert_name,
        expert_panel, visit_mode, status, visit_notes, scheduled_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        application_id,
        targetInstId,
        proposed_visit_date,
        lead_expert_name || '',
        expert_panel || '',
        visit_mode,
        VALID_EVC_STATUSES.includes(status) ? status : 'Proposed',
        visit_notes || '',
        req.user.id
      ]
    );

    const visitId = result.insertId;

    // Create an alert
    await pool.query(
      `INSERT INTO alerts (title, category, institution_id, application_id, evc_id, due_date, priority)
       VALUES (?, 'Upcoming EVC', ?, ?, ?, ?, 'High')`,
      [
        `EVC Inspection Visit Scheduled for ${app.reference_no} (${proposed_visit_date})`,
        targetInstId,
        application_id,
        visitId,
        proposed_visit_date
      ]
    );

    await logAuditFromReq(
      req,
      'SCHEDULE_EVC',
      'EVC_VISIT',
      visitId,
      `Scheduled EVC inspection for application ${app.reference_no} on ${proposed_visit_date}. Status: ${status}.`
    );

    return res.status(201).json({
      success: true,
      message: 'EVC inspection scheduled successfully.',
      visitId
    });
  } catch (error) {
    console.error('scheduleVisit error:', error);
    return res.status(500).json({ success: false, message: 'Failed to schedule EVC visit.' });
  }
};

// Update EVC visit
exports.updateVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      proposed_visit_date,
      lead_expert_name,
      expert_panel,
      visit_mode,
      status,
      visit_notes,
      report_summary
    } = req.body;

    const [existing] = await pool.query(
      `SELECT ev.*, a.reference_no
       FROM evc_visits ev
       JOIN applications a ON ev.application_id = a.id
       WHERE ev.id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'EVC visit not found.' });
    }

    const currentVisit = existing[0];

    // Only ADMIN and OFFICIAL can update EVC status/expert panel
    if (req.user.role === 'INSTITUTION') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Institution users cannot modify official EVC scheduling or committee panel details.'
      });
    }

    if (status && !VALID_EVC_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid EVC status. Must be one of: ${VALID_EVC_STATUSES.join(', ')}`
      });
    }

    const nextStatus = status || currentVisit.status;
    const nextDate = proposed_visit_date || currentVisit.proposed_visit_date;

    await pool.query(
      `UPDATE evc_visits
       SET proposed_visit_date = ?, lead_expert_name = ?, expert_panel = ?,
           visit_mode = ?, status = ?, visit_notes = ?, report_summary = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        nextDate,
        lead_expert_name !== undefined ? lead_expert_name : currentVisit.lead_expert_name,
        expert_panel !== undefined ? expert_panel : currentVisit.expert_panel,
        visit_mode || currentVisit.visit_mode,
        nextStatus,
        visit_notes !== undefined ? visit_notes : currentVisit.visit_notes,
        report_summary !== undefined ? report_summary : currentVisit.report_summary,
        id
      ]
    );

    await logAuditFromReq(
      req,
      'UPDATE_EVC',
      'EVC_VISIT',
      id,
      `Updated EVC visit for ${currentVisit.reference_no}. Status: [${currentVisit.status} -> ${nextStatus}]. Date: ${nextDate}.`
    );

    return res.json({
      success: true,
      message: 'EVC visit updated successfully.'
    });
  } catch (error) {
    console.error('updateVisit error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update EVC visit.' });
  }
};
