const router = require("express").Router();
const middleWare = require('../controllers/middleware.js')
const spotifyController = require("../controllers/spotify.js");
const playlistsController = require("../controllers/playlists.js");
const synchronizeController = require("../controllers/synchronize.js");

router.get("/callback", spotifyController.callback);
router.get("/link", middleWare.verify ,spotifyController.link);
router.get("/me", middleWare.verify ,spotifyController.profile);
router.put("/synchronize", middleWare.verify, synchronizeController.synchronize);
router.post("/playlist", middleWare.verify, playlistsController.createPlaylist);

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