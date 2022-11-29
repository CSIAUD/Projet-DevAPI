const token = require('../controllers/spotify.js'); // Import du controller
token.getToken

const axios = require('axios');

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

    console.log("test playlist");

    var authOptions = {
        url: 'https://api.spotify.com/v1/me/top/tracks',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) }
    };

    // Récupération des données de l'URL
    // AXIOS :
    axios.post(authOptions.url, authOptions.form, {
        headers: authOptions.headers,
        state: state
    })

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

// Based on 'me' and 'artists'
module.exports.createPlaylistArtistsFromMyself = async (req, res) => {

    // Récupération des données de l'URL

    // Création d'une playlist avec les données récupérées
    //"items": [ {} ],
    console.log(req);

    playlist = [];
    for (let i = 0; i < 10; i++) {
        playlist += items[i];
        // DEBUG
        // console.log(playlist);
    }
}

// Based on 'someone' and 'tracks'
module.exports.createPlaylistTracksFromSomeone = async (req, res) => {

    // Récupération des données de l'URL

    // Création d'une playlist avec les données récupérées
    //"items": [ {} ],
    console.log(req);

    playlist = [];
    for (let i = 0; i < 10; i++) {
        playlist += items[i];
        // DEBUG
        // console.log(playlist);
    }
}

// Based on 'someone' and 'artists'
module.exports.createPlaylistArtistsFromSomeone = async (req, res) => {

    // Récupération des données de l'URL

    // Création d'une playlist avec les données récupérées
    //"items": [ {} ],
    console.log(req);

    playlist = [];
    for (let i = 0; i < 10; i++) {
        playlist += items[i];
        // DEBUG
        // console.log(playlist);
    }
}