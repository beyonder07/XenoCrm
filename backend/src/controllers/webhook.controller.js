const CommunicationLog = require('../models/communicationLog.model');
const Campaign = require('../models/campaign.model');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const { publishMessage } = require('../services/messagePublisher');

/**
 * @swagger
 * /webhooks/delivery-receipt:
 *   post:
 *     summary: Handle delivery receipts from messaging vendor
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageId
 *               - status
 *             properties:
 *               messageId:
 *                 type: string
 *                 description: Communication log ID
 *               status:
 *                 type: string
 *                 description: Delivery status (SENT or FAILED)
 *               errorMessage:
 *                 type: string
 *                 description: Error message if delivery failed
 *               metadata:
 *                 type: object
 *                 description: Additional vendor-specific data
 *     responses:
 *       200:
 *         description: Receipt processed successfully
 *       404:
 *         description: Message ID not found
 */
exports.handleDeliveryReceipt = async (req, res, next) => {
  try {
    const { messageId, status, errorMessage, metadata } = req.body;
    
    if (!messageId || !status) {
      return next(new AppError('Message ID and status are required', 400));
    }
    
    // For high-throughput applications, we would publish to a queue
    // rather than process updates synchronously
    publishMessage('delivery.receipt', {
      messageId,
      status,
      errorMessage,
      metadata,
      timestamp: new Date(),
    });
    
    // Log webhook receipt (but don't wait for processing)
    logger.info(`Delivery receipt received: ${messageId} - ${status}`);
    
    // Acknowledge receipt immediately
    res.status(200).json({
      status: 'success',
      message: 'Delivery receipt accepted for processing',
    });
  } catch (err) {
    logger.error(`Error handling delivery receipt: ${err.message}`);
    next(err);
  }
};

/**
 * Process delivery receipt (to be called from consumer)
 * @param {Object} data - Receipt data
 */
exports.processDeliveryReceipt = async (data) => {
  try {
    const { messageId, status, errorMessage, metadata } = data;
    
    // Find communication log
    const log = await CommunicationLog.findById(messageId);
    
    if (!log) {
      logger.error(`Communication log not found for ID: ${messageId}`);
      return;
    }
    
    // Update status
    log.status = status;
    
    if (status === 'SENT') {
      log.deliveredAt = new Date();
    } else if (status === 'FAILED') {
      log.errorMessage = errorMessage || 'Unknown error';
    }
    
    // Store metadata if provided
    if (metadata) {
      log.metadata = { ...log.metadata, ...metadata };
    }
    
    await log.save();
    
    // Update campaign stats
    const campaign = await Campaign.findById(log.campaignId);
    
    if (campaign) {
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
        
        // Log campaign completion
        logger.info(`Campaign completed: ${campaign.name} (${campaign._id})`);
      }
      
      await campaign.save();
    }
    
    // Log successful update
    logger.info(`Delivery status updated for message ${messageId}: ${status}`);
  } catch (err) {
    logger.error(`Error processing delivery receipt: ${err.message}`);
    throw err;
  }
};

/**
 * @swagger
 * /webhooks/event-callback:
 *   post:
 *     summary: Handle event callbacks (clicks, opens, etc.)
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageId
 *               - eventType
 *             properties:
 *               messageId:
 *                 type: string
 *                 description: Communication log ID
 *               eventType:
 *                 type: string
 *                 enum: [OPEN, CLICK, REPLY]
 *                 description: Type of event
 *               url:
 *                 type: string
 *                 description: URL clicked (for CLICK events)
 *               replyText:
 *                 type: string
 *                 description: Reply content (for REPLY events)
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Event timestamp
 *     responses:
 *       200:
 *         description: Event processed successfully
 */
exports.handleEventCallback = async (req, res, next) => {
  try {
    const { messageId, eventType, url, replyText, timestamp } = req.body;
    
    if (!messageId || !eventType) {
      return next(new AppError('Message ID and event type are required', 400));
    }
    
    // Publish event to queue for async processing
    publishMessage('event.callback', {
      messageId,
      eventType,
      url,
      replyText,
      timestamp: timestamp || new Date(),
    });
    
    // Log event receipt
    logger.info(`Event callback received: ${messageId} - ${eventType}`);
    
    // Acknowledge receipt immediately
    res.status(200).json({
      status: 'success',
      message: 'Event callback accepted for processing',
    });
  } catch (err) {
    logger.error(`Error handling event callback: ${err.message}`);
    next(err);
  }
};