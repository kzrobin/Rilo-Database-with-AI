// routes/aiQueryRoutes.js

const express = require("express");
const { translateAndRunQuery } = require("../controllers/aiQueryController");
const authMiddleware = require("../middleware/authUser");
const { restrictToAdmin } = require("../middleware/roleMiddleware");

const router = express.Router();

// This is a very powerful endpoint, so it should be protected and restricted to admins.
router.route("/").post(authMiddleware, restrictToAdmin, translateAndRunQuery);

module.exports = router;
