const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    rules: {
      conditionType: {
        type: String,
        enum: ['AND', 'OR'],
        default: 'AND',
      },
      conditions: [
        {
          field: { type: String, required: true },
          operator: { type: String, required: true },
          value: { type: mongoose.Schema.Types.Mixed, required: true },
        },
      ],
    },
    audienceSize: { type: Number, default: 0 },
    lastRefreshed: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    campaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Segment', segmentSchema); 