const Order = require("../../models/orderModel");
const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");

const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Find the user's cart
    const cart = await Cart.findOne({ user_id: userId });

    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ status: "fail", message: "Your cart is empty." });
    }

    // 2. Prepare orderItems and calculate total amount
    const orderItems = [];
    let totalAmount = 0;

    // Use a for...of loop to handle async operations correctly
    for (const item of cart.items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res
          .status(404)
          .json({
            status: "fail",
            message: `Product with ID ${item.product_id} not found.`,
          });
      }

      // Check for sufficient stock
      if (product.stock_quantity < item.quantity) {
        return res
          .status(400)
          .json({
            status: "fail",
            message: `Not enough stock for ${product.product_name}.`,
          });
      }

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: product.price, // Store the price at the time of purchase
      });

      totalAmount += product.price * item.quantity;

      // 3. Decrease stock quantity
      product.stock_quantity -= item.quantity;
      await product.save();
    }

    // 4. Create the new order
    const newOrder = await Order.create({
      user_id: userId,
      orderItems: orderItems,
      total_amount: totalAmount,
    });

    // 5. Clear the user's cart after the order is created
    cart.items = [];
    await cart.save();

    res.status(201).json({
      status: "success",
      message: "Order created successfully.",
      data: { order: newOrder },
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res
      .status(500)
      .json({ status: "fail", message: "Server error while creating order." });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id })
      .populate({
        path: "orderItems.product_id",
        select: "product_name price",
      })
      .sort({ order_date: -1 });

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: { orders },
    });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);
    res.status(500).json({ status: "fail", message: "Server error." });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user_id", "fullname email")
      .populate("orderItems.product_id");

    if (!order) {
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found." });
    }

    if (
      order.user_id._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({
          status: "fail",
          message: "You are not authorized to view this order.",
        });
    }

    res.status(200).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    console.error("GET ORDER BY ID ERROR:", error);
    res.status(500).json({ status: "fail", message: "Server error." });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ status: "fail", message: "Status is required." });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found." });
    }

    res.status(200).json({
      status: "success",
      message: "Order status updated.",
      data: { order },
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    res.status(500).json({ status: "fail", message: "Server error." });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
