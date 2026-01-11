import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

const app = express();
const PORT = 3000;

function loadProducts() {
  const products = JSON.parse(fs.readFileSync("data/products.json"));

  return products;
}

// Middleware
app.use(bodyParser.json());

// Storing order + cart data in memory
const store = {
  cart: { items: [] },
  orders: [],
  orderCount: 0
};

// Sanity check
app.get("/", (req, res) => {
  return res.json({
    "message": "Cart"
  });
});

// Get all products
app.get("/api/products", (req, res) => {
  const products = loadProducts();
  return res.json(products);
});

// View Cart
app.get("/api/cart", (req, res) => {
  return res.json(store.cart);
})

// Add item to cart
app.post("/api/cart/add", (req, res) => {
  const { productId, quantity } = req.body;

  const products = loadProducts();
  const product = products.filter(p => p.id === productId);

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



app.listen(PORT);