const pool = require('../db');
const { generateToken, comparePassword } = require('../auth');
const { logAuditFromReq } = require('../services/auditService');

// Login handler
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.password, u.role, u.institution_id, u.designation, u.phone, u.is_active,
              i.name AS institution_name, i.institution_code
       FROM users u
       LEFT JOIN institutions i ON u.institution_id = i.id
       WHERE u.email = ?`,
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact the administrator.'
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Audit log
    await logAuditFromReq(
      { user, headers: req.headers, socket: req.socket },
      'LOGIN',
      'AUTH',
      `USER-${user.id}`,
      `User ${user.email} (${user.role}) logged in successfully.`
    );

    // Omit sensitive password hash
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institution_id: user.institution_id,
      institution_name: user.institution_name,
      institution_code: user.institution_code,
      designation: user.designation,
      phone: user.phone
    };

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during authentication.'
    });
  }
};

// Current authenticated user profile
exports.getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.'
    });
  }
};

// Logout handler
exports.logout = async (req, res) => {
  try {
    if (req.user) {
      await logAuditFromReq(
        req,
        'LOGOUT',
        'AUTH',
        `USER-${req.user.id}`,
        `User ${req.user.email} logged out.`
      );
    }
    return res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    return res.json({ success: true, message: 'Logged out.' });
  }
};
