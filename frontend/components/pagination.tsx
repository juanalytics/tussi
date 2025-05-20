import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  // Calculate actual total pages based on our 24 products with 8 per page
  const actualTotalPages = totalPages || 3

  return (
    <div className="flex items-center justify-center space-x-2">
      <Link href={`/products?page=${Math.max(1, currentPage - 1)}`}>
        <Button variant="outline" size="icon" disabled={currentPage <= 1}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
      </Link>

      <div className="flex items-center justify-center">
        {Array.from({ length: actualTotalPages }, (_, i) => i + 1).map((page) => {
          // Show current page, first, last, and pages around current
          const shouldShow = page === 1 || page === actualTotalPages || Math.abs(page - currentPage) <= 1

          if (!shouldShow) {
            // Show ellipsis for skipped pages
            if (page === 2 || page === actualTotalPages - 1) {
              return (
                <span key={page} className="px-2">
                  ...
                </span>
              )
            }
            return null
          }

          return (
            <Link key={page} href={`/products?page=${page}`}>
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                className={currentPage === page ? "bg-pink-500 hover:bg-pink-600" : ""}
              >
                {page}
              </Button>
            </Link>
          )
        })}
      </div>

      <Link href={`/products?page=${Math.min(actualTotalPages, currentPage + 1)}`}>
        <Button variant="outline" size="icon" disabled={currentPage >= actualTotalPages}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </Link>
    </div>
  )
}
