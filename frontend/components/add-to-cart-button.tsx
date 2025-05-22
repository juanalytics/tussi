// components/add-to-cart-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/components/cart-provider";

// Re-definiendo ProductForCart para mostrar explícitamente lo que se necesita.
// Esto debe alinearse con tu interfaz 'Product' de types.ts
interface ProductForCart {
  id: string; // El ID de tus datos simulados (que es el productId para el backend)
  name: string;
  price: number;
  //image?: string;
  description?: string;
}

export default function AddToCartButton({ product }: { product: ProductForCart }) {
  const { addToCart, isLoading, error } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    setAddedMessage(false);

    try {
      // Pasa el product.id como productId a la función addToCart,
      // porque el 'id' de tu producto simulado es lo que tu 'productId' del carrito espera.
      await addToCart({
        id: product.id,        // 'id' para el frontend/datos simulados
        productId: product.id, // 'productId' para el backend del carrito (¡ESTE ES EL CAMBIO CLAVE!)
        name: product.name,
        price: product.price,
       // image: product.image,
        description: product.description,
      });
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 2000);
    } catch (err) {
      console.error("Error al añadir al carrito:", err);
      // Aquí puedes manejar el error, por ejemplo, mostrando un mensaje
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      className="w-full bg-pink-500 hover:bg-pink-600"
      disabled={isLoading || isAdding}
    >
      {isAdding ? (
        "Añadiendo..."
      ) : addedMessage ? (
        <>
          <Check className="mr-2 h-4 w-4" /> ¡Añadido!
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" /> Añadir al Carrito
        </>
      )}
    </Button>
  );
}