const spotify = require('../controllers/spotify.js'); // Import du controller
const users = require('../controllers/auth.js'); // Import du controller

const axios = require('axios');


const createPlaylist = async (req, res) => {
    /*  
        #swagger.summary = "Création de playlists (FT-8)"
        #swagger.description = `Crée une playlist contenant les 10 Top Tracks de l'utilisateur YSpotify passé en paramètre. 
                                Saisissez un nom pour votre playlist et le nom d'un utilisateur local (YSpotify) ayant lié son compte Spotify au service YSpotify.`
    */

    const actual_uid = req.user.uid;
    const playlistName = req.body.playlist_name;
    const username = req.body.username;
    const user = users.findOne(username);

    /*
    * GET OR REFRESH USER.LINK.ACCESS IN USERS.JSON DATA FILE :
    */  
    let isLinked = await spotify.isLinked(actual_uid);
    let otherLinked = await spotify.isLinked(user.uid);
    
    if(!user) 
        return res.status(400).json("L'utillisateur choisi n'existe pas.");
    if(!otherLinked) 
        return res.status(400).json("L'utilisateur choisi n'a pas lié de compte Spotify.");
    if(!isLinked) 
        return res.status(403).json("Vous n'avez pas lié de compte Spotify.");
    
    let actual_access_token = await spotify.getToken(actual_uid); //! important
    let wanted_access_token = await spotify.getToken(user.uid); //! important
    
    // 1. PLAYLIST CREATION
    let topTracks = await getTopTracks(wanted_access_token, 10);
    let idLists = [];

    for (const key in topTracks) {
        let id = topTracks[key].id;
        idLists.push(id);
    }

    let count = 0;
    let strId = "";

    for (const key in idLists) {
        let id = idLists[key];
        idLists[key] = `spotify:track:${id}`;
    }

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
        console.log(err.response);
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
        console.log(err.response);
        return res.status(500).json("Une erreur inattendue est survenue lors de la création de la playlist.");
    })

    res.send();
}

const getTopTracks = async (access_token, limit) => {
    var options = {
        headers: { 
            'Authorization' : 'Bearer ' + access_token,
            'accept-encoding': 'null'
        }
    };
 
    return await axios.get(`https://api.spotify.com/v1/me/top/tracks?limit=${limit}`, options)
      .then(function (response) {
        console.log("OK - Get TopTracks");
        return response.data.items;
    })
    .catch(function (error) {
        console.log("error GetTopTracks =====================================================================================");
        console.log(error);
    })
}


module.exports = { createPlaylist }