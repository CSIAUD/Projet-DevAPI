// 📚 Librairies
const express = require('express');
require('dotenv').config();
var request = require('request'); // "Request" library  
var http = require('http');

// 🚗 Routes
const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");
const spotifyRoute = require("./routes/spotify");
const playlistRoute = require("./routes/playlist");
const synchronisationRoute = require("./routes/synchronisation");

let app = express();

app.use(express.json()); // Body parser for POST requests

var port = process.env.PORT;

// =====================================
// ➡️ ENDPOINT : http://localhost:8080/api/users
// ▶️ METHOD : [POST]
// 💡 USAGE : Inscrire un utilisateur
// ❔ Parameters :

// body: {
//   "username": "string",
//   "password": "string"
// }
app.use("/api/users", usersRoute);

// =====================================
// ➡️ ENDPOINT : http://localhost:8080/api/token
// ▶️ METHOD : [GET]
// 💡 USAGE : Connecter un utilisateur
// ❔ Paramaters :
// Auth Basic : username;password
app.use("/api/token", authRoute);

// ===== API Spotify =====
app.use('/api/spotify', spotifyRoute);

// =====================================
// ➡️ ENDPOINT : http://localhost:8080/api/me/top/{type}
// ▶️ METHOD : []
// 💡 USAGE : Créer une playlist
// ❔ Parameters :
app.use('/api/playlist', playlistRoute);

// =====================================
// ➡️ ENDPOINT : http://localhost:8080/api/me/top/{type}
// ▶️ METHOD : []
// 💡 USAGE : Synchroniser une musique
// ❔ Parameters :
app.use('/api/synchronisation', synchronisationRoute);

app.listen(port, () =>  {
    console.log('le serveur fonctionne sur le port ' + port)
})