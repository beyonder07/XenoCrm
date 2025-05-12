const mongoose = require('mongoose');
const Customer = mongoose.model('customers');
const Segment = mongoose.model('Segment');
const logger = require('../utils/logger');

/**
 * Process customer creation
 * @param {Object} data - Customer data
 */
exports.processCustomerCreated = async (data) => {
  try {
    const { customerId } = data;
    
    logger.info(`Processing customer created: ${customerId}`);
    
    // Get customer details
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      logger.error(`Customer not found: ${customerId}`);
      return;
    }
    
    // Refresh affected segments
    await refreshAffectedSegments(customer);
    
    logger.info(`Customer ${customerId} processing completed`);
  } catch (err) {
    logger.error(`Error processing customer created: ${err.message}`);
    throw err;
  }
};

/**
 * Process customer update
 * @param {Object} data - Customer data
 */
exports.processCustomerUpdated = async (data) => {
  try {
    const { customerId } = data;
    
    logger.info(`Processing customer updated: ${customerId}`);
    
    // Get customer details
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      logger.error(`Customer not found: ${customerId}`);
      return;
    }
    
    // Refresh affected segments
    await refreshAffectedSegments(customer);
    
    logger.info(`Customer ${customerId} update processing completed`);
  } catch (err) {
    logger.error(`Error processing customer updated: ${err.message}`);
    throw err;
  }
};

/**
 * Process customer deletion
 * @param {Object} data - Customer data
 */
exports.processCustomerDeleted = async (data) => {
  try {
    const { customerId, data: customerData } = data;
    
    logger.info(`Processing customer deleted: ${customerId}`);
    
    // Since customer is already deleted, use the provided data
    // to refresh affected segments
    await refreshAffectedSegmentsByFields(customerData);
    
    logger.info(`Customer ${customerId} deletion processing completed`);
  } catch (err) {
    logger.error(`Error processing customer deleted: ${err.message}`);
    throw err;
  }
};

/**
 * Process bulk customer creation
 * @param {Object} data - Bulk data
 */
exports.processCustomerBulkCreate = async (data) => {
  try {
    const { customers, userId } = data;
    
    logger.info(`Processing bulk customer import: ${customers.length} customers`);
    
    // Check if this is a valid import
    if (!Array.isArray(customers) || customers.length === 0) {
      logger.error('Invalid bulk import: No customers provided');
      return;
    }
    
    // Process customers in batches
    const batchSize = 100;
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };
    
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      
      try {
        // Process batch
        const createdCustomers = await processBatch(batch);
        results.success += createdCustomers.length;
        
        // Track any failures in the batch
        results.failed += batch.length - createdCustomers.length;
        
        logger.debug(`Processed batch of ${batch.length} customers, created ${createdCustomers.length}`);
      } catch (err) {
        logger.error(`Error processing batch: ${err.message}`);
        results.failed += batch.length;
        results.errors.push(err.message);
      }
    }
    
    // Refresh all segments
    await refreshAllSegments();
    
    logger.info(`Bulk import completed: ${results.success} created, ${results.failed} failed`);
  } catch (err) {
    logger.error(`Error processing bulk customer import: ${err.message}`);
    throw err;
  }
};

/**
 * Process a batch of customers for bulk import
 * @param {Array} customers - Customer data
 * @returns {Array} Created customers
 */
const processBatch = async (customers) => {
  const validCustomers = [];
  
  // Validate and prepare customers
  for (const customerData of customers) {
    // Ensure required fields
    if (!customerData.email || !customerData.name) {
      continue;
    }
    
    // Check for duplicate email
    const existingCustomer = await Customer.findOne({ email: customerData.email });
    if (existingCustomer) {
      // Update existing customer
      Object.assign(existingCustomer, customerData);
      await existingCustomer.save();
      validCustomers.push(existingCustomer);
    } else {
      // Add new customer
      validCustomers.push(customerData);
    }
  }
  
  // Insert valid customers that aren't updates
  const newCustomers = validCustomers.filter(c => !c._id);
  let createdCustomers = [];
  
  if (newCustomers.length > 0) {
    createdCustomers = await Customer.insertMany(newCustomers, { ordered: false });
  }
  
  // Return all processed customers (new and updated)
  return validCustomers;
};

/**
 * Refresh segments that may be affected by a customer
 * @param {Object} customer - Customer document
 */
const refreshAffectedSegments = async (customer) => {
  try {
    // In a real implementation, we would be more selective about which
    // segments to refresh based on the customer's fields and segment rules
    // For simplicity, we'll refresh all segments for now
    const segments = await Segment.find();
    
    for (const segment of segments) {
      // Convert segment rules to query
      const query = segment.toMongoQuery();
      
      // Check if customer matches query
      const isMatch = await Customer.exists({ ...query, _id: customer._id });
      
      // If customer is in segment, refresh segment audience size
      if (isMatch) {
        await segment.refreshAudienceSize();
        logger.debug(`Refreshed segment ${segment.name} for customer ${customer._id}`);
      }
    }
  } catch (err) {
    logger.error(`Error refreshing affected segments: ${err.message}`);
    throw err;
  }
};

/**
 * Refresh segments that may be affected by specific fields
 * @param {Object} customerData - Customer data
 */
const refreshAffectedSegmentsByFields = async (customerData) => {
  try {
    // In a real implementation, we would be more selective
    // For now, just refresh all segments
    await refreshAllSegments();
  } catch (err) {
    logger.error(`Error refreshing segments by fields: ${err.message}`);
    throw err;
  }
};

/**
 * Refresh all segments
 */
const refreshAllSegments = async () => {
  try {
    const segments = await Segment.find();
    
    logger.info(`Refreshing ${segments.length} segments`);
    
    for (const segment of segments) {
      await segment.refreshAudienceSize();
      logger.debug(`Refreshed segment ${segment.name}`);
    }
  } catch (err) {
    logger.error(`Error refreshing all segments: ${err.message}`);
    throw err;
  }
};

module.exports = exports;