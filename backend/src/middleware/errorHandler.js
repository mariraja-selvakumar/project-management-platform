const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    details: err.details,
    code: err.code, // Log the error code
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  const statusMap = {
    INVALID_CREDENTIALS: 401,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 422,
    BAD_REQUEST: 400
  };

  // Prioritize err.code if available, otherwise use err.message
  const errorCode = err.code || err.message;
  const status = statusMap[errorCode] || 500;
  const errorName = status < 500 ? errorCode : 'INTERNAL_SERVER_ERROR';
  const displayMessage = status < 500 ? err.message : 'Internal server error';

  res.status(status).json({
    success: false,
    error: errorName,
    message: displayMessage,
    ...(err.details && { details: err.details })
  });
};
