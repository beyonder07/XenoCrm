/**
 * Custom error class for operational errors
 * @extends Error
 */
class AppError extends Error {
    /**
     * Create a new AppError
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     */
    constructor(message, statusCode) {
      super(message);
      
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true; // Mark as operational error for proper handling
      
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = AppError;