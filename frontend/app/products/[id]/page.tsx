import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Suspense } from "react"
import AddToCartButton from "@/components/add-to-cart-button"
import { getProduct } from "@/lib/products"
import { Skeleton } from "@/components/ui/skeleton"

// Create a ProductDetail component to handle the async data fetching
async function ProductDetail({ id }: { id: string }) {
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-contain p-6"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-2xl font-bold text-pink-500 my-4">${product.price.toFixed(2)}</p>
        <div className="prose max-w-none mb-6">
          <p>{product.description}</p>
        </div>
        <AddToCartButton product={product} />
      </div>
    </div>
  )
}

// Create a loading skeleton for the product detail
function ProductDetailSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="flex flex-col space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-1/3" />
      </div>
    </div>
  )
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="container px-4 py-8 mx-auto">
      <Link href="/products" className="flex items-center text-pink-500 hover:text-pink-600 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to products
      </Link>

      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetail id={params.id} />
      </Suspense>
    </div>
  )
}
