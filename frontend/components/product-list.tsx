"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"
import ProductListSkeleton from "./product-list-skeleton"
import { useCart } from "./cart-provider"

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url?: string
}

async function getProducts(page: number = 1, limit: number = 10): Promise<Product[]> {
  try {
    console.log(process.env.NEXT_PUBLIC_PRODUCTS_API_URL)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCTS_API_URL}/products`
    )
    console.log(response)
    if (!response.ok) {
      console.error("Failed to fetch products:", response.status, await response.text())
      return []
    }
    const products = await response.json()
    console.log(products)
    return products
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export default function ProductList({ page }: { page: number }) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const { addToCart, isLoading: isLoadingCart, error: cartError } = useCart()

  useEffect(() => {
    async function loadProducts() {
      setIsLoadingProducts(true)
      const fetchedProducts = await getProducts(page)
      setProducts(fetchedProducts)
      setIsLoadingProducts(false)
    }
    loadProducts()
  }, [page])

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id.toString(),
      productId: product.id.toString(),
      name: product.name,
      price: product.price,
      image: product.image_url,
      description: product.description,
    })
  }

  if (isLoadingProducts) {
    return <ProductListSkeleton />
  }

  if (products.length === 0) {
    return <p>No products found.</p>
  }

  return (
    <div>
      {cartError && <p className="text-red-500">Cart Error: {cartError}</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md">
            <Link href={`/products/${product.id}`}>
              <div className="relative h-60 w-full bg-gray-100">
                <Image
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </Link>
            <div className="p-4">
              <h3 className="text-lg font-semibold">
                <Link href={`/products/${product.id}`}>{product.name}</Link>
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xl font-bold text-pink-600">${product.price.toFixed(2)}</p>
                <Button 
                  size="sm" 
                  className="bg-pink-500 hover:bg-pink-600"
                  onClick={() => handleAddToCart(product)}
                  disabled={isLoadingCart}
                >
                  {isLoadingCart ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
