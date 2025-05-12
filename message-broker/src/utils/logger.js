const winston = require('winston');
const config = require('../config');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'xeno-crm-message-broker' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    }),
    // File transport
    new winston.transports.File({
      filename: config.logging.file,
      format: logFormat,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/mb-exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/mb-rejections.log' }),
  ],
});

module.exports = logger;