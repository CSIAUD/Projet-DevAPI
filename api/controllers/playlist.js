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

    // On récupère les 10 meilleurs titres de l'utilisateur
    axios.get('https://api.spotify.com/v1/me/top/tracks', options)
    .then(function (response) {
        console.log("NO ERROR Tracks");
        console.log(response.data);

        // "items": [ {} ]
        tracks = response.data.items;

        let limit = 10;

        tracksList = [];
        for (let i = 0 ; i <= limit ; i++) {
            // tracksList += i + ' ' + tracks[i]['name'] + ' | ';
            tracksList[i] = tracks[i]['name'];
        }

        console.log('--------------------------');
        console.log(tracksList);
        console.log('--------------------------');

        // On récupère l'id de l'utilisateur
        getMyId(access_token);

        // On crée la playlist
        // createPlaylist(access_token, userID);

    })
    .catch(function (error) {
        console.log(error);
        console.log('ERROR fonction principale');
    })
}

// Based on 'someone' and 'tracks'
module.exports.createPlaylistTracksFromSomeone = async (req, res) => {

}

// Récupère l'id de l'utilisateur
getMyId = async (access_token) => {

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
        console.log("NO ERROR getMyId");
        userID = response.data.id;
        console.log(access_token);
        // return userID;
        createPlaylist(access_token, userID);
    })
    .catch(function (error) {
        console.log(error);
        console.log('ERROR getMyId');
    })

}

// Create a playlist for a Spotify user. (The playlist will be empty until you add tracks.)

const createPlaylist = async (req, res) => {
    /*  
        #swagger.summary = "Création de playlists (FT-8)"
        #swagger.description = "Crée une playlist."
    */

    let uid = req.user.uid;
    let user = getUserByUid(uid);

    /*
    * GET OR REFRESH USER.LINK.ACCESS IN USERS.JSON DATA FILE :
    */  
    await getToken(uid); //! important

    if(!user.link)
        return res.status(400).json("L'utilisateur n'a pas lié de compte Spotify.");
    
    let link = user.link

    if(!link.access || link.access === "")
        return res.status(403).json("Le token Spotify (link.access) n'est pas défini (null, undefined, empty string).");

    // 1. PLAYLIST CREATION
    const data = {
        playlistName: req.body.playlistName,
        user: req.body.user
    }

    await axios({
        method: 'post',
        url: `https://api.spotify.com/v1/me/playlists`,
        headers: { 
            'Authorization': 'Bearer ' + link.access,
            'accept-encoding': 'null'
        },
        data: {
            'name': data.playlistName,
            "description": "Your new awesome playlist.",
            "public": true
        }
      })
    .then((response) => {
        return res.status(200).json(response.data);
    })
    .catch((err) => {
        console.log(err);
        return res.status(500).json("Une erreur inattendue est survenue lors de la création de la playlist.");
    })
}