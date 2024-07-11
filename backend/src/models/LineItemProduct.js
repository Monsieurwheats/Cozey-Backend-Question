
// backend/src/models/LineItemProduct.js
const mongoose = require('mongoose');

const LineItemProductSchema = new mongoose.Schema({
  lineItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LineItem', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true }
});

module.exports = mongoose.model('LineItemProduct', LineItemProductSchema);