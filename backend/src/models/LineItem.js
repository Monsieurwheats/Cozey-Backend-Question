// backend/src/models/LineItem.js
const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { 
    type: Number, 
    required: true,
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(v.toFixed(2))
  },

  lineItemProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LineItemProduct' }]
});

module.exports = mongoose.model('LineItem', LineItemSchema);