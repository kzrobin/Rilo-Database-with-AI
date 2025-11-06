const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const getMyCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user_id: userId }).populate({
      path: "items.product_id",
      select: "product_name price stock_quantity",
    });

    if (!cart) {
      return res
        .status(200)
        .json({
          status: "success",
          data: { cart: { user_id: userId, items: [] } },
        });
    }

    res.status(200).json({ status: "success", data: { cart } });
  } catch (error) {
    console.error("GET CART ERROR:", error);
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};

const addOrUpdateCartItem = async (req, res) => {
  const { product_id, quantity } = req.body;
  const userId = req.user.id;

  if (!product_id || !quantity || quantity < 1) {
    return res
      .status(400)
      .json({
        status: "fail",
        message: "Please provide a product and quantity.",
      });
  }

  try {
    const product = await Product.findById(product_id);
    if (!product || product.stock_quantity < quantity) {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "Product not found or not enough stock.",
        });
    }

    let cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      cart = await Cart.create({
        user_id: userId,
        items: [{ product_id, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (p) => p.product_id.toString() === product_id
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        cart.items.push({ product_id, quantity });
      }
      await cart.save();
    }

    await cart.populate({
      path: "items.product_id",
      select: "product_name price",
    });

    res
      .status(200)
      .json({ status: "success", message: "Cart updated.", data: { cart } });
  } catch (error) {
    console.error("ADD/UPDATE CART ITEM ERROR:", error);
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};

const removeItemFromCart = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    const cart = await Cart.findOneAndUpdate(
      { user_id: userId },
      { $pull: { items: { product_id: productId } } },
      { new: true }
    ).populate({ path: "items.product_id", select: "product_name price" });

    if (!cart) {
      return res
        .status(404)
        .json({ status: "fail", message: "Cart not found." });
    }

    res
      .status(200)
      .json({ status: "success", message: "Item removed.", data: { cart } });
  } catch (error) {
    console.error("REMOVE CART ITEM ERROR:", error);
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};

module.exports = {
  getMyCart,
  addOrUpdateCartItem,
  removeItemFromCart,
};
