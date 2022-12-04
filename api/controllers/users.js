// 📚 Librairies
const { uuid } = require('uuidv4');
const bcrypt = require("bcrypt");

// CREATION D'UN COMPTE
module.exports.register = async (req, res) => {
    /*  
        #swagger.summary = 'Inscrire un utilisateur (FT-1)'
        #swagger.description = 'Crée un utilisateur dans la base de données.'
        #swagger.responses[200] = { description: "Inscription réussie." } 
        #swagger.responses[400] = { description: "Aucun identifiant n'a été saisi." } 
        #swagger.responses[422] = { description: "Ce nom d'utilisateur n'est pas disponible." } 
    */
    try {

        if(!req.body.username || !req.body.password)
            return res.status(400).json("Aucun identifiant n'a été saisi.");

        // Hashage du mot de passe :
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);

        // Vérification que l'utilisateur n'existe pas déjà :
        if(findOne(req.body.username)) {
            return res.status(422).json("Ce nom d'utilisateur existe déjà.");
        }

        // Création du nouvel utilisateur :
        const user = {
            uid: uuid(),
            username: req.body.username,
            password: hashedPassword,
            group : "",
            link : {
                access: "",
                refresh: ""
              }
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
    //const file = '../api/users.json';
    const file = USER_JSON;

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

// Recherche d'un utilisateur existant (par son username) :
const findOne = (username) => {
    try {
        //const file = require('../users.json');
        const file = require(USER_JSON);
        const users = file.users;
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        return user;
    } catch(err) {
        console.log(err);
        throw 'Unable to search users list.'
    }
}

// Recherche d'un utilisateur existant (par son uid) :
module.exports.findOneById = (uid) => {
    try {
        const file = require('../data/users.json');
        const users = file.users;
        const user = users.find(u => u.uid === uid);
        return user;
    } catch(err) {
        console.log(err);
        throw 'Unable to search users list.'
    }
}