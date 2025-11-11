const express = require("express");
const {
  getMyCart,
  addOrUpdateCartItem,
  removeItemFromCart,
} = require("../controllers/cartController");
const authMiddleware = require("../middleware/authUser");

const router = express.Router();

router.use(authMiddleware);

router.route("/").get(getMyCart);

router.route("/items").post(addOrUpdateCartItem);

router.route("/items/:productId").delete(removeItemFromCart);

module.exports = router;
