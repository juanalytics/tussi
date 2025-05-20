import { Suspense } from "react"
import ProductList from "@/components/product-list"
import ProductListSkeleton from "@/components/product-list-skeleton"
import { Pagination } from "@/components/pagination"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage =  Number(page) || 1


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Handcrafted Products</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Browse our collection of unique, handcrafted items from independent creators. Each product is made with care
          and attention to detail.
        </p>
      </div>

      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList page={currentPage} />
      </Suspense>

      <div className="mt-8 flex justify-center">
        <Pagination currentPage={currentPage} totalPages={3} />
      </div>
    </div>
  )
}
