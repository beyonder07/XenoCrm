const AppError = require('../utils/appError');

/**
 * Middleware to handle 404 errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.notFound = (req, res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
};