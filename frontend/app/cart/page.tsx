"use client"

import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart()

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  if (cart.length === 0) {
    return (
      <div className="container px-4 py-8 mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <p className="mb-6">Your cart is empty.</p>
        <Link href="/products">
          <Button className="bg-pink-500 hover:bg-pink-600">Browse Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      <div className="grid gap-6">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg"
          >
            <div className="relative w-24 h-24 rounded overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="font-medium">
                  ${item.price.toFixed(2)} × {item.quantity}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Total:</span>
          <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="bg-pink-500 hover:bg-pink-600 flex-1">Checkout</Button>
          <Button variant="outline" onClick={clearCart} className="flex-1">
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
