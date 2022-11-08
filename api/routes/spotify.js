const router = require("express").Router();
const spotifyController = require("../controllers/spotify.js");

router.get("/refresh_token", spotifyController.refreshToken);
router.post("/link", spotifyController.link);

module.exports = router