const router = require("express").Router();
const securityController = require("../controllers/playlist.js");

router.get("/me/top", securityController.createPlaylist);  // create a playlist with the 10 favorites songs from someone (or myself) passed in parameters

module.exports = router