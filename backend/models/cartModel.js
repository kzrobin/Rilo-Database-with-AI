const mongoose = require("mongoose");
const { Schema } = mongoose;

// This defines the schema for a single item within the cart's items array
const cartItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity cannot be less than 1."],
      default: 1,
    },
  },
  { _id: false }
);

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: { updatedAt: "updated_at", createdAt: "created_at" } }
);

const CartModel = mongoose.model("Cart", cartSchema);

module.exports = CartModel;
