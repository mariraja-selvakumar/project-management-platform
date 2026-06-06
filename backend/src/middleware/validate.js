const { validationError } = require('../utils/errors');

/**
 * Express middleware to validate request using Zod schemas.
 * Replaces req.body, req.query, and req.params with parsed/validated versions.
 * Reject/strip unknown fields.
 * 
 * @param {import('zod').ZodSchema} schema Zod Schema containing body, query, or params
 */
const validate = (schema) => (req, res, next) => {
  const dataToValidate = {};
  if (schema.shape.body) dataToValidate.body = req.body;
  if (schema.shape.query) dataToValidate.query = req.query;
  if (schema.shape.params) dataToValidate.params = req.params;

  const result = schema.safeParse(dataToValidate);

  if (!result.success) {
    const details = result.error.errors.map((err) => {
      // Remove 'body.', 'query.', or 'params.' prefix from field paths
      const path = err.path.slice(1).join('.');
      return {
        field: path || 'request',
        message: err.message,
      };
    });
    return next(validationError(details));
  }

  // Update request with validated/sanitized data
  if (result.data.body !== undefined) req.body = result.data.body;
  if (result.data.query !== undefined) req.query = result.data.query;
  if (result.data.params !== undefined) req.params = result.data.params;

  next();
};

module.exports = validate;
