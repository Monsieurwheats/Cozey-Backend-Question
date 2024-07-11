
// backend/src/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  orderTotal: {    
    type: Number, 
    required: true,
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(v.toFixed(2))
  },
  orderDate: { type: Date, required: true },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  lineItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LineItem' }]
});

OrderSchema.pre('save', async function(next) {
  if (this.isModified('lineItems') || this.isNew) {
    const populatedOrder = await this.populate('lineItems');
    const calculatedTotal = populatedOrder.lineItems.reduce((sum, item) => sum + item.price, 0);
    if (Math.abs(this.orderTotal - calculatedTotal) > 0.01) { // Allow for small floating point discrepancies
      throw new Error('Order total does not match sum of line items');
    }
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);




