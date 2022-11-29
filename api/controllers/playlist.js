const token = require('../controllers/spotify.js'); // Import du controller
token.getToken

const axios = require('axios');

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT_URI;

// Utilisateurs de l'API
const file = '../api/data/users.json';


// FT-8 Playlist | /me/top/{type}
/*
  {type}
  The type of entity to return. Valid values: 'artists' or 'tracks'
  type string
  Example value: "artists"
*/

// Based on 'me' and 'tracks'
module.exports.createPlaylistTracksFromMyself = async (req, res) => {

    // 'user' peut demander la création d’une playlist sur son compte Spotify contenant les 10 musiques préférées* d’un autre Utilisateur (qui peut être lui-même) passé en paramètre.
    // Le 'user' passé en paramètre doit appartenir à notre projet (user connecté à Spotify)
    // * : https://developer.spotify.com/documentation/web-api/reference/#/operations/get-users-top-artists-and-tracks

    var options = {
        // url: 'https://api.spotify.com/v1/me/top/tracks',
        headers: { 'Authorization' : 'Bearer ' + token }
    };

    // Récupération des données de l'URL
    // AXIOS :
    axios.get('https://api.spotify.com/v1/me/top/tracks', options)
      .then(function (response) {
        console.log(response.data);
        return response;
    })
    .catch(function (error) {
        console.log(error);
    })
    .finally(function () {
        // always executed
    });

    // Création d'une playlist avec les données récupérées
    //"items": [ {} ],
    console.log(req);

    playlist = [];
    for (let i = 0; i < 10; i++) {
        // playlist += items[i];
        // DEBUG
        // console.log(playlist);
    }
}