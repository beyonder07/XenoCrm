const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { isEmail } = require('validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address (must be unique)
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           description: User's password (stored encrypted)
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *           description: User's role for access control
 *         avatar:
 *           type: string
 *           format: uri
 *           description: URL to user's profile image
 *         googleId:
 *           type: string
 *           description: Google OAuth ID for accounts linked with Google
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether user account is active
 *         passwordChangedAt:
 *           type: date
 *           description: Timestamp when password was last changed
 *         passwordResetToken:
 *           type: string
 *           description: Token for password reset (temporary)
 *         passwordResetExpires:
 *           type: date
 *           description: Expiration time for password reset token
 *         createdAt:
 *           type: date
 *           description: Timestamp when user was created
 *         updatedAt:
 *           type: date
 *           description: Timestamp when user was last updated
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [isEmail, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      minlength: 8,
      select: false, // Don't include in query results by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
    },
    googleId: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for performance
userSchema.index({ googleId: 1 });

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  // Only run this if password was modified
  if (!this.isModified('password') || !this.password) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Update passwordChangedAt
  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 sec for processing time

  next();
});

// Instance method to compare passwords
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password changed after JWT issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Token expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;