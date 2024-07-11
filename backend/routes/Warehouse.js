const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const LineItem = require("../models/LineItem");
const LineItemProduct = require("../models/LineItemProduct");
const Product = require("../models/Product");

// GET picking list
router.get("/picking-list", async (req, res) => {
  try {
    const orders = await Order.find({
      orderDate: { $lte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }).populate({
      path: "lineItems",
      populate: {
        path: "lineItemProducts",
        model: "LineItemProduct",
      },
    });
    let pickingList = {};

    for (const order of orders) {
      for (const lineItem of order.lineItems) {
        const lineItemProducts = await LineItemProduct.find({
          lineItemId: lineItem._id,
        });
        for (const lip of lineItemProducts) {
          const product = await Product.findById(lip.product);
          if (pickingList[product.name]) {
            pickingList[product.name] += lip.quantity;
          } else {
            pickingList[product.name] = lip.quantity;
          }
        }
      }
    }

    const formattedPickingList = Object.entries(pickingList).map(
      ([name, quantity]) => ({
        name,
        quantity,
      })
    );

    res.json(formattedPickingList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET packing list for a specific order
router.get("/packing-list/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).populate(
      {
        path: "lineItems",
        populate: {
          path: "lineItemProducts",
          populate: {
            path: "product",
          },
        },
      }
    );

    if (!order) {
      console.log("Order not found");
      return res.status(404).json({ message: "Order not found" });
    } else {
      console.log("Found order:", order);
    }

    const formattedDate = order.orderDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let packingList = {
      orderId: order.orderId,
      orderDate: formattedDate,
      lineItems: order.lineItems.map((lineItem) => {
        console.log("Processing lineItem:", lineItem);
        return {
          name: lineItem.name,
          products: (lineItem.lineItemProducts || []).map((lip) => {
            console.log("Processing lineItemProduct:", lip);
            return `${lip.product.name} x${lip.quantity}`;
          }),
        };
      }),
      shipsTo: [
        order.customerName,
        `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`,
      ],
    };

    console.log("Generated packingList:", JSON.stringify(packingList, null, 2));
    res.json(packingList);
  } catch (err) {
    console.error("Error in packing-list route:", err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

router.get("/packing-list", async (req, res) => {
  try {
    const orders = await Order.find({
      orderDate: { $lte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }).populate({
      path: "lineItems",
      populate: {
        path: "lineItemProducts",
        populate: {
          path: "product",
        },
      },
    });

    if (!orders) {
      console.log("Orders not found");
      return res.status(404).json({ message: "Order not found" });
    } else {
      console.log("Found order:", orders);
    }

    let formattedPackingList = [];
    for (const order of orders) {

      const formattedDate = order.orderDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      let packingList = {
        orderId: order.orderId,
        orderDate: formattedDate,
        customerName: order.customerName,
        shippingAddress: order.shippingAddress,
        lineItems: order.lineItems.map((lineItem) => {
          console.log("Processing lineItem:", lineItem);
          return {
            name: lineItem.name,
            products: (lineItem.lineItemProducts || []).map((lip) => {
              console.log("Processing lineItemProduct:", lip);
              return `${lip.product.name} x${lip.quantity}`;
            }),
          };
        }),
        shipsTo: [
          order.customerName,
          `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`,
        ],
      };
      formattedPackingList.push(packingList)
    }

    console.log("Generated packingList:", JSON.stringify(formattedPackingList, null, 2));
    res.json(formattedPackingList);
  } catch (err) {
    console.error("Error in packing-list-all route:", err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }

});

module.exports = router;
