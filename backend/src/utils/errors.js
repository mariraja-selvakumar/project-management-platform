class AppError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errors = {
  invalidCredentials: (message = 'Invalid credentials') => new AppError('INVALID_CREDENTIALS', message),
  unauthorized: (message = 'Unauthorized') => new AppError('UNAUTHORIZED', message),
  forbidden: (message = 'Forbidden') => new AppError('FORBIDDEN', message),
  notFound: (message = 'Not found') => new AppError('NOT_FOUND', message),
  validationError: (details, message = 'Validation error') => new AppError('VALIDATION_ERROR', message, details),
  badRequest: (message = 'Bad request') => new AppError('BAD_REQUEST', message),
};

module.exports = {
  AppError,
  ...errors,
};
