import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadProducts(store) {
  const filePath = path.join(__dirname, "data", "products.json");
  store.products = JSON.parse(fs.readFileSync(filePath), "utf-8");
}

export function calculateCartTotal(cart) {
  return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
}