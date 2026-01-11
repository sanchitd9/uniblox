import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { loadProducts, calculateCartTotal, generateDiscountCode, DISCOUNT_RATE, N, generateStats } from "./util.js";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(bodyParser.json());

// Storing order + cart data in memory
const store = {
  products: [],
  cart: { items: [] },
  orders: [],
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
app.get("/api/products", (req, res, next) => {
  try {
    return res.json(store.products);
  } catch (error) {
    next(error);
  }
});

// View Cart
app.get("/api/cart", (req, res, next) => {
  try {
    const subtotal = calculateCartTotal(store.cart);
    const discountEligible = (store.orders.length + 1) % N === 0;

    const response = {
      items: store.cart.items,
      subtotal,
      discountEligible,
    };

    return res.json(response);
  } catch (error) {
    next(error);
  }
});

// Add item to cart
app.post("/api/cart/add", (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: "productId and quantity are required" });
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({ error: "quantity must be a positive number" });
    }

    const product = store.products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
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

    return res.status(200).json(store.cart);
  } catch (error) {
    next(error);
  }
});

// Remove item from cart
app.post("/api/cart/remove", (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    const existingItem = store.cart.items.find(item => item.productId === productId);

    if (!existingItem) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    const removeQuantity = quantity || existingItem.quantity;

    if (removeQuantity >= existingItem.quantity) {
      store.cart.items = store.cart.items.filter(item => item.productId !== productId);
    } else {
      existingItem.quantity -= removeQuantity;
    }

    return res.status(200).json(store.cart);
  } catch (error) {
    next(error);
  }
});

// Checkout
app.post("/api/checkout", (req, res, next) => {
  try {
    if (store.cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const { discountCode } = req.body;
    const subtotal = calculateCartTotal(store.cart);
    let discount = 0;

    if (discountCode) {
      const isNthOrder = (store.orders.length + 1) % N === 0;
      const expectedCodeIndex = Math.floor(store.orders.length / N);
      const isValidCode = store.discountCodes[expectedCodeIndex] === discountCode;

      if (!isNthOrder) {
        return res.status(400).json({ error: "Discount code not applicable for this order" });
      }

      if (!isValidCode) {
        return res.status(400).json({ error: "Invalid discount code" });
      }

      discount = subtotal * DISCOUNT_RATE;
    }

    const totalAmount = subtotal - discount;

    // Create the order
    const order = {
      orderId: `O${store.orders.length + 1}`,
      items: [...store.cart.items],
      subtotal,
      discount,
      discountCode,
      totalAmount
    };

    // Add it to the store
    store.orders.push(order);

    // Clear the cart
    store.cart.items = [];

    return res.status(201).json({
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    next(error);
  }
});

// Admin API routes
app.post("/api/admin/generateCode", (req, res, next) => {
  try {
    const isNthOrder = (store.orders.length + 1) % N === 0;

    if (!isNthOrder) {
      return res.status(400).json({ error: "Discount code cannot be generated for this order" });
    }

    const nthOrderIndex = Math.floor(store.orders.length / N);

    if (nthOrderIndex < store.discountCodes.length) {
      return res.status(200).json({ code: store.discountCodes[nthOrderIndex] });
    }

    const code = generateDiscountCode();
    store.discountCodes.push(code);

    return res.status(201).json({ code });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/stats", (req, res, next) => {
  try {
    const { totalCount, totalAmount, totalDiscount } = generateStats(store.orders);

    return res.status(200).json({
      totalCount,
      totalAmount,
      discountCodes: store.discountCodes,
      totalDiscount
    });
  } catch (error) {
    next(error);
  }
});

// 404 handler for unknown routes
app.use((req, res) => {
  return res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).json({ error: "Internal server error" });
});

export { app, store };