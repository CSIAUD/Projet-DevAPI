const spotify = require('../controllers/spotify.js'); // Import du controller
const users = require('../controllers/auth.js'); // Import du controller

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
const createPlaylistTracksFromMyself = async (req, res) => {
    let access_token = await spotify.getToken(req.user.uid);


    // 'user' peut demander la création d’une playlist sur son compte Spotify contenant les 10 musiques préférées* d’un autre Utilisateur (qui peut être lui-même) passé en paramètre.
    // Le 'user' passé en paramètre doit appartenir à notre projet (user connecté à Spotify)
    // * : https://developer.spotify.com/documentation/web-api/reference/#/operations/get-users-top-artists-and-tracks

    // TEST local
    // spotify = "";

    
    // .finally(function () {
    //     // always executed
    // });

    // Création d'une playlist avec les données récupérées
    //"items": [ {} ],

    // console.log(req);

    playlist = [];
    // for (let playlist of data.body.items) {
        // playlist += items[i];
        // DEBUG
        // console.log(playlist);
    // }
}

// Based on 'someone' and 'tracks'
const createPlaylistTracksFromSomeone = async (req, res) => {


/*  
    #swagger.summary = "Création de playlists (FT-8)"
    #swagger.description = "Crée une playlist."
*/

    let actual_uid = req.user.uid;
    let playlistName = req.body.playlistName;
    let user = users.findOne(req.body.user);

    /*
    * GET OR REFRESH USER.LINK.ACCESS IN USERS.JSON DATA FILE :
    */  
    let isLinked = await spotify.isLinked(actual_uid);
    let otherLinked = await spotify.isLinked(user.uid);
    
    if(!user) 
        return res.status(400).json("Cet utillisateur n'xiste pas.");
    if(!otherLinked) 
        return res.status(400).json("L'utilisateur n'a pas lié de compte Spotify.");
    if(!isLinked) 
        return res.status(400).json("Vous n'avez pas lié de compte Spotify.");
    
    let actual_access_token = await spotify.getToken(actual_uid); //! important
    let wanted_access_token = await spotify.getToken(user.uid); //! important
    
    // 1. PLAYLIST CREATION

    let topTracks = await getTopTracks(wanted_access_token, 10);
    let idLists = [];

    for (const key in topTracks) {
        let id = topTracks[key].id;
        idLists.push(id);
    }

    // console.log(idLists);
    let count = 0;
    let strId = "";

    for (const key in idLists) {
        let id = idLists[key];
        idLists[key] = `spotify:track:${id}`;
    }
    console.log(strId)

    // Création de la playlist ===================================================
    let createdPlaylist = await axios({
        method: 'post',
        url: `https://api.spotify.com/v1/me/playlists`,
        headers: { 
            'Authorization': 'Bearer ' + actual_access_token,
            'accept-encoding': 'null'
        },
        data: {
            'name': playlistName,
            "description": "Your new awesome playlist.",
            "public": true
        }
      })
    .then((response) => {
        return response.data;
    })
    .catch((err) => {
        console.log(err.response.data.error);
        return res.status(500).json("Une erreur inattendue est survenue lors de la création de la playlist.");
    })

    let idPlaylist = createdPlaylist.id;
    
    // Remplissage de la playlist =============================================



//     url --request POST \
//   --url https://api.spotify.com/v1/playlists/playlist_id/tracks \
//   --header 'Authorization: ' \
//   --header 'Content-Type: application/json' \
//   --data '{
//   "uris": [
//     "string"
//   ],

    await axios({
        method: 'post',
        url: `https://api.spotify.com/v1/playlists/${idPlaylist}/tracks`,
        headers: { 
            'Authorization': 'Bearer ' + actual_access_token,
            'accept-encoding': 'null',
            'Content-Type': 'application/json'
        },
        data: {
            "uris": idLists
        }
      })
    .then((response) => {
        return res.status(200).json(response.data);
    })
    .catch((err) => {
        console.log(err.response.data.error);
        return res.status(500).json("Une erreur inattendue est survenue lors de la création de la playlist.");
    })

    res.send();
}

getTopTracks = async (access_token, limit) => {
    var options = {
        headers: { 
            'Authorization' : 'Bearer ' + access_token,
            'accept-encoding': 'null'
        }
    };
 
    return await axios.get(`https://api.spotify.com/v1/me/top/tracks?limit=${limit}`, options)
      .then(function (response) {
        console.log("NO ERROR");
        return response.data.items;
    })
    .catch(function (error) {
        console.log("error =====================================================================================");
        console.log(error);
    })
}

module.exports = {
    createPlaylistTracksFromMyself,
    createPlaylistTracksFromSomeone
}