const mongoose = require('mongoose');
const CommunicationLog = mongoose.model('CommunicationLog');
const Campaign = mongoose.model('Campaign');
const logger = require('../utils/logger');

/**
 * Process delivery receipt
 * @param {Object} data - Receipt data
 */
exports.processDeliveryReceipt = async (data) => {
  try {
    const { messageId, status, errorMessage, metadata, timestamp } = data;
    
    logger.info(`Processing delivery receipt for message ${messageId}: ${status}`);
    
    // Find communication log
    const log = await CommunicationLog.findById(messageId);
    
    if (!log) {
      logger.error(`Communication log not found for ID: ${messageId}`);
      return;
    }
    
    // Update status
    log.status = status;
    
    if (status === 'SENT') {
      log.deliveredAt = new Date(timestamp) || new Date();
    } else if (status === 'FAILED') {
      log.errorMessage = errorMessage || 'Unknown error';
    }
    
    // Store metadata if provided
    if (metadata) {
      log.metadata = { ...log.metadata, ...metadata };
    }
    
    await log.save();
    
    // Update campaign stats
    await updateCampaignStats(log.campaignId, status);
    
    logger.info(`Delivery status updated for message ${messageId}: ${status}`);
  } catch (err) {
    logger.error(`Error processing delivery receipt: ${err.message}`);
    throw err;
  }
};

/**
 * Process event callback
 * @param {Object} data - Event data
 */
exports.processEventCallback = async (data) => {
  try {
    const { messageId, eventType, url, replyText, timestamp } = data;
    
    logger.info(`Processing event callback for message ${messageId}: ${eventType}`);
    
    // Find communication log
    const log = await CommunicationLog.findById(messageId);
    
    if (!log) {
      logger.error(`Communication log not found for ID: ${messageId}`);
      return;
    }
    
    // Store event in metadata
    if (!log.metadata) {
      log.metadata = {};
    }
    
    if (!log.metadata.events) {
      log.metadata.events = [];
    }
    
    // Add event to events array
    log.metadata.events.push({
      type: eventType,
      timestamp: new Date(timestamp) || new Date(),
      url: url,
      replyText: replyText,
    });
    
    await log.save();
    
    logger.info(`Event ${eventType} recorded for message ${messageId}`);
  } catch (err) {
    logger.error(`Error processing event callback: ${err.message}`);
    throw err;
  }
};

/**
 * Update campaign stats
 * @param {String} campaignId - Campaign ID
 * @param {String} status - Delivery status
 */
const updateCampaignStats = async (campaignId, status) => {
  try {
    // Get campaign
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      logger.error(`Campaign not found for ID: ${campaignId}`);
      return;
    }
    
    // Update stats based on status
    if (status === 'SENT') {
      campaign.stats.delivered += 1;
    } else if (status === 'FAILED') {
      campaign.stats.failed += 1;
    }
    
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
  } catch (err) {
    logger.error(`Error updating campaign stats: ${err.message}`);
    throw err;
  }
};

module.exports = exports;