const Redis = require('ioredis');
const config = require('../config');
const logger = require('../utils/logger');

// Create Redis client
const redisClient = new Redis(config.redis.url, config.redis.options);

// Handle Redis connection events
redisClient.on('connect', () => {
  logger.info('Redis publisher connected');
});

redisClient.on('error', (err) => {
  logger.error('Redis publisher error:', err);
});

/**
 * Publish a message to a channel
 * @param {string} channel - Redis channel
 * @param {Object} message - Message to publish
 * @returns {Promise<number>} Number of clients that received the message
 */
exports.publishMessage = async (channel, message) => {
  try {
    // Add timestamp if not present
    if (!message.timestamp) {
      message.timestamp = new Date().toISOString();
    }
    
    // Convert message to JSON string
    const messageString = JSON.stringify(message);
    
    // Publish to Redis channel
    const result = await redisClient.publish(channel, messageString);
    
    logger.debug(`Published message to ${channel}: ${messageString.substring(0, 100)}${messageString.length > 100 ? '...' : ''}`);
    
    return result;
  } catch (err) {
    logger.error(`Error publishing message to ${channel}:`, err);
    throw err;
  }
};

/**
 * Add a message to a Redis list (for message queuing)
 * @param {string} queueName - Redis list name
 * @param {Object} message - Message to add to queue
 * @returns {Promise<number>} Length of the list after pushing
 */
exports.enqueueMessage = async (queueName, message) => {
  try {
    // Add timestamp if not present
    if (!message.timestamp) {
      message.timestamp = new Date().toISOString();
    }
    
    // Convert message to JSON string
    const messageString = JSON.stringify(message);
    
    // Push to Redis list
    const result = await redisClient.rpush(queueName, messageString);
    
    logger.debug(`Enqueued message to ${queueName}: ${messageString.substring(0, 100)}${messageString.length > 100 ? '...' : ''}`);
    
    return result;
  } catch (err) {
    logger.error(`Error enqueuing message to ${queueName}:`, err);
    throw err;
  }
};

/**
 * Add a batch of messages to a Redis list
 * @param {string} queueName - Redis list name
 * @param {Array<Object>} messages - Array of messages to add to queue
 * @returns {Promise<number>} Length of the list after pushing
 */
exports.enqueueBatch = async (queueName, messages) => {
  try {
    if (!Array.isArray(messages) || messages.length === 0) {
      return 0;
    }
    
    // Current timestamp
    const timestamp = new Date().toISOString();
    
    // Convert all messages to JSON strings
    const messageStrings = messages.map(message => {
      // Add timestamp if not present
      const messageWithTimestamp = {
        ...message,
        timestamp: message.timestamp || timestamp
      };
      
      return JSON.stringify(messageWithTimestamp);
    });
    
    // Push all messages to Redis list
    const result = await redisClient.rpush(queueName, ...messageStrings);
    
    logger.debug(`Enqueued batch of ${messages.length} messages to ${queueName}`);
    
    return result;
  } catch (err) {
    logger.error(`Error enqueuing batch to ${queueName}:`, err);
    throw err;
  }
};

// Export Redis client for use in other modules if needed
exports.redisClient = redisClient;