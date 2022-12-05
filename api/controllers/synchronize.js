// 📚 Librairies
const axios = require('axios');

// 🕹️ Controllers
const groupsController = require('../controllers/groups');
const spotify = require('../controllers/spotify');

const synchronize = async (req, res) => {
    /*  
        #swagger.summary = "Synchronisation (FT-7)"
        #swagger.description = "Synchronise la lecture d'un chef de groupe avec celles des autres utilisateurs."
        #swagger.responses[200] = { description: "Synchronisation effectuée avec succès." } 
        #swagger.responses[204] = { description: "L'appareil d'écoute n'est pas actif." } 
    */

    let uid = req.user.uid;
    let user = groupsController.getUserByUid(uid);
  
    if (!user.group || user.group === "") {
        return res.status(400).json("L'utilisateur n'a pas de groupe.");
    }

    if(!user.link)
        return res.status(400).json("L'utilisateur n'a pas lié de compte Spotify.");
  
    const isChiefOfGroup = groupsController.isUserChiefGroup(user.group, user.username);
  
    if(!isChiefOfGroup) {
        return res.status(403).json("L'utilisateur n'est pas le chef du groupe.");
    }

    /*
    * GET OR REFRESH USER.LINK.ACCESS IN USERS.JSON DATA FILE :
    */  
    await spotify.getToken(uid); //! important

    let link = user.link

    // Check if chief is connected to Spotify
    if(!link.access || link.access === "") {
        return res.status(403).json("Le token Spotify (link.access) n'est pas défini (null, undefined, empty string).");
    }
    
    let deviceInformations = await spotify.getUserDeviceName(link.access);
    //console.log("device :")
    //console.log(deviceInformations);

    // Check if chief device is active
    if(!deviceInformations.is_active) {
        return res.status(204).json("L'appareil d'écoute n'est pas actif.");
    }

    // Get list of members
    let listMembers = await groupsController.listMembersOfGroup(req, res);
    //console.log("liste :")
    //console.log(listMembers);

    // For each member of the group
    for (let index = 0; index < listMembers.length; index++) {
    let member = listMembers[index];

    memberInformation = groupsController.getUserByUserName(member.memberName);

    // Check if member has link spotify
    if(memberInformation.link.access != undefined && memberInformation.link.access != "") {
        axios.put('https://api.spotify.com/v1/me/player', {
                headers : {
                Authorization : "Bearer " + link.access
                },
                devices_ids : [ member.device.split(' ')[0] ]
            })
            .then(function (response) {      
                return response;
            })
            .catch(async function (error) {
                return "ERROR : Transfer playback";
            })
        }
    } 
    
    return res.send(user); // ???
}

module.exports = { synchronize }