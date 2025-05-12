const passport = require('passport');
const AppError = require('../utils/appError');

/**
 * Middleware to protect routes with JWT authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.protect = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(new AppError('Error authenticating user', 500));
    }
    
    if (!user) {
      return next(new AppError('You are not logged in. Please log in to get access', 401));
    }
    
    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support', 403));
    }
    
    // Add user to request object
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Middleware to restrict access based on user roles
 * @param {...String} roles - Allowed roles
 * @returns {Function} Express middleware
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You are not logged in. Please log in to get access', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    next();
  };
};

/**
 * Initialize Google OAuth authentication
 */
exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
});

/**
 * Handle Google OAuth callback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      return next(new AppError('Error authenticating with Google', 500));
    }
    
    if (!user) {
      return next(new AppError('Authentication failed', 401));
    }
    
    // Authentication successful, set user in req
    req.user = user;
    next();
  })(req, res, next);
};