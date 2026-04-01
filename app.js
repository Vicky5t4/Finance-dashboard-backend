const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const env = require('./src/config/env');
const { initializeDatabase } = require('./src/store/database');
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/users.routes');
const recordRoutes = require('./src/routes/records.routes');
const summaryRoutes = require('./src/routes/summary.routes');
const healthRoutes = require('./src/routes/health.routes');
const { notFoundHandler } = require('./src/middleware/notFound');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.clientOrigin === '*' ? true : env.clientOrigin.split(',') }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests. Please try again later.'
    }
  })
);

app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Finance Dashboard Backend Assignment API',
    docs: {
      health: 'GET /health',
      login: 'POST /api/auth/login',
      currentUser: 'GET /api/auth/me',
      users: 'GET/POST/PATCH/DELETE /api/users',
      records: 'GET/POST/PATCH/DELETE /api/records',
      summaryDashboard: 'GET /api/summary/dashboard'
    },
    demoCredentials: {
      admin: { email: 'admin@finance.local', password: 'Admin@123' },
      analyst: { email: 'analyst@finance.local', password: 'Analyst@123' },
      viewer: { email: 'viewer@finance.local', password: 'Viewer@123' }
    }
  });
});

app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/summary', summaryRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
