const express = require('express');
const webhookController = require('../controllers/webhook.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: Webhook endpoints for external services
 */

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
router.post('/delivery-receipt', webhookController.handleDeliveryReceipt);

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
router.post('/event-callback', webhookController.handleEventCallback);

module.exports = router;