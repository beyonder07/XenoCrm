const Customer = require('../models/customer.model');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const { publishMessage } = require('../services/messagePublisher');

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all customers with pagination and filters
 *     tags: [Customers]
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
 *         description: Search term for name or email
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, -name, email, -email, createdAt, -createdAt, lastOrderDate, -lastOrderDate, totalSpend, -totalSpend]
 *           default: -createdAt
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of customers
 *       401:
 *         description: Unauthorized
 */
exports.getAllCustomers = async (req, res, next) => {
  try {
    // Build query
    const query = {};
    
    // Search by name or email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
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
    const customers = await Customer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Customer.countDocuments(query);
    
    // Send response
    res.status(200).json({
      status: 'success',
      results: customers.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
      },
      data: {
        customers,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get a specific customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer details
 *       404:
 *         description: Customer not found
 */
exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        customer,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Validation error
 */
exports.createCustomer = async (req, res, next) => {
  try {
    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email: req.body.email });
    if (existingCustomer) {
      return next(new AppError('Email already in use', 409));
    }
    
    // Create new customer
    const customer = await Customer.create(req.body);
    
    // Publish message to queue for async processing
    publishMessage('customer.created', {
      customerId: customer._id,
      data: customer,
    });
    
    // Log customer creation
    logger.info(`Customer created: ${customer.email}`);
    
    res.status(201).json({
      status: 'success',
      data: {
        customer,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /customers/{id}:
 *   patch:
 *     summary: Update a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       404:
 *         description: Customer not found
 */
exports.updateCustomer = async (req, res, next) => {
  try {
    // Check if email is being updated and already exists
    if (req.body.email) {
      const existingCustomer = await Customer.findOne({ 
        email: req.body.email,
        _id: { $ne: req.params.id },
      });
      
      if (existingCustomer) {
        return next(new AppError('Email already in use', 409));
      }
    }
    
    // Update customer
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return updated document
        runValidators: true, // Run validators
      }
    );
    
    // Check if customer exists
    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }
    
    // Publish message to queue for async processing
    publishMessage('customer.updated', {
      customerId: customer._id,
      data: customer,
    });
    
    // Log customer update
    logger.info(`Customer updated: ${customer.email}`);
    
    res.status(200).json({
      status: 'success',
      data: {
        customer,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     summary: Delete a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       204:
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 */
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    
    // Check if customer exists
    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }
    
    // Publish message to queue for async processing
    publishMessage('customer.deleted', {
      customerId: customer._id,
      data: customer,
    });
    
    // Log customer deletion
    logger.info(`Customer deleted: ${customer.email}`);
    
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
 * /customers/bulk:
 *   post:
 *     summary: Create multiple customers in bulk
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customers:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Bulk import initiated
 */
exports.bulkCreateCustomers = async (req, res, next) => {
  try {
    const { customers } = req.body;
    
    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return next(new AppError('Please provide an array of customers', 400));
    }
    
    // Publish message to queue for async processing
    publishMessage('customer.bulk.create', {
      userId: req.user._id,
      customers,
    });
    
    // Log bulk import
    logger.info(`Bulk customer import initiated: ${customers.length} customers`);
    
    res.status(200).json({
      status: 'success',
      message: 'Bulk import initiated. Customers will be processed asynchronously.',
      data: {
        count: customers.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /customers/stats:
 *   get:
 *     summary: Get customer statistics
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer statistics
 */
exports.getCustomerStats = async (req, res, next) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ isActive: true });
    
    // Calculate customers added in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    
    // Calculate customers with orders in last 30 days
    const recentlyActiveCustomers = await Customer.countDocuments({
      lastOrderDate: { $gte: thirtyDaysAgo },
    });
    
    // Get total spend
    const spendResult = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalSpend: { $sum: '$totalSpend' },
          avgSpend: { $avg: '$totalSpend' },
        },
      },
    ]);
    
    const totalSpend = spendResult.length ? spendResult[0].totalSpend : 0;
    const avgSpend = spendResult.length ? spendResult[0].avgSpend : 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        totalCustomers,
        activeCustomers,
        inactiveCustomers: totalCustomers - activeCustomers,
        newCustomers,
        recentlyActiveCustomers,
        totalSpend,
        avgSpend,
      },
    });
  } catch (err) {
    next(err);
  }
};