/**
 * Vérifie que l'utilisateur dispose bien d'un access token valide.
 * L'access token doit être fourni dans un header Authorization de type Bearer.
 * S'intercale dans une route avant la fonction d'exécution.
 *
 * @example Dans un fichier /api/routes/<nom-du-fichier>.js :
 * 
 * const middleware = require('../controllers/middleware'); // Import du middleware
 * router.get('/', middleware.verify, <controller>.<function>); // Déclaration de la route
 * 
 */

const jwt = require("jsonwebtoken");

const verify = (req, res, next) => {
    /* 
        #swagger.security = [{
            "bearerAuth": []
        }] 
        #swagger.responses[401] = { description: "Vous n'êtes pas authentifié(e)." } 
        #swagger.responses[403] = { description: "Le token est invalide." } 
    */
    const authHeader = req.headers.authorization;

    // ❌ No 'Authorization' header :
    if(!authHeader)
        return res.status(401).json("Vous n'êtes pas authentifié(e).");

    const token = authHeader.split(' ')[1];     // authHeader.split(' ')[0] == 'Bearer'

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if(err)
            return res.status(403).json("Le token d'accès est invalide. Le format suivant doit être respecté : Bearer <access-token>.");
        
        req.user = payload;
        next();
    })
}

module.exports = { verify };