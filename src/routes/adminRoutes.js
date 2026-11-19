const express = require("express");
const { protect, allowRoles } = require("../middleware/auth");
const { getUsers } = require("../controllers/adminController");

const router = express.Router();
router.get("/users", protect, allowRoles("admin"), getUsers);

module.exports = router;
