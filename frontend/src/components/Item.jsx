import { useState } from "react";

export default function Item({ item }) {
  const [quantity, setQuantity] = useState(0);

  const handleAdd = async () => {
    const response = await fetch("http://localhost:3000/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: item.id, quantity: 1 }),
    });
    const data = await response.json();
    console.log(data);
    setQuantity(quantity + 1);
  };

  const handleRemove = async () => {
    if (quantity <= 0) return;
    const response = await fetch("http://localhost:3000/api/cart/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: item.id, quantity: 1 }),
    });
    const data = await response.json();
    console.log(data);
    setQuantity(quantity - 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src="https://picsum.photos/id/9/367/267"
        alt={item.description}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <p className="text-lg font-medium text-gray-900">{item.name}</p>
        <p className="text-sm text-gray-500 mb-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-900">${item.price.toFixed(2)}</p>
          <div className="flex items-center gap-2">
            {quantity > 0 && (
              <>
                <button
                  onClick={handleRemove}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="text-lg font-medium w-6 text-center">{quantity}</span>
              </>
            )}
            <button
              onClick={handleAdd}
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
