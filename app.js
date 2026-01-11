import express from "express";
import bodyParser from "body-parser";
import { loadProducts } from "./util.js";

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Storing order + cart data in memory
const store = {
  products: [],
  cart: { items: [] },
  orders: [],
  orderCount: 0
};

// Load products from json.
loadProducts(store);

// Sanity check
app.get("/", (req, res) => {
  return res.json({
    "message": "Cart"
  });
});

// Get all products
app.get("/api/products", (req, res) => {
  return res.json(store.products);
});

// View Cart
app.get("/api/cart", (req, res) => {
  return res.json(store.cart);
});

// Add item to cart
app.post("/api/cart/add", (req, res) => {
  const { productId, quantity } = req.body;

  const product = store.products.find(p => p.id === productId);

  if (!product) {
    return res.status(404);
  }

  const existingItem = store.cart.items.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    store.cart.items.push({
      productId,
      name: product.name,
      price: product.price,
      quantity
    });
  }

  return res.json(store.cart);
});

// Checkout
app.post("/api/checkout", (req, res) => {
  const { discountCode } = req.body;

  store.orderCount++;

  const totalAmount = calculateCartTotal();

  // Create the order
  const order = {
    orderId: `ORDER${store.orderCount}`,
    items: [...store.cart.items],
    totalAmount
  };

  // Add it to the store
  store.orders.push(order);

  // Clear the cart
  store.cart.items = [];

  return res.json({
    message: "Order placed successfully",
    order
  })
});

app.listen(PORT);