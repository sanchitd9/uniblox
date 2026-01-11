export default function Item({ image, description, price, name }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={image}
        alt={description}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <p className="text-lg font-medium text-gray-900">{name}</p>
        <p className="text-sm text-gray-500 mb-2">{description}</p>
        <p className="text-lg font-semibold text-gray-900">${price.toFixed(2)}</p>
      </div>
    </div>
  );
}
