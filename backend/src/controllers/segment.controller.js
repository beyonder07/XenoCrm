const Segment = require('../models/segment.model');
const Customer = require('../models/customer.model');
const Campaign = require('../models/campaign.model');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * @swagger
 * /segments:
 *   get:
 *     summary: Get all segments with pagination and filters
 *     tags: [Segments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Results per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or description
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, -name, createdAt, -createdAt, audienceSize, -audienceSize]
 *           default: -createdAt
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of segments
 *       401:
 *         description: Unauthorized
 */
exports.getAllSegments = async (req, res, next) => {
  try {
    // Build query
    const query = {};
    
    // Search by name or description
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    
    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    // Parse pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    
    // Parse sort
    let sort = '-createdAt'; // Default sort by newest
    if (req.query.sort) {
      sort = req.query.sort;
    }
    
    // Execute query with pagination
    const segments = await Segment.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Segment.countDocuments(query);
    
    // Send response
    res.status(200).json({
      status: 'success',
      results: segments.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
      },
      data: {
        segments,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /segments/{id}:
 *   get:
 *     summary: Get a specific segment by ID
 *     tags: [Segments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     responses:
 *       200:
 *         description: Segment details
 *       404:
 *         description: Segment not found
 */
exports.getSegment = async (req, res, next) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return next(new AppError('Segment not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        segment,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /segments:
 *   post:
 *     summary: Create a new segment
 *     tags: [Segments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Segment'
 *     responses:
 *       201:
 *         description: Segment created successfully
 *       400:
 *         description: Validation error
 */
exports.createSegment = async (req, res, next) => {
  try {
    // Check that rules are provided
    if (!req.body.rules || !req.body.rules.conditions || req.body.rules.conditions.length === 0) {
      return next(new AppError('Segment must include at least one condition', 400));
    }

    // Set creator
    req.body.createdBy = req.user._id;

    // Log the request body for debugging
    logger.info('Creating segment with data:', req.body);

    // Create new segment
    const segment = await Segment.create(req.body);

    // Log the created segment
    logger.info('Segment created in memory:', segment);

    // Calculate audience size
    const count = await segment.refreshAudienceSize();

    // Log the audience size
    logger.info(`Audience size calculated: ${count}`);

    // Log segment creation
    logger.info(`Segment created: ${segment.name} (${segment._id}) with ${count} customers`);

    res.status(201).json({
      status: 'success',
      data: {
        segment,
      },
    });
  } catch (err) {
    logger.error('Error creating segment:', err);

    // Check for validation errors
    if (err.name === 'ValidationError') {
      return next(new AppError(`Validation Error: ${err.message}`, 400));
    }

    next(err);
  }
};

/**
 * @swagger
 * /segments/{id}:
 *   patch:
 *     summary: Update a segment
 *     tags: [Segments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Segment updated successfully
 *       404:
 *         description: Segment not found
 */
exports.updateSegment = async (req, res, next) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return next(new AppError('Segment not found', 404));
    }
    
    // Check if rules are being updated
    const rulesUpdated = req.body.rules !== undefined;
    
    // Update segment
    Object.keys(req.body).forEach(key => {
      segment[key] = req.body[key];
    });
    
    await segment.save();
    
    // Refresh audience size if rules were updated
    if (rulesUpdated) {
      await segment.refreshAudienceSize();
    }
    
    // Log segment update
    logger.info(`Segment updated: ${segment.name} (${segment._id})`);
    
    res.status(200).json({
      status: 'success',
      data: {
        segment,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /segments/{id}:
 *   delete:
 *     summary: Delete a segment
 *     tags: [Segments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     responses:
 *       204:
 *         description: Segment deleted successfully
 *       404:
 *         description: Segment not found
 *       400:
 *         description: Segment is in use and cannot be deleted
 */
exports.deleteSegment = async (req, res, next) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return next(new AppError('Segment not found', 404));
    }
    
    // Check if segment is being used in any campaigns
    const campaignsUsingSegment = await Campaign.countDocuments({ segmentId: segment._id });
    
    if (campaignsUsingSegment > 0) {
      return next(new AppError(`Segment is used in ${campaignsUsingSegment} campaign(s) and cannot be deleted`, 400));
    }
    
    await Segment.findByIdAndDelete(req.params.id);
    
    // Log segment deletion
    logger.info(`Segment deleted: ${segment.name} (${segment._id})`);
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /segments/preview:
 *   post:
 *     summary: Preview audience size for a segment
 *     tags: [Segments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               segmentId:
 *                 type: string
 *                 description: Existing segment ID
 *               rules:
 *                 type: object
 *                 description: Custom segment rules
 *     responses:
 *       200:
 *         description: Audience preview
 */
exports.previewSegment = async (req, res, next) => {
    try {
        
      // Log request for debugging
      console.log('Preview request:', JSON.stringify(req.body));
      
      let query;
      let audienceSize = 0;
      
      // If segmentId is provided, use existing segment
      if (req.body.segmentId) {
        const segment = await Segment.findById(req.body.segmentId);
        
        if (!segment) {
          return next(new AppError('Segment not found', 404));
        }
        
        query = segment.toMongoQuery();
        audienceSize = segment.audienceSize;
      }
      // Otherwise, use custom rules
      else if (req.body.rules) {
        // Validate rules structure
        if (!req.body.rules.conditions || !Array.isArray(req.body.rules.conditions) || req.body.rules.conditions.length === 0) {
          return res.status(200).json({
            status: 'success',
            data: {
              count: 0,
              sampleCustomers: [],
            },
          });
        }
        
        // Create temporary segment to generate query
        const tempSegment = new Segment({
          name: 'Temporary',
          rules: req.body.rules,
        });
        
        try {
          query = tempSegment.toMongoQuery();
          
          // Count customers matching the query
          audienceSize = await Customer.countDocuments(query);
          
          // Get a sample of 5 customers for preview
          const sampleCustomers = await Customer.find(query).limit(5);
          
          return res.status(200).json({
            status: 'success',
            data: {
              count: audienceSize,
              sampleCustomers,
            },
          });
        } catch (error) {
          console.error('Error generating query:', error);
          // Return empty results instead of error
          return res.status(200).json({
            status: 'success',
            data: {
              count: 0,
              sampleCustomers: [],
            },
          });
        }
      } else {
        return next(new AppError('Either segmentId or rules must be provided', 400));
      }
    } catch (err) {
      console.error('Preview segment error:', err);
      // Return empty result instead of error to avoid disrupting the UI
      return res.status(200).json({
        status: 'success',
        data: {
          count: 0,
          sampleCustomers: [],
        },
      });
    }
  };

/**
 * @swagger
 * /segments/{id}/refresh:
 *   post:
 *     summary: Refresh audience size for a segment
 *     tags: [Segments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     responses:
 *       200:
 *         description: Audience size refreshed
 *       404:
 *         description: Segment not found
 */
exports.refreshSegmentSize = async (req, res, next) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return next(new AppError('Segment not found', 404));
    }
    
    const count = await segment.refreshAudienceSize();
    
    // Log segment refresh
    logger.info(`Segment audience refreshed: ${segment.name} (${segment._id}) with ${count} customers`);
    
    res.status(200).json({
      status: 'success',
      data: {
        segment,
        audienceSize: count,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /segments/{id}/performance:
 *   get:
 *     summary: Get segment performance metrics
 *     tags: [Segments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     responses:
 *       200:
 *         description: Segment performance metrics
 *       404:
 *         description: Segment not found
 */
exports.getSegmentPerformance = async (req, res, next) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return next(new AppError('Segment not found', 404));
    }
    
    // Get campaigns using this segment
    const campaigns = await Campaign.find({ segmentId: segment._id });
    
    // Calculate average delivery rate
    let totalDeliveryRate = 0;
    let campaignCount = 0;
    
    campaigns.forEach(campaign => {
      if (campaign.audienceSize > 0 && campaign.stats && campaign.stats.delivered > 0) {
        totalDeliveryRate += (campaign.stats.delivered / campaign.audienceSize) * 100;
        campaignCount += 1;
      }
    });
    
    const avgDeliveryRate = campaignCount > 0 ? totalDeliveryRate / campaignCount : 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        segment: {
          id: segment._id,
          name: segment.name,
          audienceSize: segment.audienceSize,
        },
        performance: {
          campaignsCount: campaigns.length,
          latestCampaign: campaigns.length > 0 ? {
            id: campaigns[0]._id,
            name: campaigns[0].name,
            createdAt: campaigns[0].createdAt,
          } : null,
          avgDeliveryRate,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};