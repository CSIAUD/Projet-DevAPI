const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports.getToken = async (req, res) => {
    /* #swagger.security = [{
        "basicAuth": []
        }] 

        #swagger.responses[200] = { description: "Token généré avec succès." } 
        #swagger.responses[404] = { description: "Ce compte n'existe pas." } 
    */

    try {
        const auth = req.header('Authorization'); // ou req.headers.authorization, avec un S à headers

        if(!auth)
            return res.status(401).json("Aucun identifiant n'a été fourni. Une authentification Basic Auth est requise.");

        const credentials = auth.split(' ')[1];
        const raw = Buffer.from(credentials, 'base64').toString('utf8');
        const [username, password] = raw.split(':');

        // 👩‍🔧 Recherche de l'utilisateur :
        const user = findOne(username);

        // ❌ Si l'utilisateur est inexistant :
        if(!user)
            return res.status(404).json("Ce compte n'existe pas.");
        
        // 🔒 Si le mot de passe est invalide :
        const validPassword = bcrypt.compareSync(password, user.password);
        if(!validPassword)
            return res.status(401).json("Le mot de passe est incorrect.");

        // 🔑 Génération du token :
        const accessToken = jwt.sign({
            uid: user.uid, 
        }, process.env.JWT_SECRET, 
        {expiresIn: "1h"}
        )

        // ✔️ Requête valide :
        res.status(200).json({ uid: user.uid, username: user.username, token: accessToken });

        } catch (err) {
            console.log(err)
            return res.status(500).json(err);
        }
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

