const SwaggerJsDoc = require('swagger-jsdoc');

// 📜 More info : https://swagger.io/specification/
var swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'YSpotify', // Title (required)
            version: '1.0.0', // Version (required)
        },
    basePath: "/api",
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
    },
    openapi: "3.0.0",
    },
    apis: ['.././api/routes/*.js'], // Path to the API docs
    };


// Custom JavaScript script for SwaggerUI :
const options = {
    customJsStr: [
      `
      // Remove 'disabled' attribute from parameters input fields. Needs a short delay:
      setTimeout(() => {
        const inputs = document.getElementsByTagName("input");
        console.log(inputs.length);
        for (const input of inputs) {
          input.removeAttribute('disabled');
        }
      }, "1000")
      
      `
    ]
  };

const swaggerDocs = SwaggerJsDoc(swaggerOptions);

module.exports = { swaggerDocs, options };