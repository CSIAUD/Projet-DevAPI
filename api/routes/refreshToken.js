const router = require("express").Router();
const refreshController = require("../controllers/refreshToken.js");

router.get("/", refreshController.refreshToken);  // GET A TOKEN FOR LOGGING IN

module.exports = router