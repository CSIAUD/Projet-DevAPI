const router = require("express").Router();
const groupController = require("../controllers/groups.js");
const middleware = require('../controllers/middleware');


router.get("/", groupController.listGroup); // DISPLAY ALL GROUPS

router.get("/members", middleware.verify, groupController.listMembersOfGroup); // DISPLAY ALL MEMBERS OF GROUP

router.post("/", middleware.verify, groupController.joinGroup); // JOIN A GROUP 

module.exports = router