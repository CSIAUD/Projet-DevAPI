// 📚 Librairies
const express = require('express');
require('dotenv').config();
var request = require('request'); // "Request" library

// 🚗 Routes
const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");
const refreshTokenRoute = require("./routes/refreshToken");

let app = express();

app.use(express.json()); // Body parser for POST requests

var port = process.env.PORT;
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT_URI;

app.use("/api/token", authRoute);
app.use("/api/users", usersRoute);

// ===== API Spotify =====
app.use('/api/refresh_token', refreshTokenRoute);

app.listen(port, () =>  {
    console.log('le serveur fonctionne sur le port ' + port)
})