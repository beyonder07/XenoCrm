const Redis = require('ioredis');
const mongoose = require('mongoose');
const Campaign = mongoose.model('Campaign');
const Segment = mongoose.model('Segment');
const Customer = mongoose.model('Customer');

// Define and register the CommunicationLog schema
const communicationLogSchema = new mongoose.Schema({
    // Define the schema fields here
    message: String,
    timestamp: Date,
    status: String,
    // Add other fields as necessary
});

mongoose.model('CommunicationLog', communicationLogSchema);

const CommunicationLog = mongoose.model('CommunicationLog');
const config = require('../config');
const logger = require('../utils/logger');
const vendorService = require('../services/vendorService');

// Create Redis client for queue operations
const redisClient = new Redis(config.redis.url, config.redis.options);

/**
 * Process campaign creation
 * @param {Object} data - Campaign data
 */
exports.processCampaignCreated = async (data) => {
  try {
    const { campaignId } = data;
    
    logger.info(`Processing campaign created: ${campaignId}`);
    
    // Get campaign details
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      logger.error(`Campaign not found: ${campaignId}`);
      return;
    }
    
    // If campaign is not active or already processed, skip
    if (campaign.status !== 'Active') {
      logger.info(`Campaign ${campaignId} is not active, skipping`);
      return;
    }
    
    // Get audience
    const audienceQuery = await getAudienceQuery(campaign);
    
    // Get customers matching the audience query
    const customers = await Customer.find(audienceQuery);
    
    logger.info(`Found ${customers.length} customers for campaign ${campaignId}`);
    
    // Create communication logs
    await createCommunicationLogs(campaign, customers);
    
    // Update campaign with actual audience size
    campaign.audienceSize = customers.length;
    await campaign.save();
    
    logger.info(`Campaign ${campaignId} processing completed`);
  } catch (err) {
    logger.error(`Error processing campaign created: ${err.message}`);
    throw err;
  }
};

/**
 * Process campaign delivery
 * @param {Object} data - Campaign data
 */
exports.processCampaignDelivery = async (data) => {
  try {
    const { campaignId } = data;
    
    logger.info(`Processing campaign delivery: ${campaignId}`);
    
    // Get campaign details
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      logger.error(`Campaign not found: ${campaignId}`);
      return;
    }
    
    // If campaign is not active, skip
    if (campaign.status !== 'Active') {
      logger.info(`Campaign ${campaignId} is not active, skipping`);
      return;
    }
    
    // Start processing delivery
    await processCampaignDelivery(campaign);
    
    logger.info(`Campaign ${campaignId} delivery initiated`);
  } catch (err) {
    logger.error(`Error processing campaign delivery: ${err.message}`);
    throw err;
  }
};

/**
 * Process pending campaign deliveries
 */
exports.processPendingDeliveries = async () => {
  try {
    // Find communication logs in PENDING status
    const pendingLogs = await CommunicationLog.find({ status: 'PENDING' })
      .limit(config.campaign.maxBatchSize)
      .populate('customerId', 'name email')
      .populate('campaignId', 'message');
    
    if (pendingLogs.length === 0) {
      return;
    }
    
    logger.info(`Processing ${pendingLogs.length} pending deliveries`);
    
    // Group logs by campaign for batch processing
    const logsByCampaign = pendingLogs.reduce((acc, log) => {
      const campaignId = log.campaignId._id.toString();
      if (!acc[campaignId]) {
        acc[campaignId] = [];
      }
      acc[campaignId].push(log);
      return acc;
    }, {});
    
    // Process each campaign batch
    for (const [campaignId, logs] of Object.entries(logsByCampaign)) {
      await processCampaignBatch(logs);
    }
  } catch (err) {
    logger.error(`Error processing pending deliveries: ${err.message}`);
    throw err;
  }
};

/**
 * Process scheduled campaigns
 */
exports.processScheduledCampaigns = async () => {
  try {
    // Find campaigns that are scheduled and due
    const dueCampaigns = await Campaign.findDueCampaigns();
    
    if (dueCampaigns.length === 0) {
      return;
    }
    
    logger.info(`Processing ${dueCampaigns.length} scheduled campaigns`);
    
    // Process each due campaign
    for (const campaign of dueCampaigns) {
      // Update campaign status
      campaign.status = 'Active';
      campaign.sentAt = new Date();
      await campaign.save();
      
      // Process campaign delivery
      await processCampaignCreated({ campaignId: campaign._id });
    }
  } catch (err) {
    logger.error(`Error processing scheduled campaigns: ${err.message}`);
    throw err;
  }
};

/**
 * Get audience query for a campaign
 * @param {Object} campaign - Campaign document
 * @returns {Object} MongoDB query
 */
const getAudienceQuery = async (campaign) => {
  let query = {};
  
  // If campaign has segment, use segment rules
  if (campaign.segmentId) {
    const segment = await Segment.findById(campaign.segmentId);
    
    if (!segment) {
      throw new Error(`Segment not found: ${campaign.segmentId}`);
    }
    
    query = segment.toMongoQuery();
  }
  // Otherwise, use custom rules
  else if (campaign.customRules) {
    // Create temporary segment to generate query
    const tempSegment = new Segment({
      name: 'Temporary',
      rules: campaign.customRules,
    });
    
    query = tempSegment.toMongoQuery();
  } else {
    throw new Error('Campaign has neither segmentId nor customRules');
  }
  
  // Add active status filter
  query.isActive = true;
  
  return query;
};

/**
 * Create communication logs for a campaign
 * @param {Object} campaign - Campaign document
 * @param {Array} customers - Customer documents
 */
const createCommunicationLogs = async (campaign, customers) => {
  try {
    // Create array of log entries
    const logs = customers.map(customer => ({
      campaignId: campaign._id,
      customerId: customer._id,
      status: 'PENDING',
      message: campaign.message.replace(/{{name}}/g, customer.name || 'Customer'),
    }));
    
    // Insert logs in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize);
      await CommunicationLog.insertMany(batch);
      logger.debug(`Inserted batch of ${batch.length} communication logs`);
    }
    
    logger.info(`Created ${logs.length} communication logs for campaign ${campaign._id}`);
  } catch (err) {
    logger.error(`Error creating communication logs: ${err.message}`);
    throw err;
  }
};

/**
 * Process a batch of campaign logs
 * @param {Array} logs - Communication log documents
 */
const processCampaignBatch = async (logs) => {
  const deliveryResults = [];
  
  for (const log of logs) {
    try {
      const customer = log.customerId;
      const campaign = log.campaignId;
      
      if (!customer || !campaign) {
        logger.error(`Invalid log - missing customer or campaign: ${log._id}`);
        continue;
      }
      
      // Personalize message
      const message = log.message || campaign.message.replace(/{{name}}/g, customer.name || 'Customer');
      
      // Send message via vendor service
      const result = await vendorService.sendMessage({
        messageId: log._id.toString(),
        to: customer.email,
        message,
        customerName: customer.name,
        campaignName: campaign.name,
      });
      
      // Update log with result
      log.status = result.success ? 'SENT' : 'FAILED';
      log.sentAt = new Date();
      
      if (!result.success && result.error) {
        log.errorMessage = result.error;
      }
      
      await log.save();
      
      // Add to results for batch update of campaign stats
      deliveryResults.push({
        campaignId: campaign._id,
        status: log.status,
      });
      
      logger.debug(`Processed message to ${customer.email}: ${log.status}`);
    } catch (err) {
      logger.error(`Error processing log ${log._id}: ${err.message}`);
      
      // Update log with error
      log.status = 'FAILED';
      log.errorMessage = err.message;
      log.sentAt = new Date();
      await log.save();
      
      // Add failed result
      deliveryResults.push({
        campaignId: log.campaignId._id,
        status: 'FAILED',
      });
    }
  }
  
  // Update campaign stats in a single operation
  await updateCampaignStats(deliveryResults);
};

/**
 * Update campaign stats based on delivery results
 * @param {Array} results - Delivery results
 */
const updateCampaignStats = async (results) => {
  try {
    // Group results by campaign and status
    const statsByCampaign = results.reduce((acc, result) => {
      const campaignId = result.campaignId.toString();
      if (!acc[campaignId]) {
        acc[campaignId] = { SENT: 0, FAILED: 0 };
      }
      acc[campaignId][result.status]++;
      return acc;
    }, {});
    
    // Update each campaign's stats
    for (const [campaignId, stats] of Object.entries(statsByCampaign)) {
      const campaign = await Campaign.findById(campaignId);
      
      if (!campaign) {
        logger.error(`Campaign not found for stats update: ${campaignId}`);
        continue;
      }
      
      // Update stats
      campaign.stats.delivered += stats.SENT || 0;
      campaign.stats.failed += stats.FAILED || 0;
      
      // Recalculate percentages
      if (campaign.audienceSize > 0) {
        campaign.stats.deliveredPercentage = parseFloat(
          ((campaign.stats.delivered / campaign.audienceSize) * 100).toFixed(2)
        );
        campaign.stats.failedPercentage = parseFloat(
          ((campaign.stats.failed / campaign.audienceSize) * 100).toFixed(2)
        );
      }
      
      // Check if campaign is complete
      if (campaign.stats.delivered + campaign.stats.failed >= campaign.audienceSize) {
        campaign.status = 'Completed';
        campaign.completedAt = new Date();
        
        logger.info(`Campaign completed: ${campaign.name} (${campaign._id})`);
      }
      
      await campaign.save();
      
      logger.debug(`Updated stats for campaign ${campaignId}: ${stats.SENT} sent, ${stats.FAILED} failed`);
    }
  } catch (err) {
    logger.error(`Error updating campaign stats: ${err.message}`);
    throw err;
  }
};

module.exports = exports;