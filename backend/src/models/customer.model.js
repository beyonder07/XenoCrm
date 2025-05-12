const mongoose = require('mongoose');
const { isEmail } = require('validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         name:
 *           type: string
 *           description: Customer's full name
 *         email:
 *           type: string
 *           format: email
 *           description: Customer's email address (must be unique)
 *         phone:
 *           type: string
 *           description: Customer's phone number
 *         location:
 *           type: string
 *           description: Customer's location or address
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags or labels for customer categorization
 *         totalSpend:
 *           type: number
 *           description: Total amount spent by customer
 *         orderCount:
 *           type: number
 *           description: Number of orders placed by customer
 *         lastOrderDate:
 *           type: date
 *           description: Date of customer's most recent order
 *         avatar:
 *           type: string
 *           format: uri
 *           description: URL to customer's profile image
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether customer is active
 *         metadata:
 *           type: object
 *           description: Additional custom properties
 *         createdAt:
 *           type: date
 *           description: Timestamp when customer was created
 *         updatedAt:
 *           type: date
 *           description: Timestamp when customer was last updated
 */
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
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
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    tags: [String],
    totalSpend: {
      type: Number,
      default: 0,
    },
    orderCount: {
      type: Number,
      default: 0,
    },
    lastOrderDate: {
      type: Date,
    },
    avatar: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
customerSchema.index({ name: 1 });
customerSchema.index({ lastOrderDate: 1 });
customerSchema.index({ totalSpend: 1 });
customerSchema.index({ tags: 1 });
customerSchema.index({ isActive: 1 });
customerSchema.index({ location: 1 });
customerSchema.index({ 
    name: 'text', 
    email: 'text',
    location: 'text' 
  });
// Virtual for average order value
customerSchema.virtual('averageOrderValue').get(function () {
  if (this.orderCount === 0) return 0;
  return this.totalSpend / this.orderCount;
});

// Virtual for days since last order
customerSchema.virtual('daysSinceLastOrder').get(function () {
  if (!this.lastOrderDate) return null;
  
  const now = new Date();
  const lastOrder = new Date(this.lastOrderDate);
  
  const diffTime = Math.abs(now - lastOrder);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Method to update customer spend and order statistics
customerSchema.methods.updateOrderStats = async function (orderAmount) {
  this.totalSpend += orderAmount;
  this.orderCount += 1;
  this.lastOrderDate = new Date();
  
  await this.save();
  
  return this;
};

// Static method to find inactive customers
customerSchema.statics.findInactiveCustomers = function (daysThreshold = 90) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
  
  return this.find({
    lastOrderDate: { $lt: thresholdDate },
    isActive: true,
  });
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;