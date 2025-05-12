require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // MongoDB configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/xeno-crm',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-should-be-long-and-secure',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN || 7
  },
  
  // Google OAuth configuration
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    defaultRedirect: process.env.DEFAULT_REDIRECT_URL || 'http://localhost:3000/auth/callback'
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
  
  // OpenAI configuration
  gemini: {
    apiKey: process.env.gemini,
  },
  
  // Email configuration
  email: {
    from: process.env.EMAIL_FROM || 'noreply@xeno-crm.com',
    smtp: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },
  
  // Campaign delivery configuration
  campaign: {
    deliverySuccessRate: process.env.CAMPAIGN_DELIVERY_SUCCESS_RATE || 0.9, // 90% success rate
    maxBatchSize: process.env.CAMPAIGN_MAX_BATCH_SIZE || 100,
    processingInterval: process.env.CAMPAIGN_PROCESSING_INTERVAL || 1000 // 1 second
  }
};