const mongoose = require('mongoose');
const { Schema } = mongoose;
const orderItemSchema = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product', 
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1.'],
  },

  price_at_purchase: {
    type: Number,
    required: true,
  },
}, { _id: false });

const orderSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: [orderItemSchema],
  
  total_amount: {
    type: Number,
    required: [true, 'Total amount is required.'],
  },
  
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
}, { timestamps: { createdAt: 'order_date', updatedAt: false } });


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;