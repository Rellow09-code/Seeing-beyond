const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Title',
      version: '1.0.0',
      description: 'API documentation',
    },
  },
  apis: ["./index.js", "./routes/*.js"], // Adjust path to your route files
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };