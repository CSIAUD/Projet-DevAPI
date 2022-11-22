// 📚 Librairies
const { uuid } = require('uuidv4');
const bcrypt = require("bcrypt");


// Variable global
const USER_JSON = '../data/users.json';

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

// Recherche d'un utilisateur existant :
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

