const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0'});

const port = process.env.PORT || 8080;

const doc = {
  info: {
    version: '1.0',      // by default: '1.0.0'
    title: 'YSpotify REST API',        // by default: 'REST API'
    description: 'A description.',  // by default: ''
  },
  host: `localhost:${port}`,      // by default: 'localhost:3000'
  basePath: '/',  // by default: '/'
  schemes: ['http'],   // by default: ['http']
  consumes: [],  // by default: ['application/json']
  produces: [],  // by default: ['application/json']
  tags: [        // by default: empty Array
    {
      name: '',         // Tag name
      description: '',  // Tag description
    },
    // { ... }
  ],
  securityDefinitions: {},  // by default: empty object
  definitions: {},          // by default: empty object (Swagger 2.0)
  components: {
    securitySchemes: {
        basicAuth: {
            type: "http",
            scheme: "basic",
        },
        bearerAuth: {
            type: "http",
            scheme: "bearer",
        }
    }
  }            // by default: empty object (OpenAPI 3.x)
};

const outputFile = '../api/swagger.json';
const endpointsFiles = ['.././api/index.js'];

/* NOTE: if you use the express Router, you must pass in the 
   'endpointsFiles' only the root file where the route starts,
   such as: index.js, app.js, routes.js, ... */

const Run = () => {
    swaggerAutogen(outputFile, endpointsFiles, doc);
}

module.exports = { Run };

//swaggerAutogen(outputFile, endpointsFiles, doc);

