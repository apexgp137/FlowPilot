const pool = require('../db');

exports.getAuditLogs = async (req, res) => {
  try {
    const { action_type, entity_type, search, start_date, end_date, limit = 100 } = req.query;

    let query = `
      SELECT a.*, u.name AS user_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (action_type) {
      query += ` AND a.action_type = ?`;
      params.push(action_type);
    }

    if (entity_type) {
      query += ` AND a.entity_type = ?`;
      params.push(entity_type);
    }

    if (search) {
      query += ` AND (a.description LIKE ? OR a.entity_id LIKE ? OR a.user_email LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (start_date) {
      query += ` AND a.created_at >= ?`;
      params.push(`${start_date} 00:00:00`);
    }

    if (end_date) {
      query += ` AND a.created_at <= ?`;
      params.push(`${end_date} 23:59:59`);
    }

    query += ` ORDER BY a.created_at DESC LIMIT ?`;
    params.push(Math.min(parseInt(limit, 10) || 100, 500));

    const [logs] = await pool.query(query, params);
    return res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    console.error('getAuditLogs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
};
