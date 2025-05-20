"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "./cart-provider"
import type { Product } from "@/lib/types"
import { ShoppingCart } from "lucide-react"
import { useState } from "react"

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    addToCart(product)

    // Show animation for 1 second
    setTimeout(() => {
      setIsAdding(false)
    }, 1000)
  }

  return (
    <Button
      className={`bg-pink-500 hover:bg-pink-600 transition-all ${isAdding ? "scale-105" : ""}`}
      onClick={handleAddToCart}
      disabled={isAdding}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isAdding ? "Added!" : "Add to Cart"}
    </Button>
  )
}
