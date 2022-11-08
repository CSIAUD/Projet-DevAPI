const express = require('express');
require('dotenv').config();

let app = express();
var port = process.env.PORT;
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT_URI;

var users = require('users.json');

app.get('/', function(req, res) {
  res.send();
});

// FT-7 Synchronisation
app.get('/audio-features', (req, res) => {

  // If 'user' = chef
  // Peut synchroniser musique qu’il écoute sur tous les appareils actifs des autres 'user' (Utilisateurs synchronisés) appartenant à son Groupe

  // Le périphérique actif de chaque 'user' synchronisé joue alors la musique à la même position (temps) que le 'user' synchronisant au moment où celui-ci a effectué la requête de synchronisation.

})

// FT-8 Playlist
/*
  {type}
  The type of entity to return. Valid values: 'artists' or 'tracks'
  type string
  Example value: "artists"
*/
app.get('/me/top/{type}', (req, res) => {

  // 'user' peut demander la création d’une playlist sur son compte Spotify contenant les 10 musiques préférées* d’un autre Utilisateur (qui peut être lui-même) passé en paramètre.
  // * : https://developer.spotify.com/documentation/web-api/reference/#/operations/get-users-top-artists-and-tracks

})

app.listen(port, () =>  {
    console.log('le serveur fonctionne sur le port ' + port)
})