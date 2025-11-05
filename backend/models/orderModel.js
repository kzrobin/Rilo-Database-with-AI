const mongoose = require("mongoose");
const { Schema } = mongoose;

// This defines the schema for an item within the order
const orderItemSchema = new Schema(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    // It's crucial to store the price at the time of purchase
    price_at_purchase: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    // Foreign Key reference to the User
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Array of items in the order
    orderItems: [orderItemSchema],
    total_amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"], // Defines allowed values
      default: "Pending",
    },
  },
  { timestamps: { createdAt: "order_date", updatedAt: false } }
); // Maps createdAt to 'order_date' and disables updatedAt

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;