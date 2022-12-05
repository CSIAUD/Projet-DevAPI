const router = require("express").Router();
const securityController = require("../controllers/playlist.js");
const userMiddleWare = require('../controllers/middleware.js');

router.get("/me/top/tracks", userMiddleWare.verify, securityController.createPlaylistTracksFromMyself);  // create a playlist with the 10 favorites songs from myself based on tracks
router.get("/other/top/tracks", userMiddleWare.verify, securityController.createPlaylistTracksFromSomeone);  // create a playlist with the 10 favorites songs from myself based on tracks

module.exports = router