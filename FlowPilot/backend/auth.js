const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticate, authorize, enforceInstitutionAccess, JWT_SECRET } = require('./middleware/auth');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      institution_id: user.institution_id
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

async function hashPassword(plainText) {
  return bcrypt.hash(plainText, 10);
}

async function comparePassword(plainText, hash) {
  return bcrypt.compare(plainText, hash);
}

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  authenticate,
  authorize,
  enforceInstitutionAccess,
  JWT_SECRET
};
