import { getProducts } from "@/lib/products"
import ProductCard from "./product-card"

export default async function ProductList({ page = 1 }: { page?: number }) {
  // Fetch products on the server
  const products = await getProducts(page)

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <p>No products found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
