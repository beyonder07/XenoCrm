require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/xeno-crm',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    options: {
      retry_strategy: function(options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    }
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/message-broker.log'
  },
  
  // Campaign delivery configuration
  campaign: {
    deliverySuccessRate: process.env.CAMPAIGN_DELIVERY_SUCCESS_RATE || 0.9, // 90% success rate
    maxBatchSize: process.env.CAMPAIGN_MAX_BATCH_SIZE || 100,
    processingInterval: process.env.CAMPAIGN_PROCESSING_INTERVAL || 1000 // 1 second
  }
};