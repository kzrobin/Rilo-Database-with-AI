const Order = require("../../models/orderModel");
const CartModel = require("../../models/cartModel");
const ProductModel = require("../../models/productModel");

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.body;

    if (!addressId) {
      return res.status(400).json({ message: "Address ID is required." });
    }

    const cart = await CartModel.findOne({ userId }).populate(
      "items.productId"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    let orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.productId;

      if (product.totalStock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for product: ${product.title}`,
        });
      }
      const price =
        product.salePrice && product.salePrice > 0
          ? product.salePrice
          : product.price;

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtPurchase: price,
      });

      totalAmount += price * item.quantity;
    }

    // STEP 3: Create order
    const newOrder = await Order.create({
      userId,
      orderItems,
      totalAmount,
      addressId,
    });

    // STEP 4: Reduce product stock
    for (const item of cart.items) {
      await ProductModel.findByIdAndUpdate(item.productId._id, {
        $inc: { totalStock: -item.quantity },
      });
    }

    // STEP 5: Empty the cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      message: "Order placed successfully.",
      order: newOrder,
    });
  } catch (err) {
    console.error("Error placing order:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId })
      .populate("orderItems.productId")
      .populate("addressId")
      .sort({ orderDate: -1 });
    return res.status(200).json({ orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    // Find the order and populate products and address
    const order = await Order.findOne({ _id: orderId, userId })
      .populate("orderItems.productId")
      .populate("addressId");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.status(200).json({ order });
  } catch (err) {
    console.error("Error fetching order:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
