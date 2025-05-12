const swaggerJsDoc = require('swagger-jsdoc');
const config = require('../config');
const packageJson = require('../../package.json');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Xeno Mini CRM API',
      version: packageJson.version,
      description: 'API documentation for Xeno Mini CRM Platform',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'Xeno Support',
        url: 'https://www.getxeno.com',
        email: 'support@getxeno.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api`,
        description: 'Development server',
      },
      {
        url: 'https://api.getxeno.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js',
  ],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;