const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Create JWT token
 * @param {String} id - User ID
 * @returns {String} JWT token
 */
const createToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Set JWT cookie
 * @param {Object} res - Express response object
 * @param {String} token - JWT token
 */
const createSendToken = (user, statusCode, res) => {
  const token = createToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: config.nodeEnv === 'production',
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - passwordConfirm
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               passwordConfirm:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already in use
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Check if passwords match
    if (password !== passwordConfirm) {
      return next(new AppError('Passwords do not match', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 409));
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      isActive: true,
      role: 'user',
    });

    // Log successful registration
    logger.info(`New user registered: ${email}`);

    // Send token
    createSendToken(newUser, 201, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated', 403));
    }

    // Log successful login
    logger.info(`User logged in: ${email}`);

    // Send token
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout and clear cookie
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Not authenticated
 */
exports.getMe = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};

/**
 * Handle Google OAuth callback
 */
exports.googleAuthCallback = (req, res) => {
  try {
    const token = createToken(req.user._id);
    
    // Redirect to frontend with token
    res.redirect(`${config.google.defaultRedirect}?token=${token}`);
  } catch (err) {
    logger.error('Error in Google auth callback:', err);
    res.redirect(`${config.google.defaultRedirect}?error=Authentication failed`);
  }
};

/**
 * @swagger
 * /auth/update-password:
 *   patch:
 *     summary: Update current user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - newPasswordConfirm
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *               newPasswordConfirm:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Current password is incorrect
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    // Check if passwords match
    if (newPassword !== newPasswordConfirm) {
      return next(new AppError('New passwords do not match', 400));
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check if current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    // Log password change
    logger.info(`Password changed for user: ${user.email}`);

    // Log user in with new token
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};