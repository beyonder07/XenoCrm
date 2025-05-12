const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     CommunicationLog:
 *       type: object
 *       required:
 *         - campaignId
 *         - customerId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         campaignId:
 *           type: string
 *           description: Reference to the campaign
 *         customerId:
 *           type: string
 *           description: Reference to the customer
 *         status:
 *           type: string
 *           enum: [PENDING, SENT, FAILED]
 *           default: PENDING
 *           description: Delivery status
 *         message:
 *           type: string
 *           description: Personalized message content
 *         sentAt:
 *           type: date
 *           description: When the message was sent
 *         deliveredAt:
 *           type: date
 *           description: When the message was delivered
 *         errorMessage:
 *           type: string
 *           description: Error message if delivery failed
 *         metadata:
 *           type: object
 *           description: Additional properties or vendor response data
 *         createdAt:
 *           type: date
 *           description: Timestamp when log was created
 *         updatedAt:
 *           type: date
 *           description: Timestamp when log was last updated
 */
const communicationLogSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: [true, 'Campaign ID is required'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'FAILED'],
      default: 'PENDING',
    },
    message: {
      type: String,
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
communicationLogSchema.index({ campaignId: 1 });
communicationLogSchema.index({ customerId: 1 });
communicationLogSchema.index({ status: 1 });
communicationLogSchema.index({ campaignId: 1, status: 1 });
communicationLogSchema.index({ sentAt: -1 });
communicationLogSchema.index({ createdAt: -1 });

// Populate references for easier querying
communicationLogSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'customerId',
    select: 'name email',
  });
  
  next();
});

// Method to update delivery status
communicationLogSchema.methods.updateStatus = async function (status, errorMessage = null) {
  this.status = status;
  
  if (status === 'SENT') {
    this.deliveredAt = new Date();
  } else if (status === 'FAILED') {
    this.errorMessage = errorMessage;
  }
  
  await this.save();
  
  // Update campaign stats
  const Campaign = mongoose.model('Campaign');
  const campaign = await Campaign.findById(this.campaignId);
  
  if (campaign) {
    await campaign.updateStats(status);
  }
  
  return this;
};

// Static method to create batch of logs
communicationLogSchema.statics.createBatch = async function (campaignId, customerIds, messageTemplate) {
  const logs = customerIds.map(customerId => ({
    campaignId,
    customerId,
    status: 'PENDING',
    message: messageTemplate, // Will be personalized later
  }));
  
  return this.insertMany(logs);
};

// Static method to find pending logs for processing
communicationLogSchema.statics.findPendingBatch = function (campaignId, batchSize = 100) {
  return this.find({
    campaignId,
    status: 'PENDING',
  })
    .limit(batchSize)
    .sort({ createdAt: 1 });
};

const CommunicationLog = mongoose.model('CommunicationLog', communicationLogSchema);

module.exports = CommunicationLog;