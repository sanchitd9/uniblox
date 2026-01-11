import express from "express";
import bodyParser from "body-parser";
import { loadProducts, calculateCartTotal, generateDiscountCode, DISCOUNT_RATE, N } from "./util.js";

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Storing order + cart data in memory
const store = {
  products: [],
  cart: { items: [] },
  orders: [],
  orderCount: 0,
  discountCodes: [],
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
  const subtotal = calculateCartTotal(store.cart);
  const isDiscountEligible = (store.orderCount + 1) % N === 0;

  const response = {
    items: store.cart.items,
    subtotal,
    discountEligible: isDiscountEligible,
  };

  return res.json(response);
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
  const subtotal = calculateCartTotal(store.cart);
  let discount = 0;

  if (discountCode) {
    discount = subtotal * DISCOUNT_RATE;
  }

  const totalAmount = subtotal - discount;

  // Create the order
  const order = {
    orderId: `ORDER${store.orderCount}`,
    items: [...store.cart.items],
    subtotal,
    discount,
    discountCode,
    totalAmount
  };

  store.orderCount++;

  // Add it to the store
  store.orders.push(order);

  // Clear the cart
  store.cart.items = [];

  return res.json({
    message: "Order placed successfully",
    order
  });
});

// Admin API routes
app.get("/api/admin/generateCode", (req, res) => {
  const code = generateDiscountCode();
  store.discountCodes.push(code);

  return res.json(code);
});

app.get("/api/admin/stats", (req, res) => {
  const totalCount = store.orders.reduce((total, order) => total + order.items.reduce((subTotal, item) => subTotal + item.quantity, 0), 0);
  const totalAmount = store.orders.reduce((total, order) => total + order.totalAmount, 0);
  const totalDiscount = store.orders.reduce((total, order) => total + order.discount, 0);

  return res.json({
    totalCount,
    totalAmount,
    discountCodes: store.discountCodes,
    totalDiscount
  });
});

app.listen(PORT);