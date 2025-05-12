const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    tags: [String],
    totalSpend: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    lastOrderDate: { type: Date },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Customer', customerSchema);