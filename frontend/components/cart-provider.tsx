"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "@/lib/types"

export interface CartItem extends Product {
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)

      if (existingItem) {
        // Increment quantity if item already exists
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        // Add new item with quantity 1
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId)

      if (existingItem && existingItem.quantity > 1) {
        // Decrement quantity if more than 1
        return prevCart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
      } else {
        // Remove item completely if quantity is 1
        return prevCart.filter((item) => item.id !== productId)
      }
    })
  }

  const clearCart = () => {
    setCart([])
  }

  return <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
