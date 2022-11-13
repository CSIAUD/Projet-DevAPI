// 📚 Librairies
const fs = require('fs');
const { uuid } = require('uuidv4');
const bcrypt = require("bcrypt");
const { group, assert } = require('console');
const { use } = require('../routes/users');

module.exports.register = async (req, res) => {
    try {
        // Hashage du mot de passe :
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);

        // Vérification que l'utilisateur n'existe pas déjà :
        if(findOne(req.body.username)) {
            return res.status(400).json("Ce nom d'utilisateur existe déjà.");
        }

        // Création du nouvel utilisateur :
        const user = {
            uid: uuid(),
            username: req.body.username,
            password: hashedPassword
        };

        addUser(user);
  
        // ✔️ Requête valide :
        res.status(200).json({ uid: user.uid, username: user.username });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err);
    }
}

// Ajout d'un nouvel utilisateur dans le fichier JSON :
addUser = (user) => {
    const { writeFile, readFile } = require('fs');
    const file = '../api/data/users.json';

    readFile(file, (err, data) => {
        if (err) {
          console.log("Une erreur est survenue lors de l'écriture du nouvel utilisateur.", err);
          return;
        }
        const parsedData = JSON.parse(data);
        parsedData.users.push(user);
        writeFile(file, JSON.stringify(parsedData, null, 2), (err) => {
          if (err) {
            console.log("Une erreur est survenue lors de la mise à jour du fichier users.json.");
            return;
          }
          console.log("L'utilisateur a été ajouté.");
        });
    });
}

// Recherche d'un utilisateur existant :
const findOne = (username) => {
    try {
        const file = require('../data/users.json');
        const users = file.users;
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        return user;
    } catch(err) {
        console.log(err);
        throw 'Unable to search users list.'
    }
}



// List all groups
module.exports.listGroup = async (req, res) => {

    const file = require('../users.json');

    var listGroups = [];

    const groups = file.groups;

    groups.forEach(g => {
        var groupInfo = {
            groupName : '',
            numberOfMembers : 0
        }
        groupInfo.groupName = g.name
        groupInfo.numberOfMembers = g.members.length

        listGroups.push(groupInfo);
    });

    return res.status(200).json(listGroups);
}


// Join a group
module.exports.joinGroup = async (req, res) => {
    // Get uid and groupName from POST request
    const groupName = req.body.groupName;
    const uid = req.body.uid

    if(uid == undefined || uid == "") {
        return res.status(400).json("Error : uid is missing.");
    }

    if(groupName == undefined || groupName == "") {
        return res.status(400).json("Error : group name is missing.");
    }

    // Current user     
    const user = getUserByUid(uid);

    // Check if user exist
    if(user == undefined) {
        return res.status(400).json("Error : user is not exist.");
    }  
    
    // If user is already in a group
    if (user.group != undefined && user.group != "") {
        quitterGroup(user.group , user.username)
        
        if ( isUserChiefGroup(user.group , user.username) ) {
            if (isMembersInGroup(user.group)) {
                console.log("give chief...")
                giveChiefToSomeoneElseRandom(user.group)
            } else {
                deleteGroup(user.group)
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
    updateUserGroup(groupName, user.username)    
               
     

    return res.status(200).json("User has joined the group " + groupName);
}

// Create group
function createGroup(newGroup) {
    const fs = require('fs');
    const file = '../api/users.json';
   
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
  
    const file = require('../users.json');

    const groups = file.groups;
    const group = groups.find(g => g.name.toLowerCase() === nameGroup.toLowerCase());

    if(group == undefined){
        return false;
    }

    return true;    
}

// Get the username with user uid
function getUserByUid(uid) {
    const file = require('../users.json');

    const users = file.users;
    const user = users.find(u => u.uid === uid);

    if(user == undefined) {
        return undefined;
    }

    return user;
}

// Check if user id chief of group
function isUserChiefGroup(groupName, userName) {

    const file = require('../users.json');

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
    const file = '../api/users.json';

    try {
        console.log("Updating user...");

        const data = fs.readFileSync(file, 'utf-8');
        const parsedData = JSON.parse(data);

        parsedData.users.forEach(user => {
            if (user.username == userName) {
                user.group = groupName
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
    const file = '../api/users.json';

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
    const file = '../api/users.json';

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
    const file = '../api/users.json';

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
    const file = require('../users.json');

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
    const file = '../api/users.json';

    let isMembersInGroup = false

    try {
        const data = fs.readFileSync(file, 'utf-8');
        const parsedData = JSON.parse(data);

        parsedData.groups.forEach(group => {
            if (group.name == groupName) {
                console.log(group.members.length != 0)
                console.log(group.members.length > 0)
               if(group.members.length != 0) {
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
    const file = '../api/users.json';

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