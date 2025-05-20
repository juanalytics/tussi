"use client"

import type React from "react"

import Link from "next/link"
import { ShoppingCart, Menu, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "./cart-provider"
import { useState, useRef, useEffect } from "react"
import ThreeExplosion from "./three-explosion"
import { useRouter } from "next/navigation"

export default function Header() {
  const { cart } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isExploding, setIsExploding] = useState(false)
  const [explosionOrigin, setExplosionOrigin] = useState({ x: 0, y: 0 })
  const logoRef = useRef<HTMLAnchorElement>(null)
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)

    // Optional: Listen to storage changes to update auth state across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token") {
        setIsAuthenticated(!!event.newValue)
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  const handleLogoClick = (e: React.MouseEvent) => {
    // Only trigger animation if we're not already on the home page
    if (window.location.pathname !== "/") {
      e.preventDefault()

      // Get the click position for the explosion origin
      const rect = logoRef.current?.getBoundingClientRect()
      if (rect) {
        setExplosionOrigin({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        })
      } else {
        setExplosionOrigin({
          x: e.clientX,
          y: e.clientY,
        })
      }

      // Trigger explosion
      setIsExploding(true)
    }
  }

  const handleAnimationComplete = () => {
    // Navigate to home page after animation
    router.push("/")

    // Reset explosion state after a short delay
    setTimeout(() => {
      setIsExploding(false)
    }, 100)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    // Potentially clear cart for the logged-out user from UI perspective or refetch as guest.
    // For now, just redirecting.
    router.push("/login")
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center" onClick={handleLogoClick} ref={logoRef}>
            <span className="text-2xl font-bold text-pink-500 transition-transform hover:scale-105">TUSSI</span>
          </Link>

          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/" className="text-sm font-medium hover:text-pink-500 transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium hover:text-pink-500 transition-colors">
              Products
            </Link>
            {isAuthenticated ? (
              <Button variant="ghost" onClick={handleLogout} className="text-sm font-medium hover:text-pink-500 transition-colors">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium hover:text-pink-500 transition-colors">
                  Login
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="sm" className="border-pink-500 text-pink-500 hover:bg-pink-50">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
          </nav>

          <div className="md:hidden flex items-center">
            {isAuthenticated ? (
              <Button variant="ghost" size="icon" onClick={handleLogout} className="mr-2">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            ) : (
              <Link href="/login" className="mr-2">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Login</span>
                </Button>
              </Link>
            )}
            <Link href="/cart" className="relative mr-2">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t p-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-sm font-medium hover:text-pink-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-sm font-medium hover:text-pink-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              {isAuthenticated ? (
                 <Button
                    variant="ghost"
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="text-sm font-medium hover:text-pink-500 transition-colors w-full justify-start p-0"
                  >
                   <LogOut className="mr-2 h-4 w-4" /> Logout
                 </Button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium hover:text-pink-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium hover:text-pink-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <ThreeExplosion
        isActive={isExploding}
        onAnimationComplete={handleAnimationComplete}
        originX={explosionOrigin.x}
        originY={explosionOrigin.y}
      />
    </>
  )
}
