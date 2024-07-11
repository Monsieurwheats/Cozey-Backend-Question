const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const ordersRoutes = require('./routes/Orders');
const lineItemsRoutes = require('./routes/lineItems');
const productsRoutes = require('./routes/Products');
const warehouseRoutes = require('./routes/Warehouse');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/orders', ordersRoutes);
app.use('/api/line-items', lineItemsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/warehouse', warehouseRoutes);

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
module.exports = app;