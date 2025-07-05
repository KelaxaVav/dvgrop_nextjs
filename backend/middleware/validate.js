import { validationResult } from 'express-validator';
import ErrorResponse from '../utils/errorResponse.js';

// Middleware to validate request data
const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors for response
    const extractedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));

    return next(new ErrorResponse(extractedErrors, 400));
  };
};

export default validate;