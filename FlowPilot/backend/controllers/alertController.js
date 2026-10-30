const pool = require('../db');

// Get alerts
exports.getAllAlerts = async (req, res) => {
  try {
    const { category, priority, is_read } = req.query;

    let query = `
      SELECT al.*,
             i.name AS institution_name,
             i.institution_code,
             a.reference_no AS application_ref,
             c.requirement_title AS compliance_title
      FROM alerts al
      LEFT JOIN institutions i ON al.institution_id = i.id
      LEFT JOIN applications a ON al.application_id = a.id
      LEFT JOIN compliance_items c ON al.compliance_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Institution isolation
    if (req.user.role === 'INSTITUTION') {
      query += ` AND (al.institution_id = ? OR al.institution_id IS NULL)`;
      params.push(req.user.institution_id);
    }

    if (category) {
      query += ` AND al.category = ?`;
      params.push(category);
    }

    if (priority) {
      query += ` AND al.priority = ?`;
      params.push(priority);
    }

    if (is_read !== undefined) {
      query += ` AND al.is_read = ?`;
      params.push(is_read === 'true' || is_read === '1' ? 1 : 0);
    }

    query += ` ORDER BY al.is_read ASC, al.created_at DESC`;

    const [alerts] = await pool.query(query, params);
    return res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    console.error('getAllAlerts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve alerts.' });
  }
};

// Get unread alerts count
exports.getUnreadCount = async (req, res) => {
  try {
    let query = `SELECT COUNT(*) AS unread_count FROM alerts WHERE is_read = 0`;
    const params = [];

    if (req.user.role === 'INSTITUTION') {
      query += ` AND (institution_id = ? OR institution_id IS NULL)`;
      params.push(req.user.institution_id);
    }

    const [rows] = await pool.query(query, params);
    return res.json({ success: true, count: rows[0].unread_count || 0 });
  } catch (error) {
    console.error('getUnreadCount error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve unread alert count.' });
  }
};

// Mark an alert as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    let query = `UPDATE alerts SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const params = [id];

    if (req.user.role === 'INSTITUTION') {
      query += ` AND (institution_id = ? OR institution_id IS NULL)`;
      params.push(req.user.institution_id);
    }

    await pool.query(query, params);
    return res.json({ success: true, message: 'Alert marked as read.' });
  } catch (error) {
    console.error('markAsRead error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update alert.' });
  }
};

// Mark all alerts as read
exports.markAllAsRead = async (req, res) => {
  try {
    let query = `UPDATE alerts SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE is_read = 0`;
    const params = [];

    if (req.user.role === 'INSTITUTION') {
      query += ` AND (institution_id = ? OR institution_id IS NULL)`;
      params.push(req.user.institution_id);
    }

    await pool.query(query, params);
    return res.json({ success: true, message: 'All alerts marked as read.' });
  } catch (error) {
    console.error('markAllAsRead error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update alerts.' });
  }
};
