import { useEffect, useState } from "react";
import Item from "./Item";

export default function ItemsGrid() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("http://localhost:3000/api/products");
      const data = await response.json();

      setItems(data);
    }
    
    fetchProducts();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {items.map((item) => (
        <Item
          key={item.id}
          image="https://picsum.photos/id/9/367/267"
          description={item.description}
          price={item.price}
        />
      ))}
    </div>
  );
}
