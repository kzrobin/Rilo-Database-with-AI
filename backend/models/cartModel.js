const mongoose = require('mongoose');
const { Schema } = mongoose;

// This defines the schema for a single item within the cart's items array
const cartItemSchema = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1.'],
    default: 1,
  },
}, { _id: false }); // _id: false prevents MongoDB from creating a separate _id for sub-documents

const cartSchema = new Schema({
  // Foreign Key reference to the User collection
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Ensures each user has only one cart
  },
  // An array of items, using the schema defined above
  items: [cartItemSchema],
}, { timestamps: { updatedAt: 'updated_at', createdAt: 'created_at' } }); // Maps timestamps to your naming convention

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;