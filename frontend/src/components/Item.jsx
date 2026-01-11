export default function Item({ image, description, price }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={image}
        alt={description}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <p className="text-gray-700 mb-2">{description}</p>
        <p className="text-lg font-semibold text-gray-900">${price.toFixed(2)}</p>
      </div>
    </div>
  );
}
