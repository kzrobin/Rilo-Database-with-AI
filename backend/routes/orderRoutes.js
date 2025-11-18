const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/admin/orderController");
const authMiddleware = require("../middleware/authUser");
// You can create this simple middleware to protect admin routes
const { restrictToAdmin } = require("../middleware/roleMiddleware");

const router = express.Router();

// All routes below are protected and require a user to be logged in
router.use(authMiddleware);

router.route("/").post(createOrder);

router.route("/my-orders").get(getMyOrders);

router.route("/:id").get(getOrderById);

// --- ADMIN ONLY ROUTE ---
// This route is further protected to only allow admins
router.route("/:id/status").patch(restrictToAdmin, updateOrderStatus);

module.exports = router;
