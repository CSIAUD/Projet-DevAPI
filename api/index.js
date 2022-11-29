// 📚 Librairies
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger.json');

require('dotenv').config();

// 🚗 Routes
const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");
const groupsRoute = require("./routes/groups");   
const spotifyRoute = require("./routes/spotify");

// ➡️ Module imports :
const swagger = require("./doc/swagger-autogen.js");

// ⛰️ Environment variables :
const port = process.env.PORT || 8080;
const app = express();

// Body parser for POST requests
app.use(express.json());

// =====> API Routes
app.use("/api/token", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/groups", groupsRoute);

// =====> API Spotify
app.use('/api/spotify', spotifyRoute);

// =====> Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile, { swaggerOptions: { persistAuthorization: true } }));

swagger.Run();

app.listen(port, () =>  {
    console.log(`Le serveur fonctionne sur le port ${port}...`);
});