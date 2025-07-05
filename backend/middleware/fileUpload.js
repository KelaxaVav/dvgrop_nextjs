import path from 'path';
import ErrorResponse from '../utils/errorResponse.js';

// Middleware for handling file uploads
const fileUpload = (options = {}) => (req, res, next) => {
  // Check if file exists
  if (!req.files) {
    return next();
  }

  const file = req.files.file;

  // Check if it's actually a file
  if (!file) {
    return next();
  }

  // Make sure the file is a valid type
  if (options.fileTypes && !options.fileTypes.some(type => file.mimetype.startsWith(type))) {
    return next(
      new ErrorResponse(
        `Please upload a valid file type (${options.fileTypes.join(', ')})`,
        400
      )
    );
  }

  // Check filesize
  if (options.maxSize && file.size > options.maxSize) {
    return next(
      new ErrorResponse(
        `Please upload a file less than ${options.maxSize / 1000000}MB`,
        400
      )
    );
  }

  // Create custom filename
  const filePrefix = options.filePrefix || 'file';
  file.name = `${filePrefix}_${Date.now()}${path.parse(file.name).ext}`;

  // Set the file on the request
  req.file = file;

  next();
};

export default fileUpload;