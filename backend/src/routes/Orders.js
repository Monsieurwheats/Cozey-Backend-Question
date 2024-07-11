// backend/src/routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
    .populate({
      path: 'lineItems',
      populate: {
        path: 'lineItemProducts',
          populate: {
          path: 'product',
        }
      }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('lineItems');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new order
router.post('/', async (req, res) => {
  const order = new Order(req.body);
  try {
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Additional routes for updating and deleting orders can be added here

module.exports = router;