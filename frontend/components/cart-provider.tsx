"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

interface CartItem {
  id: string // Assuming product ID is string, adjust if it is number from product service
  productId: string // From cart service perspective
  name: string
  price: number
  quantity: number
  image?: string
  description?: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, "quantity" | "id" | "productId"> & { id: string; productId: string }) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateItemQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const USER_ID = "guestUser" // Placeholder User ID, replace with actual user ID from auth

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCart = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CART_API_URL}/cart/${USER_ID}`)
      if (!response.ok) {
        if (response.status === 404) { // Cart might not exist for a new user
          setCart([])
        } else {
          throw new Error(`Failed to fetch cart: ${response.status}`)
        }
      } else {
        const data = await response.json()
        setCart(data.items || []) // Assuming the cart API returns { items: [...] }
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message || "Failed to load cart.")
      setCart([]) // Clear cart on error
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (item: Omit<CartItem, "quantity" | "id" | "productId"> & { id: string; productId: string }) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CART_API_URL}/cart/${USER_ID}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId, quantity: 1, name: item.name, price: item.price, image: item.image, description: item.description }), // Send necessary details
      })
      if (!response.ok) throw new Error("Failed to add item to cart")
      await fetchCart() // Refresh cart from backend
    } catch (e: any) {
      console.error(e)
      setError(e.message || "Failed to add item.")
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (productId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CART_API_URL}/cart/${USER_ID}/items/${productId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to remove item from cart")
      await fetchCart() // Refresh cart
    } catch (e: any) {
      console.error(e)
      setError(e.message || "Failed to remove item.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateItemQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CART_API_URL}/cart/${USER_ID}/items/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })
      if (!response.ok) throw new Error("Failed to update item quantity")
      await fetchCart() // Refresh cart
    } catch (e: any) {
      console.error(e)
      setError(e.message || "Failed to update quantity.")
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CART_API_URL}/cart/${USER_ID}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to clear cart")
      setCart([]) // Optimistically clear cart, or fetchCart()
    } catch (e: any) {
      console.error(e)
      setError(e.message || "Failed to clear cart.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateItemQuantity, clearCart, isLoading, error }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
