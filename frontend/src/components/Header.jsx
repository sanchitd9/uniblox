import { useState } from "react";
import Cart from "./Cart";

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Retail Store</h1>
        <button
          onClick={() => setIsCartOpen(true)}
          className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
        >
          Cart
        </button>
      </header>
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
