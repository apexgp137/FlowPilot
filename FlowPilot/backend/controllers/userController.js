const pool = require('../db');
const { hashPassword } = require('../auth');
const { logAuditFromReq } = require('../services/auditService');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.institution_id, u.designation, u.phone,
              u.is_active, u.created_at, i.name AS institution_name, i.institution_code
       FROM users u
       LEFT JOIN institutions i ON u.institution_id = i.id
       ORDER BY u.created_at DESC`
    );
    return res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

// Create user (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, institution_id, designation, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required fields.'
      });
    }

    if (!['ADMIN', 'OFFICIAL', 'INSTITUTION'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be one of ADMIN, OFFICIAL, or INSTITUTION.'
      });
    }

    if (role === 'INSTITUTION' && !institution_id) {
      return res.status(400).json({
        success: false,
        message: 'Institution users must be linked to a valid institution.'
      });
    }

    // Check duplicate email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    const hashedPassword = await hashPassword(password);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, institution_id, designation, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        role,
        role === 'INSTITUTION' ? institution_id : null,
        designation || null,
        phone || null
      ]
    );

    const newUserId = result.insertId;

    await logAuditFromReq(
      req,
      'CREATE_USER',
      'USER',
      newUserId,
      `Created new user ${email} with role ${role}.`
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      userId: newUserId
    });
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
};

// Toggle user status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own administrative account.' });
    }

    const [existing] = await pool.query('SELECT id, email, is_active FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const newStatus = existing[0].is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

    await logAuditFromReq(
      req,
      newStatus === 1 ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      'USER',
      id,
      `Set user status of ${existing[0].email} to ${newStatus === 1 ? 'Active' : 'Inactive'}.`
    );

    return res.json({
      success: true,
      message: `User ${newStatus === 1 ? 'activated' : 'deactivated'} successfully.`
    });
  } catch (error) {
    console.error('toggleUserStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};
