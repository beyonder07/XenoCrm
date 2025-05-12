const Redis = require('ioredis');
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./utils/logger');
const customerConsumer = require('./consumers/customerConsumer');
const campaignConsumer = require('./consumers/campaignConsumer');
const deliveryReceiptConsumer = require('./consumers/deliveryReceiptConsumer');

// Connect to MongoDB
mongoose
  .connect(config.mongodb.uri, {

  })
  .then(() => {
    logger.info('MongoDB connection successful');
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create Redis subscriber client
const subscriber = new Redis(config.redis.url, config.redis.options);

// Handle Redis connection events
subscriber.on('connect', () => {
  logger.info('Redis subscriber connected');
});

subscriber.on('error', (err) => {
  logger.error('Redis subscriber error:', err);
});

// Subscribe to channels
const subscribeToChannels = async () => {
  try {
    // Customer channels
    await subscriber.subscribe('customer.created');
    await subscriber.subscribe('customer.updated');
    await subscriber.subscribe('customer.deleted');
    await subscriber.subscribe('customer.bulk.create');
    
    // Campaign channels
    await subscriber.subscribe('campaign.created');
    await subscriber.subscribe('campaign.deliver');
    
    // Delivery receipt channel
    await subscriber.subscribe('delivery.receipt');
    await subscriber.subscribe('event.callback');
    
    logger.info('Subscribed to all channels');
  } catch (err) {
    logger.error('Error subscribing to channels:', err);
    process.exit(1);
  }
};

// Process messages based on channel
subscriber.on('message', async (channel, message) => {
  try {
    logger.debug(`Received message on ${channel}`);
    
    // Parse message
    const data = JSON.parse(message);
    
    // Process message based on channel
    switch (channel) {
      // Customer channels
      case 'customer.created':
        await customerConsumer.processCustomerCreated(data);
        break;
      case 'customer.updated':
        await customerConsumer.processCustomerUpdated(data);
        break;
      case 'customer.deleted':
        await customerConsumer.processCustomerDeleted(data);
        break;
      case 'customer.bulk.create':
        await customerConsumer.processCustomerBulkCreate(data);
        break;
      
      // Campaign channels
      case 'campaign.created':
        await campaignConsumer.processCampaignCreated(data);
        break;
      case 'campaign.deliver':
        await campaignConsumer.processCampaignDelivery(data);
        break;
      
      // Delivery receipt channel
      case 'delivery.receipt':
        await deliveryReceiptConsumer.processDeliveryReceipt(data);
        break;
      case 'event.callback':
        await deliveryReceiptConsumer.processEventCallback(data);
        break;
      
      default:
        logger.warn(`Unknown channel: ${channel}`);
    }
  } catch (err) {
    logger.error(`Error processing message on ${channel}:`, err);
  }
});

// Start campaign delivery worker
const startCampaignDeliveryWorker = () => {
  const interval = setInterval(async () => {
    try {
      await campaignConsumer.processPendingDeliveries();
    } catch (err) {
      logger.error('Error in campaign delivery worker:', err);
    }
  }, config.campaign.processingInterval);
  
  return interval;
};

// Start scheduled campaign worker
const startScheduledCampaignWorker = () => {
  const interval = setInterval(async () => {
    try {
      await campaignConsumer.processScheduledCampaigns();
    } catch (err) {
      logger.error('Error in scheduled campaign worker:', err);
    }
  }, 60000); // Check every minute
  
  return interval;
};

// Main function
const start = async () => {
  try {
    // Subscribe to channels
    await subscribeToChannels();
    
    // Start workers
    const campaignDeliveryWorker = startCampaignDeliveryWorker();
    const scheduledCampaignWorker = startScheduledCampaignWorker();
    
    logger.info('All workers started');
    
    // Handle shutdown
    const gracefulShutdown = () => {
      logger.info('Shutting down gracefully');
      
      // Clear intervals
      clearInterval(campaignDeliveryWorker);
      clearInterval(scheduledCampaignWorker);
      
      // Close connections
      subscriber.quit();
      mongoose.connection.close();
      
      logger.info('Shutdown complete');
      process.exit(0);
    };
    
    // Handle termination signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (err) {
    logger.error('Error starting service:', err);
    process.exit(1);
  }
};

// Start service
start();