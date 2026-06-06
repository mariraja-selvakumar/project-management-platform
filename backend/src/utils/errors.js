class AppError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errors = {
  invalidCredentials: (message = 'INVALID_CREDENTIALS') => new AppError('INVALID_CREDENTIALS'),
  unauthorized: (message = 'UNAUTHORIZED') => new AppError('UNAUTHORIZED'),
  forbidden: (message = 'FORBIDDEN') => new AppError('FORBIDDEN'),
  notFound: (message = 'NOT_FOUND') => new AppError('NOT_FOUND'),
  validationError: (details) => new AppError('VALIDATION_ERROR', details),
  badRequest: (message = 'BAD_REQUEST') => new AppError(message),
};

module.exports = {
  AppError,
  ...errors,
};
