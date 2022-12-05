const token = require('../controllers/spotify.js'); // Import du controller

const axios = require('axios');

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT_URI;

// Utilisateurs de l'API
const file = '../api/data/users.json';


// FT-8 Playlist | /me/top/tracks

// Based on 'me' and 'tracks'
module.exports.createPlaylistTracksFromMyself = async (req, res) => {

    // On récupère l'uid de l'utilisateur connecté
    let access_token = await token.getToken(req.user.uid);

    // 'user' peut demander la création d’une playlist sur son compte Spotify contenant les 10 musiques préférées* d’un autre Utilisateur (qui peut être lui-même) passé en paramètre.
    // Le 'user' passé en paramètre doit appartenir à notre projet (user connecté à Spotify)
    // * : https://developer.spotify.com/documentation/web-api/reference/#/operations/get-users-top-artists-and-tracks

    var options = {
        // url: 'https://api.spotify.com/v1/me/top/tracks',
        headers: { 
            'Authorization' : 'Bearer ' + access_token,
            'accept-encoding': 'null'
        }
    };

    // Récupération des données de l'URL
    // AXIOS :
    axios.get('https://api.spotify.com/v1/me/top/tracks', options)
      .then(function (response) {
        console.log("NO ERROR Tracks");
        // console.log(response.data);

        tracks = response.data.items;

        // Création d'une playlist avec les données récupérées
        //"items": [ {} ],

        let limit = 10;

        playlist = [];
        for (let i = 0 ; i <= limit ; i++) {
            // playlist += i + ' ' + tracks[i]['name'] + ' | ';
            playlist[i] = tracks[i]['name'];
            // DEBUG
            // console.log(playlist);
        }
        console.log('--------------------------');
        console.log(playlist);

        // return tracks;

        /* getMyId(); */
        // Récupération des données de l'URL
        // AXIOS :
        axios.get('https://api.spotify.com/v1/me', options)
        .then(function (response) {
            console.log(response.data.id);
            // exemple : suprax33
            console.log("NO ERROR getMyId");
            userUID = response.data.id;
            // return userUID;

            /* createPlaylist(); */
            // var options2 = {
            //     name: 'Playlist YSpotify',
            //     public: true,
            //     description: 'playlist crée depuis l\'API YSpotify',
            //     headers: {
            //         'Authorization' : 'Bearer ' + access_token
            //     }
            // };

            var data = {
                name: "Playlist YSpotify", public: true, description: 'playlist crée depuis l\'API YSpotify'
            },
            headers ={
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/json'
            };
        
            axios.post('https://api.spotify.com/v1/users/' + userUID + '/playlists', data, headers)
            .then(function (response) {
                console.log(response);
                console.log('NO ERROR CreatePlaylist');
            })
            .catch(function (error) {
                console.log(error);
                console.log('ERROR CreatePlaylist');
            });
        })
        .catch(function (error) {
            console.log(error);
            console.log('ERROR getMyId');
        })
      
    })
    .catch(function (error) {
        console.log(error);
        console.log('ERROR');
    })
}

// Based on 'someone' and 'tracks'
module.exports.createPlaylistTracksFromSomeone = async (req, res) => {

}

// Récupère l'id de l'utilisateur
getMyId = async (req, res) => {

    // https://api.spotify.com/v1/me
    var options = {
        headers: { 
            'Authorization' : 'Bearer ' + access_token,
            'accept-encoding': 'null'
        }
    };

    // Récupération des données de l'URL
    // AXIOS :
    axios.get('https://api.spotify.com/v1/me', options)
    .then(function (response) {
        console.log(response.data.id);
        // exemple : suprax33
        console.log("NO ERROR");
    })
    .catch(function (error) {
        console.log(error);
        console.log('ERROR');
    })

}

// Create a playlist for a Spotify user. (The playlist will be empty until you add tracks.)
module.exports.createPlaylist = async (req, res) => {

    // POST /users/{user_id}/playlists

    // user_id string
    // The user's Spotify user ID.
    // Example value: "smedjan"

    var options = {
        name: 'Playlist YSpotify',
        boolean: true,
        description: 'playlist crée depuis l\'API YSpotify',
        headers: { 
            'Authorization' : 'Bearer ' + access_token,
            'accept-encoding': 'null'
        }
    };

    axios.post('/users/{user_id}/playlists', options)
      .then(function (response) {
        console.log(response);
        console.log('NO ERROR');
    })
    .catch(function (error) {
        console.log(error);
        console.log('ERROR');
    });

}

// module.exports = { getMyId };