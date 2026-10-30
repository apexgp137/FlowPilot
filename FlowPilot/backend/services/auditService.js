const pool = require('../db');

/**
 * Log an audit trail entry
 * @param {Object} options
 * @param {number|null} options.userId
 * @param {string} options.userEmail
 * @param {string} options.userRole
 * @param {string} options.actionType (LOGIN, CREATE_APPLICATION, UPDATE_STAGE, etc.)
 * @param {string} options.entityType (APPLICATION, INSTITUTION, COMPLIANCE, etc.)
 * @param {string} options.entityId
 * @param {string} options.description
 * @param {string} options.ipAddress
 * @param {Object} [options.connection] Optional MySQL connection for transaction safety
 */
async function recordAudit({
  userId = null,
  userEmail = null,
  userRole = null,
  actionType,
  entityType,
  entityId = null,
  description,
  ipAddress = '127.0.0.1',
  connection = null
}) {
  const sql = `
    INSERT INTO audit_logs (user_id, user_email, user_role, action_type, entity_type, entity_id, description, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    userId,
    userEmail,
    userRole,
    actionType,
    entityType,
    entityId ? String(entityId) : null,
    description,
    ipAddress
  ];

  try {
    const executor = connection || pool;
    await executor.query(sql, params);
  } catch (error) {
    // Non-blocking error logging for audit trails so primary operations don't fail
    console.error('Failed to write audit log entry:', error.message);
  }
}

function logAuditFromReq(req, actionType, entityType, entityId, description, connection = null) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  return recordAudit({
    userId: req.user ? req.user.id : null,
    userEmail: req.user ? req.user.email : 'system/unauthenticated',
    userRole: req.user ? req.user.role : 'ANONYMOUS',
    actionType,
    entityType,
    entityId,
    description,
    ipAddress: String(ip).replace('::ffff:', ''),
    connection
  });
}

module.exports = {
  recordAudit,
  logAuditFromReq
};
