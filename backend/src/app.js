const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const swaggerUi = require('swagger-ui-express');
const compression = require('compression');
const passport = require('passport');
const cookieParser = require('cookie-parser');

const config = require('./config');
const logger = require('./utils/logger');
const swaggerDocs = require('./utils/swagger');
const errorHandler = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

// Import route files
const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const campaignRoutes = require('./routes/campaign.routes');
const segmentRoutes = require('./routes/segment.routes');
const aiRoutes = require('./routes/ai.routes');
const webhookRoutes = require('./routes/webhook.routes');

// Initialize Express app
const app = express();

// Implement CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Rate limiting
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs:  60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// Try this:
app.use(mongoSanitize({
    replaceWith: '_'
  }));
// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'name',
    'email',
    'status',
    'createdAt',
    'campaign',
    'segment'
  ]
}));

// Compression
app.use(compression());

// Passport initialization
app.use(passport.initialize());
require('./config/passport')(passport);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    env: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/segments', segmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/webhooks', webhookRoutes);

// Handle 404 routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;