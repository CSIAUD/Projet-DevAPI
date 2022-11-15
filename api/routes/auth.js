const router = require("express").Router();
const securityController = require("../controllers/auth.js");

router.get("/", securityController.getToken);  // GET A TOKEN FOR LOGGING IN

module.exports = router