import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-contain p-4 transition-transform hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
        <p className="font-bold text-pink-500 mt-2">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/products/${product.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Product
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
