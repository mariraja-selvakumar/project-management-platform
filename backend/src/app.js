const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { projectTaskRouter, taskRouter } = require('./routes/taskRoutes');
const usersRoutes = require('./routes/usersRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Standard middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Request logging middleware (optional but good practice)
app.use((req, res, next) => {
  const logger = require('./utils/logger');
  logger.http(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/projects/:id/tasks', projectTaskRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/users', usersRoutes);

// Catch 404 errors
app.use((req, res, next) => {
  const { notFound } = require('./utils/errors');
  next(notFound('Requested API route not found'));
});

// Error handler middleware
app.use(errorHandler);

// Bind port if not running test suite
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    const logger = require('./utils/logger');
    logger.info(`Server running on port ${PORT}`);
  });
}

module.exports = app;
