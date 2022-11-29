const router = require("express").Router();
const securityController = require("../controllers/playlist.js");

router.get("/me/top/tracks", securityController.createPlaylistTracksFromMyself);  // create a playlist with the 10 favorites songs from myself based on tracks

module.exports = router