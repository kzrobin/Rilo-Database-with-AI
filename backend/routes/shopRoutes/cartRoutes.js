const express = require("express");
const { body, validationResult } = require("express-validator");

const {
  getMyCart,
  addOrUpdateCartItem,
  removeItemFromCart,
} = require("../../controllers/shop/cartController");
const authuser = require("../../middleware/authUser");

const router = express.Router();

router.use(authuser);

// GET cart
router.route("/").get(getMyCart);

// POST add/update cart item
router
  .route("/")
  .post(
    authuser,
    [
      body("productId")
        .notEmpty()
        .withMessage("Product ID is required.")
        .isMongoId()
        .withMessage("Invalid Product ID."),
      body("quantity")
        .notEmpty()
        .withMessage("Quantity is required.")
        .isInt({ min: 1 })
        .withMessage("Quantity must be a positive integer."),
    ],
    addOrUpdateCartItem
  );

router.route("/:productId").delete(removeItemFromCart);

module.exports = router;
