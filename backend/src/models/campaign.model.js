const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Campaign:
 *       type: object
 *       required:
 *         - name
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         name:
 *           type: string
 *           description: Campaign name
 *         description:
 *           type: string
 *           description: Campaign description
 *         message:
 *           type: string
 *           description: Message template for the campaign
 *         status:
 *           type: string
 *           enum: [Draft, Active, Completed, Failed]
 *           default: Draft
 *           description: Current status of the campaign
 *         segmentId:
 *           type: string
 *           description: Reference to a predefined segment
 *         customRules:
 *           type: object
 *           description: Custom segment rules
 *         audienceSize:
 *           type: number
 *           description: Total number of recipients
 *         createdBy:
 *           type: string
 *           description: User who created the campaign
 *         scheduledAt:
 *           type: date
 *           description: When the campaign is scheduled to be sent
 *         sentAt:
 *           type: date
 *           description: When the campaign was actually sent
 *         completedAt:
 *           type: date
 *           description: When the campaign delivery was completed
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags or categories for the campaign
 *         stats:
 *           type: object
 *           properties:
 *             delivered:
 *               type: number
 *               description: Number of successfully delivered messages
 *             failed:
 *               type: number
 *               description: Number of failed message deliveries
 *             pending:
 *               type: number
 *               description: Number of pending message deliveries
 *             deliveredPercentage:
 *               type: number
 *               description: Percentage of successful deliveries
 *             failedPercentage:
 *               type: number
 *               description: Percentage of failed deliveries
 *         metadata:
 *           type: object
 *           description: Additional custom properties
 *         createdAt:
 *           type: date
 *           description: Timestamp when campaign was created
 *         updatedAt:
 *           type: date
 *           description: Timestamp when campaign was last updated
 */
const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message template is required'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Completed', 'Failed'],
      default: 'Draft',
    },
    segmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Segment',
    },
    customRules: {
      type: mongoose.Schema.Types.Mixed,
    },
    audienceSize: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    scheduledAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    tags: [String],
    stats: {
      delivered: {
        type: Number,
        default: 0,
      },
      failed: {
        type: Number,
        default: 0,
      },
      pending: {
        type: Number,
        default: 0,
      },
      deliveredPercentage: {
        type: Number,
        default: 0,
      },
      failedPercentage: {
        type: Number,
        default: 0,
      },
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
campaignSchema.index({ status: 1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ segmentId: 1 });
campaignSchema.index({ scheduledAt: 1 });
campaignSchema.index({ createdBy: 1 });
campaignSchema.index({ tags: 1 });

// Calculate stats percentages before saving
campaignSchema.pre('save', function (next) {
  if (this.audienceSize > 0) {
    this.stats.deliveredPercentage = parseFloat(
      ((this.stats.delivered / this.audienceSize) * 100).toFixed(2)
    );
    this.stats.failedPercentage = parseFloat(
      ((this.stats.failed / this.audienceSize) * 100).toFixed(2)
    );
    
    // Update pending count
    this.stats.pending = this.audienceSize - this.stats.delivered - this.stats.failed;
    
    // Auto-update status if all messages are delivered or failed
    if (this.stats.delivered + this.stats.failed === this.audienceSize) {
      this.status = 'Completed';
      this.completedAt = new Date();
    }
  }
  
  next();
});

// Populate created by user when querying campaigns
campaignSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'createdBy',
    select: 'name email',
  });
  
  next();
});

// Virtual for completion percentage
campaignSchema.virtual('completionPercentage').get(function () {
  if (this.audienceSize === 0) return 0;
  
  return parseFloat(
    (((this.stats.delivered + this.stats.failed) / this.audienceSize) * 100).toFixed(2)
  );
});

// Virtual for campaign age in days
campaignSchema.virtual('ageInDays').get(function () {
  const now = new Date();
  const created = new Date(this.createdAt);
  
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Method to update delivery stats
campaignSchema.methods.updateStats = async function (deliveryStatus) {
  if (deliveryStatus === 'SENT') {
    this.stats.delivered += 1;
  } else if (deliveryStatus === 'FAILED') {
    this.stats.failed += 1;
  }
  
  await this.save();
  
  return this;
};

// Static method to find due campaigns
campaignSchema.statics.findDueCampaigns = function () {
  const now = new Date();
  
  return this.find({
    status: 'Draft',
    scheduledAt: { $lte: now },
  });
};

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;