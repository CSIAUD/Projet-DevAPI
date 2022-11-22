const router = require("express").Router();
const securityController = require("../controllers/playlist.js");

router.get("/me/top/tracks", securityController.createPlaylistTracksFromMyself);  // create a playlist with the 10 favorites songs from myself based on tracks
router.get("/me/top/artists", securityController.createPlaylistArtistsFromMyself);  // create a playlist with the 10 favorites songs from myself based on artists

router.get("/{someone}/top/tracks", securityController.createPlaylistTracksFromSomeone);  // create a playlist with the 10 favorites songs from someone based on his tracks
router.get("/{someone}/top/artists", securityController.createPlaylistArtistsFromSomeone);  // create a playlist with the 10 favorites songs from someone based on his artists

module.exports = router