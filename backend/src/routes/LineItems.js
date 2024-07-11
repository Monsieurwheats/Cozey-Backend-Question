

// backend/src/routes/lineItems.js
const express = require('express');
const router = express.Router();
const LineItem = require('../models/LineItem');

// GET all line items
router.get('/', async (req, res) => {
  try {
    const lineItems = await LineItem.find().populate('products');
    res.json(lineItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new line item
router.post('/', async (req, res) => {
  const lineItem = new LineItem(req.body);
  try {
    const newLineItem = await lineItem.save();
    res.status(201).json(newLineItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Additional routes for getting, updating, and deleting line items can be added here

module.exports = router;


