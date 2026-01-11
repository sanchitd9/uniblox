import { useState } from "react";
import Header from "./components/Header";
import ItemsGrid from "./components/ItemsGrid";

export default function App() {
  const [cartKey, setCartKey] = useState(0);

  const handleCheckoutComplete = () => {
    setCartKey(cartKey + 1);
  };

  return (
    <>
      <Header onCheckoutComplete={handleCheckoutComplete} />
      <ItemsGrid key={cartKey} />
    </>
  );
}
