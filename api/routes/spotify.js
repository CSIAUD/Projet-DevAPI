const router = require("express").Router();
const spotifyController = require("../controllers/spotify.js");
const middleWare = require('../controllers/middleware.js')

router.get("/refresh_token", spotifyController.refreshToken);
router.get("/callback", spotifyController.callback);
router.get("/link", middleWare.verify, spotifyController.link);

module.exports = router