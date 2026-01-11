import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Every 3rd order gets a discount of 10%
export const N = 3;
export const DISCOUNT_RATE = 0.1;

export function loadProducts(store) {
  const filePath = path.join(__dirname, "..", "data", "products.json");
  store.products = JSON.parse(fs.readFileSync(filePath), "utf-8");
}

export function calculateCartTotal(cart) {
  return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function generateDiscountCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code.slice(0, 4) + "-" + code.slice(4);
}

export function generateStats(orders) {
  return orders.reduce((acc, order) => {
    acc.totalCount += order.items.reduce((sum, item) => sum + item.quantity, 0);
    acc.totalAmount += order.totalAmount;
    acc.totalDiscount += order.discount;
    return acc;
  }, { totalCount: 0, totalAmount: 0, totalDiscount: 0 });
}