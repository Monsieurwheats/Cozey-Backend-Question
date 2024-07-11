const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../app");
const connectDB = require("../db");
const Order = require("../models/Order");
const LineItem = require("../models/LineItem");
const Product = require("../models/Product");
const LineItemProduct = require("../models/LineItemProduct");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await connectDB(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Order.deleteMany({});
  await LineItem.deleteMany({});
  await Product.deleteMany({});
  await LineItemProduct.deleteMany({});
});

describe("Warehouse Routes", () => {
  describe("GET /api/warehouse/picking-list", () => {
    it("should return the correct picking list", async () => {
      // Create test data
      const product1 = await Product.create({ name: "Product 1", price: 10 });
      const product2 = await Product.create({ name: "Product 2", price: 20 });

      const lineItem1 = await LineItem.create({
        name: "Line Item 1",
        price: 30,
        products: [product1._id, product2._id],
      });
      const lineItem2 = await LineItem.create({
        name: "Line Item 2",
        price: 20,
        products: [product1._id],
      });

      await LineItemProduct.create({
        lineItemId: lineItem1._id,
        product: product1._id,
        quantity: 2,
      });
      await LineItemProduct.create({
        lineItemId: lineItem1._id,
        product: product2._id,
        quantity: 1,
      });
      await LineItemProduct.create({
        lineItemId: lineItem2._id,
        product: product1._id,
        quantity: 1,
      });

      await Order.create({
        orderId: "ORD001",
        orderTotal: 50,
        orderDate: "2024-06-09T00:00:00.000Z",
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        lineItems: [lineItem1._id, lineItem2._id],
      });

      const response = await request(app).get("/api/warehouse/picking-list");
      console.log("API Response:", response.body);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Product 1", quantity: 3 }),
          expect.objectContaining({ name: "Product 2", quantity: 1 }),
        ])
      );
    });
  });

  describe("GET /api/warehouse/packing-list/:orderId", () => {
    it('should return the correct packing list for a given order', async () => {
      // Create products
      const product1 = await Product.create({ name: 'Birthday cupcake', price: 9.99 });
      const product2 = await Product.create({ name: '$100 Visa Gift Card', price: 100 });
      console.log('Created products:', product1, product2);
    
      // Create line items
      const lineItem1 = await LineItem.create({ 
        name: 'Birthday Box', 
        price: 114.98,
        lineItemProducts: []  // Initialize as empty array
      });
      console.log('Created lineItem:', lineItem1);
    
      // Create LineItemProducts
      const lip1 = await LineItemProduct.create({ 
        lineItemId: lineItem1._id, 
        product: product1._id, 
        quantity: 1 
      });
      const lip2 = await LineItemProduct.create({ 
        lineItemId: lineItem1._id, 
        product: product2._id, 
        quantity: 1 
      });
      console.log('Created LineItemProducts:', lip1, lip2);
    
      // Update line item with LineItemProducts
      await LineItem.findByIdAndUpdate(
        lineItem1._id, 
        { $push: { lineItemProducts: { $each: [lip1._id, lip2._id] } } },
        { new: true }
      );

      console.log('updated LineItem:',lineItem1)

      const orderDate = new Date('2024-07-09T00:00:00.000Z');
      const order = await Order.create({
        orderId: 'ORD001',
        orderTotal: 114.98,
        orderDate: orderDate,
        customerName: 'John Smith',
        customerEmail: 'john@example.com',
        shippingAddress: {
          street: '100 dundas Street east',
          city: 'Anytown',
          state: 'ON',
          zipCode: '12345',
          country: 'Canada'
        },
        lineItems: [lineItem1._id]
      });
      console.log('Created order:', order);
    
      const response = await request(app).get(`/api/warehouse/packing-list/${order.orderId}`);
      
      console.log('API Response:', response.body);
    
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        orderId: "ORD001",
        orderDate: "July 8, 2024",
        lineItems: [
          {
            name: 'Birthday Box',
            products: [
              'Birthday cupcake x1',
              '$100 Visa Gift Card x1'
            ]
          }
        ],
        shipsTo: [
          'John Smith',
          '100 dundas Street east, Anytown, ON 12345'
        ]
      });
    });

    it("should return 404 for non-existent order", async () => {
      const response = await request(app).get(
        "/api/warehouse/packing-list/NONEXISTENT"
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Order not found" });
    });
  });
});
