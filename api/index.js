// 📚 Librairies
const express = require('express');
const request = require('request');
const swaggerUi = require('swagger-ui-express');

require('dotenv').config();

// 🚗 Routes
const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");
const refreshTokenRoute = require("./routes/refreshToken");

// ➡️ Module imports :
const swagger = require("./doc/swagger.js");

// ⛰️ Environment variables :
const port = process.env.PORT || 8080;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

const app = express();

// Body parser for POST requests
app.use(express.json());

// ===== API Routes =====
app.use("/api/token", authRoute);
app.use("/api/users", usersRoute);

// ===== API Spotify =====
app.use('/api/refresh_token', refreshTokenRoute);

// ===== Swagger Documentation =====
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger.swaggerDocs, swagger.options));

app.listen(port, () =>  {
    console.log(`Le serveur fonctionne sur le port ${port}...`);
});