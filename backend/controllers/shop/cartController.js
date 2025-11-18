const mongoose = require("mongoose");
const CartModel = require("../../models/cartModel");
const ProductModel = require("../../models/productModel");
const { validationResult } = require("express-validator");

// Helper function to flatten cart items
const formatCart = (cart) => {
  if (!cart || !cart.items.length) return [];

  return cart.items
    .filter((item) => item.productId) // skip deleted products
    .map((item) => ({
      productId: item.productId._id,
      title: item.productId.title, // ✅ use title
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
      totalStock: item.productId.totalStock,
      image: item.productId.image,
    }));
};

// GET cart
const getMyCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await CartModel.findOne({ userId }).populate({
      path: "items.productId",
      select: "title price salePrice totalStock image",
    });

    res.status(200).json({
      status: "success",
      data: { cart: formatCart(cart) },
    });
  } catch (error) {
    console.error("GET CART ERROR:", error);
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};

// ADD/UPDATE cart item
const addOrUpdateCartItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Invalid data", errors: errors.array() });
    }

    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const product = await ProductModel.findById(productId);
    if (!product || product.stock_quantity < quantity) {
      return res.status(400).json({
        status: "fail",
        message: "Product not found or not enough stock.",
      });
    }

    let cart = await CartModel.findOne({ userId });

    if (!cart) {
      cart = await CartModel.create({
        userId,
        items: [{ productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity; // replace quantity
      } else {
        cart.items.push({ productId, quantity });
      }
      await cart.save();
    }

    await cart.populate({
      path: "items.productId",
      select: "title price salePrice totalStock image",
    });

    res.status(200).json({
      status: "success",
      message: "Cart updated.",
      data: { cart: formatCart(cart) },
    });
  } catch (error) {
    console.error("ADD/UPDATE CART ITEM ERROR:", error);
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};

// REMOVE item from cart
const removeItemFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid Product ID." });
    }

    const cart = await CartModel.findOne({ userId });

    if (!cart || !cart.items.length) {
      return res
        .status(404)
        .json({ status: "fail", message: "Cart is empty." });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ status: "fail", message: "Item not found in cart." });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "title price salePrice totalStock image",
    });

    res.status(200).json({
      status: "success",
      message: "Item removed successfully.",
      data: { cart: formatCart(cart) },
    });
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

module.exports = {
  getMyCart,
  addOrUpdateCartItem,
  removeItemFromCart,
};
