const logger = require('../utils/logger');
const config = require('../config');

/**
 * Simulate message delivery through a vendor service
 * In a real implementation, this would call an actual messaging vendor API
 * @param {Object} message - Message details
 * @returns {Promise<Object>} Delivery result
 */
exports.sendMessage = async (message) => {
  try {
    const { messageId, to, message: content, customerName, campaignName } = message;
    
    logger.debug(`Sending message ${messageId} to ${to}`);
    
    // Simulate network delay (50-200ms)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 50));
    
    // Simulate success/failure based on configured success rate
    const successRate = config.campaign.deliverySuccessRate || 0.9;
    const isSuccess = Math.random() < successRate;
    
    // Log result
    if (isSuccess) {
      logger.debug(`Message ${messageId} delivered successfully to ${to}`);
    } else {
      logger.debug(`Message ${messageId} delivery failed to ${to}`);
    }
    
    // Return simulated result
    return {
      success: isSuccess,
      messageId,
      recipient: to,
      timestamp: new Date().toISOString(),
      error: isSuccess ? null : getRandomError(),
      vendorMessageId: isSuccess ? generateVendorMessageId() : null,
    };
  } catch (err) {
    logger.error(`Error in vendor service: ${err.message}`);
    
    // Return failure
    return {
      success: false,
      messageId: message.messageId,
      recipient: message.to,
      timestamp: new Date().toISOString(),
      error: err.message,
    };
  }
};

/**
 * Generate a random vendor message ID
 * @returns {String} Random ID
 */
function generateVendorMessageId() {
  return `msg_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get a random error message
 * @returns {String} Error message
 */
function getRandomError() {
  const errors = [
    'Invalid recipient address',
    'Recipient mailbox full',
    'Temporary service unavailability',
    'Rate limit exceeded',
    'Network connectivity issue',
    'Invalid sender address',
    'Message too large',
    'Recipient opted out',
  ];
  
  return errors[Math.floor(Math.random() * errors.length)];
}

/**
 * Simulate a delivery webhook
 * @param {String} messageId - Message ID
 * @param {String} status - Delivery status
 * @returns {Promise<void>}
 */
exports.simulateDeliveryWebhook = async (messageId, status) => {
  try {
    // In a real implementation, this would make an HTTP request
    // to the webhook endpoint
    logger.debug(`Simulating delivery webhook for ${messageId}: ${status}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
    
    logger.debug(`Webhook delivered for ${messageId}`);
  } catch (err) {
    logger.error(`Error simulating webhook: ${err.message}`);
  }
};

module.exports = exports;