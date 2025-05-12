const express = require('express');
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI integration endpoints
 */

// Protect all AI routes
router.use(authMiddleware.protect);

/**
 * @swagger
 * /ai/nl-to-rules:
 *   post:
 *     summary: Convert natural language to segment rules
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "Customers who spent over ₹10,000 in the last 3 months"
 *     responses:
 *       200:
 *         description: Generated segment rules
 */
router.post('/nl-to-rules', aiController.naturalLanguageToRules);

/**
 * @swagger
 * /ai/message-suggestions:
 *   post:
 *     summary: Generate message suggestions based on segment
 *     tags: [AI]
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
 *               customRules:
 *                 type: object
 *               objective:
 *                 type: string
 *                 enum: [engagement, winback, promotion, announcement, information]
 *               tone:
 *                 type: string
 *                 enum: [friendly, professional, urgent, casual, formal]
 *     responses:
 *       200:
 *         description: Generated message suggestions
 */
router.post('/message-suggestions', aiController.generateMessageSuggestions);

/**
 * @swagger
 * /ai/campaign-insights/{id}:
 *   get:
 *     summary: Generate insights for campaign performance
 *     tags: [AI]
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
 *         description: Campaign insights
 *       404:
 *         description: Campaign not found
 */
router.get('/campaign-insights/:id', aiController.generateCampaignInsights);

/**
 * @swagger
 * /ai/optimal-send-time/{id}:
 *   get:
 *     summary: Get optimal send time recommendations for a segment
 *     tags: [AI]
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
 *         description: Optimal send time recommendations
 *       404:
 *         description: Segment not found
 */
router.get('/optimal-send-time/:id', aiController.getOptimalSendTime);

/**
 * @swagger
 * /ai/lookalike-audience/{id}:
 *   get:
 *     summary: Generate lookalike audience for a segment
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Source segment ID
 *     responses:
 *       200:
 *         description: Lookalike audience rules
 *       404:
 *         description: Segment not found
 */
router.get('/lookalike-audience/:id', aiController.generateLookalikeAudience);

/**
 * @swagger
 * /ai/auto-tag:
 *   post:
 *     summary: Auto-tag a campaign based on segment and message
 *     tags: [AI]
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
 *               messageContent:
 *                 type: string
 *     responses:
 *       200:
 *         description: Suggested tags
 */
router.post('/auto-tag', aiController.autoTagCampaign);

module.exports = router;