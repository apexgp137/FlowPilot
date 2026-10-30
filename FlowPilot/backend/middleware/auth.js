const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'aicte_flowguard_secure_fallback_secret_key';

// Authenticate JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Session expired. Please log in again.'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token.'
      });
    }

    // Verify user exists and is active in database
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.institution_id, u.designation, u.phone, u.is_active,
              i.name AS institution_name, i.institution_code
       FROM users u
       LEFT JOIN institutions i ON u.institution_id = i.id
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive or no longer exists.'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error.'
    });
  }
};

// Authorize specific roles
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required.'
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${roles.join(', ')}] permissions. Current role: ${req.user.role}.`
      });
    }

    next();
  };
};

// Institution isolation check helper
// If user is INSTITUTION, they can only view or act on their own institution_id
const enforceInstitutionAccess = (req, res, next) => {
  if (req.user && req.user.role === 'INSTITUTION') {
    const requestedInstitutionId = req.params.institutionId || req.query.institution_id || req.body.institution_id;
    if (requestedInstitutionId && parseInt(requestedInstitutionId, 10) !== parseInt(req.user.institution_id, 10)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are only permitted to access records belonging to your assigned institution.'
      });
    }
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  enforceInstitutionAccess,
  JWT_SECRET
};
