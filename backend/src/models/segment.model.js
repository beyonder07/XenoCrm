const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Segment:
 *       type: object
 *       required:
 *         - name
 *         - rules
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         name:
 *           type: string
 *           description: Segment name
 *         description:
 *           type: string
 *           description: Segment description
 *         rules:
 *           type: object
 *           description: Rules for customer segmentation
 *           properties:
 *             conditionType:
 *               type: string
 *               enum: [AND, OR]
 *               description: Logic for combining conditions
 *             conditions:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                     description: Field to filter on
 *                   operator:
 *                     type: string
 *                     description: Comparison operator
 *                   value:
 *                     type: string
 *                     description: Value to compare against
 *         audienceSize:
 *           type: number
 *           description: Cached audience size
 *         lastRefreshed:
 *           type: date
 *           description: When the audience size was last calculated
 *         createdBy:
 *           type: string
 *           description: User who created the segment
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether segment is active
 *         campaigns:
 *           type: array
 *           items:
 *             type: string
 *           description: List of campaigns using this segment
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags or categories for the segment
 *         createdAt:
 *           type: date
 *           description: Timestamp when segment was created
 *         updatedAt:
 *           type: date
 *           description: Timestamp when segment was last updated
 */
const segmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Segment name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    rules: {
      conditionType: {
        type: String,
        enum: ['AND', 'OR'],
        default: 'AND',
      },
      conditions: [
        {
          field: {
            type: String,
            required: [true, 'Condition field is required'],
          },
          operator: {
            type: String,
            required: [true, 'Condition operator is required'],
          },
          value: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, 'Condition value is required'],
          },
        },
      ],
    },
    audienceSize: {
      type: Number,
      default: 0,
    },
    lastRefreshed: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    campaigns: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
      },
    ],
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
segmentSchema.index({ name: 1 });
segmentSchema.index({ createdAt: -1 });
segmentSchema.index({ createdBy: 1 });
segmentSchema.index({ isActive: 1 });
segmentSchema.index({ tags: 1 });


// Populate created by user when querying segments
segmentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'createdBy',
    select: 'name email',
  });
  
  next();
});

// Convert rules to MongoDB query
segmentSchema.methods.toMongoQuery = function () {
  // Build array of condition queries
  const conditionQueries = this.rules.conditions.map((condition) => {
    const query = {};
    
    // Handle different operators
    switch (condition.operator) {
      case 'equals':
        query[condition.field] = condition.value;
        break;
      case 'notEquals':
        query[condition.field] = { $ne: condition.value };
        break;
      case 'contains':
        query[condition.field] = { $regex: condition.value, $options: 'i' };
        break;
      case 'startsWith':
        query[condition.field] = { $regex: `^${condition.value}`, $options: 'i' };
        break;
      case 'endsWith':
        query[condition.field] = { $regex: `${condition.value}$`, $options: 'i' };
        break;
      case 'greaterThan':
        query[condition.field] = { $gt: condition.value };
        break;
      case 'lessThan':
        query[condition.field] = { $lt: condition.value };
        break;
      case 'greaterThanOrEqual':
        query[condition.field] = { $gte: condition.value };
        break;
      case 'lessThanOrEqual':
        query[condition.field] = { $lte: condition.value };
        break;
      case 'between':
        if (Array.isArray(condition.value) && condition.value.length >= 2) {
          query[condition.field] = { 
            $gte: condition.value[0], 
            $lte: condition.value[1] 
          };
        }
        break;
      case 'inLast':
        const days = parseInt(condition.value);
        if (!isNaN(days)) {
          const date = new Date();
          date.setDate(date.getDate() - days);
          query[condition.field] = { $gte: date };
        }
        break;
      case 'notInLast':
        const dayCount = parseInt(condition.value);
        if (!isNaN(dayCount)) {
          const date = new Date();
          date.setDate(date.getDate() - dayCount);
          query[condition.field] = { $lt: date };
        }
        break;
      case 'isNull':
        query[condition.field] = null;
        break;
      case 'isNotNull':
        query[condition.field] = { $ne: null };
        break;
      case 'exists':
        query[condition.field] = { $exists: true };
        break;
      case 'notExists':
        query[condition.field] = { $exists: false };
        break;
      default:
        // Default to equals for unknown operators
        query[condition.field] = condition.value;
    }
    
    return query;
  });
  
  // Combine conditions based on AND/OR logic
  let finalQuery = {};
  if (this.rules.conditionType === 'AND') {
    finalQuery = { $and: conditionQueries };
  } else {
    finalQuery = { $or: conditionQueries };
  }
  
  return finalQuery;
};

// Method to refresh audience size
segmentSchema.methods.refreshAudienceSize = async function () {
  const Customer = mongoose.model('Customer');
  const query = this.toMongoQuery();

  // Log the query for debugging
  console.log('Refreshing audience size with query:', query);

  const count = await Customer.countDocuments(query);

  // Log the count for debugging
  console.log('Audience size count:', count);

  this.audienceSize = count;
  this.lastRefreshed = new Date();

  try {
    // Save the segment and log the result
    const savedSegment = await this.save();
    console.log('Segment saved successfully:', savedSegment);
  } catch (err) {
    console.error('Error saving segment:', err);
    throw err; // Re-throw the error to ensure it is handled upstream
  }

  return count;
};

// Static method to find segments with stale audience size
segmentSchema.statics.findStaleSegments = function (hoursThreshold = 24) {
  const thresholdDate = new Date();
  thresholdDate.setHours(thresholdDate.getHours() - hoursThreshold);
  
  return this.find({
    $or: [
      { lastRefreshed: { $lt: thresholdDate } },
      { lastRefreshed: { $exists: false } },
    ],
    isActive: true,
  });
};

// Static method to get all segments with pagination and filters
segmentSchema.statics.getAllSegments = async function (query, page = 1, limit = 20, sort = '-createdAt') {
  const skip = (page - 1) * limit;

  const segments = await this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await this.countDocuments(query);

  return {
    segments,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

// Static method to get a segment by ID
segmentSchema.statics.getSegmentById = async function (id) {
  return this.findById(id);
};

// Static method to create a new segment
segmentSchema.statics.createSegment = async function (data) {
  const segment = await this.create(data);
  await segment.refreshAudienceSize(); // Refresh audience size after creation
  return segment;
};

// Static method to update a segment
segmentSchema.statics.updateSegmentById = async function (id, updates) {
  const segment = await this.findById(id);
  if (!segment) {
    throw new Error('Segment not found');
  }

  const rulesUpdated = updates.rules !== undefined;

  Object.keys(updates).forEach((key) => {
    segment[key] = updates[key];
  });

  await segment.save();

  if (rulesUpdated) {
    await segment.refreshAudienceSize();
  }

  return segment;
};

// Static method to delete a segment
segmentSchema.statics.deleteSegmentById = async function (id) {
  const segment = await this.findById(id);
  if (!segment) {
    throw new Error('Segment not found');
  }

  await this.findByIdAndDelete(id);
  return segment;
};

// Static method to preview audience size for a segment
segmentSchema.statics.previewSegment = async function (segmentId, rules) {
  const Customer = mongoose.model('Customer');

  let query;
  if (segmentId) {
    const segment = await this.findById(segmentId);
    if (!segment) {
      throw new Error('Segment not found');
    }
    query = segment.toMongoQuery();
  } else if (rules) {
    const tempSegment = new this({ name: 'Temporary', rules });
    query = tempSegment.toMongoQuery();
  } else {
    throw new Error('Either segmentId or rules must be provided');
  }

  const count = await Customer.countDocuments(query);
  const sampleCustomers = await Customer.find(query).limit(5);

  return { count, sampleCustomers };
};

// Static method to refresh audience size for a segment
segmentSchema.statics.refreshSegmentSizeById = async function (id) {
  const segment = await this.findById(id);
  if (!segment) {
    throw new Error('Segment not found');
  }

  const count = await segment.refreshAudienceSize();
  return { segment, audienceSize: count };
};

// Static method to calculate segment performance metrics
segmentSchema.statics.getSegmentPerformance = async function (id) {
  const Campaign = mongoose.model('Campaign');
  const segment = await this.findById(id);
  if (!segment) {
    throw new Error('Segment not found');
  }

  const campaigns = await Campaign.find({ segmentId: segment._id });

  let totalDeliveryRate = 0;
  let campaignCount = 0;

  campaigns.forEach((campaign) => {
    if (campaign.audienceSize > 0 && campaign.stats && campaign.stats.delivered > 0) {
      totalDeliveryRate += (campaign.stats.delivered / campaign.audienceSize) * 100;
      campaignCount += 1;
    }
  });

  const avgDeliveryRate = campaignCount > 0 ? totalDeliveryRate / campaignCount : 0;

  return {
    segment: {
      id: segment._id,
      name: segment.name,
      audienceSize: segment.audienceSize,
    },
    performance: {
      campaignsCount: campaigns.length,
      latestCampaign: campaigns.length > 0
        ? {
            id: campaigns[0]._id,
            name: campaigns[0].name,
            createdAt: campaigns[0].createdAt,
          }
        : null,
      avgDeliveryRate,
    },
  };
};

const Segment = mongoose.model('Segment', segmentSchema);

module.exports = Segment;