const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Completed', 'Failed'],
      default: 'Draft',
    },
    segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment' },
    customRules: { type: mongoose.Schema.Types.Mixed },
    audienceSize: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    completedAt: { type: Date },
    tags: [String],
    stats: {
      delivered: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      deliveredPercentage: { type: Number, default: 0 },
      failedPercentage: { type: Number, default: 0 },
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Static method to find campaigns that are scheduled and due for processing.
 * @returns {Promise<Array>} List of due campaigns
 */
campaignSchema.statics.findDueCampaigns = async function () {
  const now = new Date();
  return this.find({
    status: 'Scheduled',
    scheduledAt: { $lte: now },
  });
};

module.exports = mongoose.model('Campaign', campaignSchema);