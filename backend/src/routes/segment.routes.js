const express = require('express');
const segmentController = require('../controllers/segment.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Segments
 *   description: Audience segmentation endpoints
 */

// Protect all segment routes
router.use(authMiddleware.protect);

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
router.get('/', segmentController.getAllSegments);

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
router.post('/preview', segmentController.previewSegment);

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
router.get('/:id', segmentController.getSegment);

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
router.post('/', segmentController.createSegment);

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
router.patch('/:id', segmentController.updateSegment);

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
router.delete('/:id', segmentController.deleteSegment);

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
router.post('/:id/refresh', segmentController.refreshSegmentSize);

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
router.get('/:id/performance', segmentController.getSegmentPerformance);

module.exports = router;