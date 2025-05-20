import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-pink-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to <span className="text-pink-500">TUSSI</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                A community-focused marketplace where you can buy and sell products directly with other users.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/products">
                <Button className="bg-pink-500 hover:bg-pink-600">
                  Browse Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            <div className="flex flex-col items-center space-y-2 border-pink-100 border p-6 rounded-lg">
              <div className="p-3 rounded-full bg-pink-100">
                <svg
                  className="h-6 w-6 text-pink-500"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Secure Transactions</h3>
              <p className="text-sm text-gray-500 text-center">
                All transactions are secure and protected with the latest encryption technology.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border-pink-100 border p-6 rounded-lg">
              <div className="p-3 rounded-full bg-pink-100">
                <svg
                  className="h-6 w-6 text-pink-500"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Community Focused</h3>
              <p className="text-sm text-gray-500 text-center">
                Connect directly with buyers and sellers in your community.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border-pink-100 border p-6 rounded-lg">
              <div className="p-3 rounded-full bg-pink-100">
                <svg
                  className="h-6 w-6 text-pink-500"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.5 12.572 12 17l-7.5-4.428V7.572L12 3l7.5 4.572v5" />
                  <path d="M12 17v4" />
                  <path d="M5 6.7 12 3l7 3.7" />
                  <line x1="12" x2="12" y1="17" y2="13" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Easy to Use</h3>
              <p className="text-sm text-gray-500 text-center">
                Our platform is designed to be intuitive and easy to navigate.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
