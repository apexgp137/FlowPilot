const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const pool = require('./db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const institutionRoutes = require('./routes/institutionRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const evcRoutes = require('./routes/evcRoutes');
const alertRoutes = require('./routes/alertRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const auditRoutes = require('./routes/auditRoutes');
const userRoutes = require('./routes/userRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic rate limiting on login route
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});
app.use('/api/auth/login', loginLimiter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const isDbConnected = await pool.testConnection();
    res.json({
      status: 'UP',
      service: 'FlowPilot Backend API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: isDbConnected ? 'Connected (MySQL)' : 'Degraded'
    });
  } catch (error) {
    res.status(503).json({
      status: 'DEGRADED',
      service: 'FlowPilot Backend API',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/evc', evcRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/document-check', documentRoutes);

// 404 Route handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`=========================================`);
    console.log(`FlowPilot Backend Service running on port ${PORT}`);
    console.log(`API Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=========================================`);
    try {
      const ok = await pool.testConnection();
      if (ok) {
        console.log('Database connected successfully to MySQL.');
      }
    } catch (e) {
      console.error('Initial DB connection warning:', e.message);
    }
  });
}

module.exports = app;
