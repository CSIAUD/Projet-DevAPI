const router = require("express").Router();
const securityController = require("../controllers/synchronisation.js");

router.get("/audio-features", securityController.getSynchro);  // Synchronise song between users of a group

module.exports = router