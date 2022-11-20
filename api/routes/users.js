const router = require("express").Router();
const usersController = require("../controllers/users.js");

router.get("/listgroups", usersController.listGroup);

router.get("/listmembers", usersController.listMembersOfGroup);

router.post("/", usersController.register);  // REGISTER NEW USER

router.post("/joingroup", usersController.joinGroup); // JOIN A GROUP 



module.exports = router