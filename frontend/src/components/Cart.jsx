import { useEffect, useState } from "react";

export default function Cart({ isOpen, onClose }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0, discountEligible: false });

  useEffect(() => {
    if (isOpen) {
      const fetchCart = async () => {
        const response = await fetch("http://localhost:3000/api/cart");
        const data = await response.json();
        setCart(data);
      };
      fetchCart();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="text-xl font-semibold">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
          >
            &times;
          </button>
        </div>
        <div className="px-4 pb-4 max-h-96 overflow-y-auto">
          {cart.items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            <ul className="space-y-3">
              {cart.items.map((item) => (
                <li key={item.productId} className="flex justify-between items-center bg-gray-200 rounded-lg p-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 pt-2 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Subtotal</span>
            <span className="font-semibold">${cart.subtotal.toFixed(2)}</span>
          </div>
          {cart.discountEligible && (
            <p className="text-green-600 text-sm mb-2">You're eligible for a discount!</p>
          )}
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
