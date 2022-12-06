// 📚 Librairies
const axios = require('axios');

// 🕹️ Controllers
const groupsController = require('../controllers/groups');
const spotify = require('../controllers/spotify');
const users = require('./users');

const synchronize = async (req, res) => {
    /*  
        #swagger.summary = "Synchronisation (FT-7)"
        #swagger.description = "Synchronise la lecture d'un chef de groupe avec celles des autres utilisateurs."
        #swagger.responses[200] = { description: "Synchronisation effectuée avec succès." } 
        #swagger.responses[204] = { description: "L'appareil d'écoute n'est pas actif." } 
    */

    let actual_uid = req.user.uid;
    let actual_user = groupsController.getUserByUid(actual_uid);
  
    if (!actual_user.group || actual_user.group === "")
        return res.status(400).json("L'utilisateur n'a pas de groupe.");

    if(!await spotify.isLinked(actual_uid))
        return res.status(400).json("L'utilisateur n'a pas lié de compte Spotify.");
    
    let actual_access_token = await spotify.getToken(actual_uid)
    const isChiefOfGroup = groupsController.isUserChiefGroup(actual_user.group, actual_user.username);
  
    if(!isChiefOfGroup)
        return res.status(403).json("L'utilisateur n'est pas le chef du groupe.");
    
    let actual_deviceInformations = await spotify.getUserDeviceName(actual_access_token);
    actual_deviceInformations = actual_deviceInformations[0];

    // Check if chief device is active
    if(!actual_deviceInformations.is_active)
        return res.status(204).json("L'appareil d'écoute n'est pas actif.");

    // Get list of members
    let listMembers = (await groupsController.listMembersOfGroup(req, res)).members;

    // Récupération de la musique en cours d'écoute + temps
    let current_track = await axios.get('https://api.spotify.com/v1/me/player', {
        headers : {
        Authorization : "Bearer " + actual_access_token,
        'accept-encoding': 'null'
        }
    })
    .then(function (response) {      
        return {
            "id": response.data.item.id,
            "progress": response.data.progress_ms
        };
    })
    .catch(async function (error) {
        console.log('error get current track')
        return false;
    })
    console.log(current_track)

    // For each member of the group

    for (const key in listMembers) {
        let member = listMembers[key];
        if(member.isChief)
            continue;
        
        let localUser = users.findOne(member.memberName);
        let access_token = await spotify.getToken(localUser.uid);
        let device = (await spotify.getUserDeviceName(access_token))[0];

        const data = { 
            "uris": [`spotify:track:${current_track?.id}`],
            "position_ms": current_track.progress
        };
        const headers = { 
            'Authorization' : "Bearer " + access_token,
            'Content-Type': 'application/json',
            'accept-encoding': 'null'
        };

        await axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${device?.id}`, data, { headers })
        .then(function (response) {
            console.log(response.data)
        })
        .catch(async function (error) {
            console.log('error ===============================')
            console.log(error.response)
            console.log('error set track')
        })
    }
    
    return res.status(200).json("Synchronisation effectuée.");
}

module.exports = { synchronize }