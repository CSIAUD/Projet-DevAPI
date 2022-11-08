const router = require("express").Router();
const usersController = require("../controllers/users.js");

router.post("/", usersController.register);  // REGISTER NEW USER

module.exports = router