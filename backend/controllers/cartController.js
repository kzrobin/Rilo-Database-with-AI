const mongoose = require("mongoose");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const getMyCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user_id: userId }).populate({
      path: "items.product_id",
      select: "product_name price stock_quantity",
    });

    if (!cart) {
      return res.status(200).json({
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
  console.log("REQUEST BODY IN ADD/UPDATE CART ITEM:", req.user._id);
  const { product_id, quantity } = req.body;
  const userId = req.user._id;
  if (!product_id || !quantity || quantity < 1) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide a product and quantity.",
    });
  }

  try {
    const product = await Product.findById(product_id);
    if (!product || product.stock_quantity < quantity) {
      return res.status(400).json({
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

// Make sure to import mongoose at the top of your controller file

const removeItemFromCart = async (req, res) => {
  // Use ._id for consistency and reliability
  const userId = req.user._id;
  const { productId } = req.params;

  // 1. Validate that the productId from the URL is a valid ObjectId format
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res
      .status(400)
      .json({ status: "fail", message: "Invalid Product ID format." });
  }

  try {
    // 2. Find the user's cart first.
    const cart = await Cart.findOne({ user_id: userId });

    // If no cart is found for the user, we can stop here.
    if (!cart) {
      return res
        .status(404)
        .json({ status: "fail", message: "Cart not found for this user." });
    }

    // 3. Check if the product actually exists in the cart before trying to remove it.
    const itemIndex = cart.items.findIndex(
      (item) => item.product_id.toString() === productId
    );

    // If findIndex returns -1, the item is not in the cart.
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ status: "fail", message: "Item not found in cart." });
    }

    // 4. If the item is found, remove it from the items array.
    cart.items.splice(itemIndex, 1);

    // 5. Save the updated cart document.
    const updatedCart = await cart.save();

    // 6. Populate the product details for the remaining items before sending the response.
    await updatedCart.populate({
      path: "items.product_id",
      select: "product_name price",
    });

    res.status(200).json({
      status: "success",
      message: "Item removed successfully.",
      data: { cart: updatedCart },
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
