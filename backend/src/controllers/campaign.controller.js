const Campaign = require('../models/campaign.model');
const Segment = require('../models/segment.model');
const CommunicationLog = require('../models/communicationLog.model');
const Customer = require('../models/customer.model');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const { publishMessage } = require('../services/messagePublisher');

/**
 * @swagger
 * /campaigns:
 *   get:
 *     summary: Get all campaigns with pagination and filters
 *     tags: [Campaigns]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Active, Completed, Failed]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or description
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, -name, createdAt, -createdAt, scheduledAt, -scheduledAt]
 *           default: -createdAt
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of campaigns
 *       401:
 *         description: Unauthorized
 */
exports.getAllCampaigns = async (req, res, next) => {
  try {
    // Build query
    const query = {};
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Search by name or description
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
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
    
    // Execute query with pagination and populate segment info
    const campaigns = await Campaign.find(query)
      .populate({
        path: 'segmentId',
        select: 'name audienceSize',
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Campaign.countDocuments(query);
    
    // Send response
    res.status(200).json({
      status: 'success',
      results: campaigns.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
      },
      data: {
        campaigns,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /campaigns/{id}:
 *   get:
 *     summary: Get a specific campaign by ID
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Campaign details
 *       404:
 *         description: Campaign not found
 */
exports.getCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate({
        path: 'segmentId',
        select: 'name description rules audienceSize',
      });
    
    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        campaign,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /campaigns:
 *   post:
 *     summary: Create a new campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Campaign'
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       400:
 *         description: Validation error
 */
exports.createCampaign = async (req, res, next) => {
  try {
    // Validate that either segmentId or customRules is provided
    if (!req.body.segmentId && !req.body.customRules) {
      return next(new AppError('Either segmentId or customRules must be provided', 400));
    }
    
    // Set creator
    req.body.createdBy = req.user._id;
    
    // If segmentId is provided, verify segment exists
    if (req.body.segmentId) {
      const segment = await Segment.findById(req.body.segmentId);
      if (!segment) {
        return next(new AppError('Segment not found', 404));
      }
      
      // Use segment's audience size if not provided
      if (!req.body.audienceSize) {
        req.body.audienceSize = segment.audienceSize;
      }
    }
    
    // Create new campaign
    const campaign = await Campaign.create(req.body);
    
    // If campaign is scheduled in the future, set status to Draft
    if (req.body.scheduledAt && new Date(req.body.scheduledAt) > new Date()) {
      campaign.status = 'Draft';
    } else {
      // Otherwise, set to Active and record sentAt
      campaign.status = 'Active';
      campaign.sentAt = new Date();
    }
    
    await campaign.save();
    
    // Publish message to queue for async processing if not scheduled
    if (campaign.status === 'Active') {
      publishMessage('campaign.created', {
        campaignId: campaign._id,
        data: campaign,
      });
    }
    
    // Log campaign creation
    logger.info(`Campaign created: ${campaign.name} (${campaign._id})`);
    
    res.status(201).json({
      status: 'success',
      data: {
        campaign,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /campaigns/{id}:
 *   patch:
 *     summary: Update a campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       404:
 *         description: Campaign not found
 */
exports.updateCampaign = async (req, res, next) => {
  try {
    // Don't allow updating certain fields if campaign is not in Draft status
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }
    
    if (campaign.status !== 'Draft') {
      const restrictedFields = ['segmentId', 'customRules', 'message', 'audienceSize'];
      
      for (const field of restrictedFields) {
        if (req.body[field]) {
          return next(new AppError(`Cannot update ${field} for campaigns that are not in Draft status`, 400));
        }
      }
    }
    
    // Update campaign
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return updated document
        runValidators: true, // Run validators
      }
    );
    
    // Log campaign update
    logger.info(`Campaign updated: ${updatedCampaign.name} (${updatedCampaign._id})`);
    
    res.status(200).json({
      status: 'success',
      data: {
        campaign: updatedCampaign,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /campaigns/{id}:
 *   delete:
 *     summary: Delete a campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     responses:
 *       204:
 *         description: Campaign deleted successfully
 *       404:
 *         description: Campaign not found
 */
exports.deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }
    
    // Only allow deleting campaigns in Draft status
    if (campaign.status !== 'Draft') {
      return next(new AppError('Only campaigns in Draft status can be deleted', 400));
    }
    
    await Campaign.findByIdAndDelete(req.params.id);
    
    // Log campaign deletion
    logger.info(`Campaign deleted: ${campaign.name} (${campaign._id})`);
    
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
 * /campaigns/{id}/deliver:
 *   post:
 *     summary: Trigger campaign delivery
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Campaign delivery initiated
 *       404:
 *         description: Campaign not found
 */
exports.deliverCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
        return next(new AppError('Campaign not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        campaign,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /campaigns/{id}/stats:
 *   get:
 *     summary: Get campaign delivery statistics
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Campaign statistics
 *       404:
 *         description: Campaign not found
 */
exports.getCampaignStats = async (req, res, next) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      
      if (!campaign) {
        return next(new AppError('Campaign not found', 404));
      }
      
      // Get detailed delivery statistics
      const logsStats = await CommunicationLog.aggregate([
        {
          $match: { campaignId: campaign._id },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);
      
      // Convert array to object for easier access
      const detailedStats = logsStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});
      
      // Calculate time metrics
      let deliveryDuration = null;
      if (campaign.sentAt && campaign.completedAt) {
        deliveryDuration = Math.floor((campaign.completedAt - campaign.sentAt) / 1000); // in seconds
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          campaignId: campaign._id,
          name: campaign.name,
          audienceSize: campaign.audienceSize,
          stats: {
            ...campaign.stats,
            detailed: detailedStats,
          },
          sentAt: campaign.sentAt,
          completedAt: campaign.completedAt,
          deliveryDuration,
          completionPercentage: campaign.completionPercentage,
        },
      });
    } catch (err) {
      next(err);
    }
  };

/**
 * @swagger
 * /campaigns/{id}/logs:
 *   get:
 *     summary: Get campaign delivery logs
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, SENT, FAILED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Campaign delivery logs
 *       404:
 *         description: Campaign not found
 */
exports.getCampaignLogs = async (req, res, next) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      
      if (!campaign) {
        return next(new AppError('Campaign not found', 404));
      }
      
      // Build query
      const query = { campaignId: campaign._id };
      
      // Filter by status
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      // Parse pagination
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const skip = (page - 1) * limit;
      
      // Execute query with pagination
      const logs = await CommunicationLog.find(query)
        .populate({
          path: 'customerId',
          select: 'name email',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      // Get total count for pagination
      const total = await CommunicationLog.countDocuments(query);
      
      res.status(200).json({
        status: 'success',
        results: logs.length,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          totalResults: total,
        },
        data: {
          logs,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  /**
 * @swagger
 * /campaigns/test:
 *   post:
 *     summary: Test campaign delivery with a sample message
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 required: true
 *               customerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Test message sent successfully
 *       404:
 *         description: Customer not found
 */
exports.testCampaign = async (req, res, next) => {
    try {
      const { message, customerId } = req.body;
      
      if (!message) {
        return next(new AppError('Message is required', 400));
      }
      
      // If customerId is provided, verify customer exists
      let customer;
      if (customerId) {
        customer = await Customer.findById(customerId);
        if (!customer) {
          return next(new AppError('Customer not found', 404));
        }
      } else {
        // Otherwise, use the first customer in the database
        customer = await Customer.findOne();
        if (!customer) {
          return next(new AppError('No customers found in the database', 404));
        }
      }
      
      // Create a test message
      const testMessage = message.replace(/{{name}}/g, customer.name);
      
      // Simulate delivery (90% success rate)
      const isSuccess = Math.random() < 0.9;
      
      const result = {
        success: isSuccess,
        status: isSuccess ? 'SENT' : 'FAILED',
        message: testMessage,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
        },
        timestamp: new Date(),
        error: isSuccess ? null : 'Simulated delivery failure',
      };
      
      // Log test campaign
      logger.info(`Test campaign sent to ${customer.email} (${isSuccess ? 'SUCCESS' : 'FAILURE'})`);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };