// backend/src/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { 
    type: Number, 
    required: true,
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(v.toFixed(2))
  },
});

module.exports = mongoose.model('Product', ProductSchema);