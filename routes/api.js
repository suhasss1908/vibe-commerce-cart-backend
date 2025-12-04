const express = require('express');
const axios = require('axios');
const CartItem = require('../models/cartItem');
const router = express.Router();

// --- Product API ---

/**
 * @route   GET /api/products
 * @desc    Get all products from Fake Store API (Bonus)
 */
router.get('/products', async (req, res) => {
  try {
    // We fetch 20 products from the fake API
    const response = await axios.get('https://fakestoreapi.com/products?limit=20');
    // We adapt the data slightly to match our needs if necessary
    const products = response.data.map(product => ({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.image,
      description: product.description
    }));
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error while fetching products');
  }
});

// --- Cart APIs ---

/**
 * @route   GET /api/cart
 * @desc    Get all cart items and total
 */
router.get('/cart', async (req, res) => {
  try {
    const cartItems = await CartItem.find();
    
    // Calculate total price
    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    res.json({
      items: cartItems,
      total: parseFloat(total.toFixed(2)),
    });
  } catch (err) {
    console.error(err.message); 
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/cart
 * @desc    Add an item to the cart or update its quantity
 */
router.post('/cart', async (req, res) => {
  const { productId, quantity, name, price, image } = req.body;

  // Basic validation
  if (!productId || !quantity || !name || !price) {
    return res.status(400).json({ msg: 'Please include all product details' });
  }

  try {
    // Check if item already exists in cart
    let item = await CartItem.findOne({ productId: productId });

    if (item) {
      // Update quantity
      item.quantity = item.quantity + quantity;
      await item.save();
      res.json(item);
    } else {
      // Create new cart item
      const newItem = new CartItem({
        productId: productId,
        title: name,
        price: price,
        image: image,
        quantity: quantity,
      });

      const savedItem = await newItem.save();
      res.status(201).json(savedItem);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   DELETE /api/cart/:id
 * @desc    Remove an item from the cart
 */
router.delete('/cart/:id', async (req, res) => {
  try {
    // Find the item by its ID and delete it in one step
    const item = await CartItem.findByIdAndDelete(req.params.id); 

    if (!item) {
      // If no item was found (and deleted), return 404
      return res.status(404).json({ msg: 'Item not found in cart' });
    }

    // Successfully deleted
    res.json({ msg: 'Item removed from cart' });

  } catch (err) {
    console.error(err.message);
     // If the ID is not a valid MongoDB ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Item not found in cart' });
    }
    res.status(500).send('Server Error');
  }
});


// --- Checkout API ---

/**
 * @route   POST /api/checkout
 * @desc    Mock checkout process
 */
router.post('/checkout', async (req, res) => {
  // In a real app, this is where you'd process payment with Stripe, etc.
  // For this mock, we'll receive the cart, calculate the total,
  // clear the cart, and return a receipt.

  try {
    const cartItems = await CartItem.find();
    
    if (cartItems.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty, cannot checkout.' });
    }

    // Calculate total
    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Create a mock receipt
    const receipt = {
      receiptId: `VIBE-${Date.now()}`,
      items: cartItems.map(item => ({
        name: item.title,
        qty: item.quantity,
        price: item.price,
      })),
      total: parseFloat(total.toFixed(2)),
      checkoutTimestamp: new Date().toISOString(),
    };

    // Clear the cart from the database
    await CartItem.deleteMany({});
    
    // Return the mock receipt
    res.status(200).json(receipt);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;