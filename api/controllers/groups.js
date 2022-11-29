// 📚 Librairies
const jwt = require("jsonwebtoken");
const spotify = require('./spotify');

// DISPLAY ALL GROUPS' NAME AND SIZE
module.exports.listGroup = async (req, res) => {
    /* 
        #swagger.summary = 'Afficher les groupes (FT-5)'
        #swagger.description = "Affiche la liste des groupes existants et leur taille."
    */
    const file = require('../data/users.json');

    var listGroups = [];

    const groups = file.groups;

    const user = getUserByUid(req.user.uid);

    groups.forEach(group => {
        var groupInfo = {
            group_name : group.name,
            number_of_members : group?.members.length,
        }

        listGroups.push(groupInfo);
    });

    return res.status(200).json(listGroups);
}


// Join a group
module.exports.joinGroup = async (req, res) => {
    /* 
        #swagger.summary = 'Rejoindre un groupe (FT-4)'
        #swagger.description = "Rejoindre un groupe."
    */
    // Get uid and groupName from POST request
    const groupName = req.body.groupName;

   const uid = req.user.uid;

    if(uid == undefined || uid == "") {
        return res.status(401).json("Vous n'êtes pas authentifié(e).");
    }

    if(groupName == undefined || groupName == "") {
        return res.status(400).json("Aucun nom de groupe n'a été spécifié.");
    }

    // Current user     
    const user = getUserByUid(uid);

    // Check if user exist
    if(user == undefined) {
        return res.status(400).json("Erreur lors de la tentative de récupération de l'utilisateur.");
    }  
    
    // If user is already in a group
    if (user.group != undefined && user.group != "") {
        quitterGroup(user.group , user.username);
        
        if ( isUserChiefGroup(user.group , user.username) ) {
            if (isMembersInGroup(user.group)) {
                console.log("give chief...")
                giveChiefToSomeoneElseRandom(user.group);
            } else {
                deleteGroup(user.group);
            }
        }          
    } 


    if(isExistGroup(groupName)) {
        addMemberToGroup(groupName, user.username);
    } else {
        // Create new group object
        const newGroup = {
            name: groupName,
            chief: user.username,
            members: [user.username]
        } 
        createGroup(newGroup);        
    }

    updateUserGroup(groupName, user.username);  

    return res.status(200).json("L'utilisateur a rejoint le groupe '" + groupName + "'.");
}

module.exports.listMembersOfGroup = async (req, res) => {    
    /* 
        #swagger.summary = 'Afficher les détails de son groupe (FT-5 bis)'
        #swagger.description = "Affiche le détail de membres du groupe auquel l'utilisateur appartient."
        #swagger.responses[403] = { description: "Vous n'appartenez à aucun groupe." } 
    */
    const currentUser = getUserByUid(req.user.uid);

    var listAllMembers = [];

    if(!currentUser.group || currentUser.group === '')
        return res.status(403).json("Vous n'êtes pas autorisé(e) à effectuer cette opération.");

        const fs = require('fs');
        const file = '../api/data/users.json';
        const data = fs.readFileSync(file, 'utf-8');
        const parsedData = JSON.parse(data);

        var userGroup;

        parsedData.groups.forEach(async g => {
            if(g.name == currentUser.group) {
                userGroup = g;
            }
        })

        for (let index = 0; index < userGroup.members.length; index++) {
            var mName = userGroup.members[index];

            var result = {
                memberName : mName,
                isChief : userGroup.chief === mName
            }

            // Check if user linked access is empty or not
            let userInformation = getUserByUserName(mName)
        
            if (userInformation.link != undefined) {
                let link = userInformation.link
            
                if (link.access != undefined && link.access != "") {
                    
                    // Get spotify username
                    let spotifyUsername = await spotify.getSpotifyUsername(link.access);
                    result.spotifyPseudo = spotifyUsername;

                    // Get spotify device name and current music info
                    let userPlayingSongAndDevice = await spotify.getUserPlayingSongInfoAndDevice(link.access);
                  
                    if (userPlayingSongAndDevice != undefined && userPlayingSongAndDevice != '') {
                    
                        result.device = userPlayingSongAndDevice.device.name;
                        result.currentAlbumTitle = userPlayingSongAndDevice.item.album.name;
                        result.artist = userPlayingSongAndDevice.artists[0].name;
                    }
                }
            }

            listAllMembers.push(result);
        };
        return res.status(200).json(listAllMembers);
    }

// Create group
function createGroup(newGroup) {
    const fs = require('fs');
    const file = '../api/data/users.json';
   
    try {
        console.log("Creating group...");

        const data = fs.readFileSync(file, 'utf-8');
        const parsedData = JSON.parse(data);
        parsedData.groups.push(newGroup);
        fs.writeFileSync(file, JSON.stringify(parsedData));

        console.log("Group created...");

    } catch (err) {
        console.error(err)
    }    
}

// CHECK if the group is already exist
function isExistGroup(nameGroup) {
    console.log("Search group : " + nameGroup);
  
    const file = require('../data/users.json');

    const groups = file.groups;
    const group = groups.find(g => g.name.toLowerCase() === nameGroup.toLowerCase());

    if(group == undefined){
        return false;
    }

    return true;    
}

// Get the username with user uid
function getUserByUid(uid) {
    //const file = require('../users.json');
    const file = require('../data/users.json');

    const users = file.users;
    const user = users.find(u => u.uid === uid);

    if(user == undefined) {
        return undefined;
    }

    return user;
}

function getUserByUserName(username) {
     const file = require('../data/users.json');

     const users = file.users;
     const user = users.find(u => u.username === username);
 
     if(user == undefined) {
         return undefined;
     }
 
     return user;
}

// Check if user id chief of group
function isUserChiefGroup(groupName, userName) {

    const file = require('../data/users.json');
    //const file = require(USER_JSON);

    const groups = file.groups;
    const group = groups.find(g => g.name === groupName);
    
    if(group != undefined && group.chief == userName) {
        return true;
    }

    return false;  
}

// Update the group name of the user
function updateUserGroup(groupName, userName) {
    const fs = require('fs');
    const file = '../api/data/users.json';
    //const file = USER_JSON;

    try {
        console.log("Updating user...");

        const data = fs.readFileSync(file, 'utf-8');
        const parsedData = JSON.parse(data);

        parsedData.users.forEach(user => {
            if (user.username == userName) {
                user.group = groupName

                console.log(user.group);
            }           
        });     

        fs.writeFileSync(file, JSON.stringify(parsedData));

        console.log("User updated...");

    } catch (err) {
        console.error(err)
    }
}

// User quit his group
function quitterGroup(groupName, userName) {
    const fs = require('fs');
    const file = '../api/data/users.json';
    //const file = USER_JSON;

    try {
        console.log("Quit the group...");

        const data = fs.readFileSync(file, 'utf-8');
        const parsedData = JSON.parse(data);


        parsedData.groups.forEach(group => {
            if (group.name == groupName) {
                // Get index of the user from members and then delete 
                group.members.splice(group.members.indexOf(userName),1);
            }           
        });  


        fs.writeFileSync(file, JSON.stringify(parsedData));

        console.log("Quit success.");

    } catch (err) {
        console.error(err)
    }
}

// Delete a group
function deleteGroup(groupName) {
    const fs = require('fs');
    const file = '../api/data/users.json';
    //const file = USER_JSON;

    try {
        console.log("Delete the group...");

        const data = fs.readFileSync(file, 'utf-8');
        const parsedData = JSON.parse(data);


        parsedData.groups.forEach(group => {
            if (group.name == groupName) {
               parsedData.groups.splice(parsedData.groups.indexOf(group), 1);
            }           
        });  


        fs.writeFileSync(file, JSON.stringify(parsedData));

        console.log("Delete success.");

    } catch (err) {
        console.error(err)
    }
}

// Give chief randomly to someone in the group
function giveChiefToSomeoneElseRandom(groupName) {
    const fs = require('fs');
    const file = '../api/data/users.json';
    //const file = USER_JSON;

    try {
        console.log("Give chief to random member...");

        const data = fs.readFileSync(file, 'utf-8');
        const parsedData = JSON.parse(data);


        parsedData.groups.forEach(group => {
            if (group.name == groupName) {
                let index = Math.floor(Math.random() * group.members.length);

                group.chief = group.members[index];
            }           
        });  


        fs.writeFileSync(file, JSON.stringify(parsedData));

        console.log("Give chief success.");

    } catch (err) {
        console.error(err)
    }
}

// Check if user is already in any group
function userIsAlreadyInGroup(userName) {
    const file = require('../data/users.json');
    //const file = require(USER_JSON);

    const users = file.users;
    const user = users.find(u => u.username === userName);

    if(user.group == undefined || user.group != "") {
        return true;
    }

    return false;
   
}

// Check if there is anyone in the group
function isMembersInGroup(groupName) {
    const fs = require('fs');
    const file = '../api/data/users.json';
    //const file = USER_JSON;

    let isMembersInGroup = false

    try {
        const data = fs.readFileSync(file, 'utf-8');
        const parsedData = JSON.parse(data);

        parsedData.groups.forEach(group => {
            if (group.name == groupName) {
               
               if(group.members.length > 0) {
                isMembersInGroup = true
               }
            }           
        });         

        return isMembersInGroup;
    } catch (err) {
        console.error(err)
    }
}

function addMemberToGroup(groupName, userName) {
    const fs = require('fs');
    const file = '../api/data/users.json';
    //const file = USER_JSON;

    try {
        console.log("Add a member to Group.");

        const data = fs.readFileSync(file, 'utf-8');
        const parsedData = JSON.parse(data);


        parsedData.groups.forEach(group => {
            if (group.name == groupName) {
                group.members.push(userName);
            }           
        });  


        fs.writeFileSync(file, JSON.stringify(parsedData));

        console.log("Add a member to group success.");

    } catch (err) {
        console.error(err)
    }
}