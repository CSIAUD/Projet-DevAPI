const router = require("express").Router();
const spotifyController = require("../controllers/spotify.js");
const middleWare = require('../controllers/middleware.js')

router.get("/callback", spotifyController.callback);
router.get("/link", middleWare.verify ,spotifyController.link);
router.get("/me", middleWare.verify ,spotifyController.profile);
router.put("/sync", middleWare.verify, spotifyController.synchronisation);

module.exports = router

// ENDPOINT : /api/spotify/callback
// USAGE : Route de retour pour la connexion à Spotify
// METHOD : [get]
// Parameters : query.code => Code envoyé par Spotify
//              query.state => Username renvoyé par Spotify

// ENDPOINT : /api/spotify/link
// USAGE : Activation du lien entre le compte API et le compte Spotify
// METHOD : [get]
// Parameters : header.authorization => Bearer + Token utilisateur