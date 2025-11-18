const express = require("express");
const { body, param, validationResult } = require("express-validator");
const router = express.Router();

const {
  placeOrder,
  getMyOrders,
  getOrderById,
} = require("../../controllers/shop/orderController");
const authUser = require("../../middleware/authUser");

router.post(
  "/",
  authUser,
  body("addressId")
    .notEmpty()
    .withMessage("addressId is required")
    .isMongoId()
    .withMessage("Invalid addressId"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return placeOrder(req, res, next);
  }
);

router.get("/", authUser, getMyOrders);

router.get(
  "/:id",
  authUser,
  param("id").isMongoId().withMessage("Invalid order ID"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return getOrderById(req, res, next);
  }
);

module.exports = router;
