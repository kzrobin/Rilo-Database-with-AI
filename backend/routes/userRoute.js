const express = require("express");
const { createUser } = require("../controllers/userController");

const router = express.Router();

// Define the route for creating a user
// POST request to /api/users/ will be handled by the createUser controller
router.post("/", createUser);

module.exports = router;
