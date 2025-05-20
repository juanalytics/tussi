import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t py-8 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-pink-500 mb-4">TUSSI</h3>
            <p className="text-sm text-gray-500">
              A community-focused marketplace where you can buy and sell products directly with other users.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-pink-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-500 hover:text-pink-500 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-500 hover:text-pink-500 transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Contact</h3>
            <p className="text-sm text-gray-500 mb-4">
              info@tussi.com
              <br />
              123 Market Street
              <br />
              San Francisco, CA 94103
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-500 hover:text-pink-500 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-pink-500 transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-pink-500 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} TUSSI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
