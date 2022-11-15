// 📚 Librairies
const express = require('express');
require('dotenv').config();
var request = require('request'); // "Request" library  
var http = require('http');
var cors = require('cors');

// 🚗 Routes
const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");
const spotifyRoute = require("./routes/spotify");

let app = express();

app.use(express.json())
.use(cors()); // Body parser for POST requests

var port = process.env.PORT;

app.use("/api/token", authRoute);
app.use("/api/users", usersRoute);

// ===== API Spotify =====
app.use('/api/spotify', spotifyRoute);

app.listen(port, () =>  {
    console.log('le serveur fonctionne sur le port ' + port)
})