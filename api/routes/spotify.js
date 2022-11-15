const router = require("express").Router();
const spotifyController = require("../controllers/spotify.js");

router.get("/refresh_token", spotifyController.refreshToken);
router.get("/callback", spotifyController.callback);
router.post("/link", spotifyController.link);

module.exports = router