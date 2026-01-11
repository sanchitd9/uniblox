export default function Item({ item }) {
  const handleAddToCart = async () => {
    const response = await fetch("http://localhost:3000/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: item.id, quantity: 1 }),
    });
    const data = await response.json();
    console.log(data);
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
          <button
            onClick={handleAddToCart}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
