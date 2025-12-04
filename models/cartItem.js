const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
  productId: {
    type: Number, // Using Number to match Fake Store API's product ID
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

// We are not creating a 'Cart' model, but rather a collection of 'CartItem'
// This simple model assumes a single-user cart for this assignment.
module.exports = mongoose.model('CartItem', CartItemSchema);