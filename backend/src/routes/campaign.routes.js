const express = require('express');
const campaignController = require('../controllers/campaign.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Campaigns
 *   description: Campaign management endpoints
 */

// Protect all campaign routes
router.use(authMiddleware.protect);

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
router.get('/', campaignController.getAllCampaigns);

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
router.post('/test', campaignController.testCampaign);

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
router.get('/:id', campaignController.getCampaign);

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
router.post('/', campaignController.createCampaign);

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
router.patch('/:id', campaignController.updateCampaign);

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
router.delete('/:id', campaignController.deleteCampaign);

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
router.post('/:id/deliver', campaignController.deliverCampaign);

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
router.get('/:id/stats', campaignController.getCampaignStats);

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
router.get('/:id/logs', campaignController.getCampaignLogs);

module.exports = router;