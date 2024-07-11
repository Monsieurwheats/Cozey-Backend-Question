const mongoose = require('mongoose');
const Order = require('../models/Order');
const LineItem = require('../models/LineItem');
const Product = require('../models/Product');
const LineItemProduct = require('../models/LineItemProduct');
const orders = require('./orders.json');
require('dotenv').config();

console.log('Starting database seeding process...');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function seedDatabase() {
  try {
    console.log('Clearing existing data...');
    await Order.deleteMany({});
    await LineItem.deleteMany({});
    await Product.deleteMany({});
    await LineItemProduct.deleteMany({});
    console.log('Existing data cleared successfully');

    for (const [orderIndex, orderData] of orders.entries()) {
      console.log(`Processing order ${orderIndex + 1} of ${orders.length}`);
      const lineItemIds = [];
      let orderTotal = 0;

      for (const [lineItemIndex, lineItemData] of orderData.lineItems.entries()) {
        console.log(`Processing line item ${lineItemIndex + 1} of ${orderData.lineItems.length}`);
        let lineItemTotal = 0;
        const lineItemProductIds = [];

        const lineItem = new LineItem({
          name: lineItemData.name,
          price: 0,  // We'll update this after processing all products
        });
        await lineItem.save();

        for (const [lipIndex, lipData] of lineItemData.lineItemProducts.entries()) {
          console.log(`Processing LineItemProduct ${lipIndex + 1} of ${lineItemData.lineItemProducts.length}`);
          
          let product = await Product.findOne({ name: lipData.product.name });
          if (!product) {
            console.log(`Creating new product: ${lipData.product.name}`);
            product = new Product({
              name: lipData.product.name,
              price: lipData.product.price
            });
            await product.save();
          } else {
            console.log(`Found existing product: ${lipData.product.name}`);
          }

          const lineItemProduct = new LineItemProduct({
            lineItemId: lineItem._id,
            product: product._id,
            quantity: lipData.quantity
          });
          await lineItemProduct.save();

          lineItemProductIds.push(lineItemProduct._id);
          lineItemTotal += product.price * lipData.quantity;
        }

        // Update the LineItem with the correct price and LineItemProduct references
        lineItem.price = lineItemTotal;
        lineItem.lineItemProducts = lineItemProductIds;
        await lineItem.save();

        lineItemIds.push(lineItem._id);
        orderTotal += lineItemTotal;
      }

      console.log(`Creating order: ${orderData.orderId}`);
      const order = new Order({
        orderId: orderData.orderId,
        orderDate: orderData.orderDate,
        shippingAddress: orderData.shippingAddress,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        orderTotal: orderTotal,
        lineItems: lineItemIds,
      });
      await order.save();
      console.log(`Order ${orderData.orderId} created successfully`);
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    console.log('Closing MongoDB connection...');
    mongoose.connection.close().then(() => console.log('MongoDB connection closed'));
  }
}

seedDatabase();

module.exports = seedDatabase;