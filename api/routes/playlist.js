const router = require("express").Router();
const securityController = require("../controllers/playlist.js");

router.get("/me/top/tracks", securityController.createPlaylistTracks);  // create a playlist with the 10 favorites songs from someone (or myself) passed in parameters
router.get("/me/top/artists", securityController.createPlaylistArtists);  // create a playlist with the 10 favorites songs from someone (or myself) passed in parameters

module.exports = router