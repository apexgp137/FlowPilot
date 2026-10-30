const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aicte_flowguard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

// Test connection helper
pool.testConnection = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    return rows[0].result === 2;
  } finally {
    connection.release();
  }
};

module.exports = pool;
