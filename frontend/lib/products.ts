import type { Product } from "./types"

// Replace the entire mockProducts array with this more realistic product data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Handcrafted Leather Tote Bag",
    description:
      "Elegant handcrafted leather tote bag made from premium full-grain leather. Features a spacious interior, sturdy handles, and a detachable shoulder strap. Perfect for daily use or weekend getaways.",
    price: 129.99,
    image: "/placeholder.svg?height=400&width=400&text=Leather+Tote",
  },
  {
    id: "2",
    name: "Minimalist Ceramic Plant Pot Set",
    description:
      "Set of 3 minimalist ceramic plant pots in varying sizes. Each pot features a clean, modern design with a matte finish and drainage hole. Ideal for succulents, herbs, or small indoor plants.",
    price: 34.99,
    image: "/placeholder.svg?height=400&width=400&text=Ceramic+Pots",
  },
  {
    id: "3",
    name: "Handwoven Wool Throw Blanket",
    description:
      "Luxurious handwoven throw blanket made from 100% merino wool. Features a beautiful herringbone pattern and hand-knotted fringe. Adds warmth and style to any living space.",
    price: 79.99,
    image: "/placeholder.svg?height=400&width=400&text=Wool+Blanket",
  },
  {
    id: "4",
    name: "Artisanal Stoneware Mug Set",
    description:
      "Set of 4 handcrafted stoneware mugs, each with a unique glaze pattern. Microwave and dishwasher safe with a comfortable handle and 12oz capacity. Perfect for your morning coffee or evening tea.",
    price: 48.5,
    image: "/placeholder.svg?height=400&width=400&text=Stoneware+Mugs",
  },
  {
    id: "5",
    name: "Organic Soy Wax Candle Collection",
    description:
      "Set of 3 hand-poured soy wax candles in amber glass jars. Scented with pure essential oils in Lavender Fields, Cedar & Sage, and Vanilla Bean. 40+ hour burn time per candle.",
    price: 42.99,
    image: "/placeholder.svg?height=400&width=400&text=Soy+Candles",
  },
  {
    id: "6",
    name: "Reclaimed Wood Serving Board",
    description:
      "Stunning serving board handcrafted from reclaimed walnut and maple. Each piece is unique with natural wood grain patterns and finished with food-safe mineral oil. Perfect for charcuterie or serving appetizers.",
    price: 65.0,
    image: "/placeholder.svg?height=400&width=400&text=Serving+Board",
  },
  {
    id: "7",
    name: "Organic Cotton Market Tote",
    description:
      "Durable market tote made from 100% organic cotton canvas. Features reinforced handles, an interior pocket, and a structured bottom. Ethically made and perfect for grocery shopping or beach days.",
    price: 28.99,
    image: "/placeholder.svg?height=400&width=400&text=Cotton+Tote",
  },
  {
    id: "8",
    name: "Handmade Ceramic Dinner Set",
    description:
      "Complete 4-person dinner set including plates, bowls, and mugs. Each piece is handmade with speckled clay and features a reactive glaze that creates unique patterns. Microwave and dishwasher safe.",
    price: 189.99,
    image: "/placeholder.svg?height=400&width=400&text=Dinner+Set",
  },
  {
    id: "9",
    name: "Merino Wool Beanie",
    description:
      "Luxuriously soft beanie hand-knitted from 100% merino wool. Features a classic ribbed design and comes in multiple colors. Keeps you warm without overheating and is naturally moisture-wicking.",
    price: 36.5,
    image: "/placeholder.svg?height=400&width=400&text=Wool+Beanie",
  },
  {
    id: "10",
    name: "Leather-Bound Travel Journal",
    description:
      "Handcrafted leather journal with 240 pages of premium acid-free paper. Features a wrap-around leather tie closure and a pocket for mementos. Perfect for sketching, journaling, or planning your next adventure.",
    price: 45.99,
    image: "/placeholder.svg?height=400&width=400&text=Travel+Journal",
  },
  {
    id: "11",
    name: "Bohemian Macramé Wall Hanging",
    description:
      "Intricate macramé wall hanging handcrafted from 100% cotton rope. Features a beautiful geometric design with wooden beads and hangs from a driftwood branch. Adds texture and bohemian charm to any wall.",
    price: 59.99,
    image: "/placeholder.svg?height=400&width=400&text=Macrame+Hanging",
  },
  {
    id: "12",
    name: "Hand-Painted Silk Scarf",
    description:
      "Luxurious silk scarf hand-painted with botanical motifs. Made from 100% mulberry silk with hand-rolled edges. Each piece is one-of-a-kind and adds an elegant touch to any outfit.",
    price: 85.0,
    image: "/placeholder.svg?height=400&width=400&text=Silk+Scarf",
  },
  {
    id: "13",
    name: "Natural Skincare Gift Set",
    description:
      "Complete skincare set featuring handmade soap, facial oil, body butter, and lip balm. All products are made with organic ingredients and essential oils. Comes in a reusable cotton drawstring bag.",
    price: 64.99,
    image: "/placeholder.svg?height=400&width=400&text=Skincare+Set",
  },
  {
    id: "14",
    name: "Bamboo Desk Organizer",
    description:
      "Sustainable desk organizer crafted from bamboo. Features multiple compartments for pens, notes, and office supplies with a sleek, minimalist design. Helps keep your workspace tidy and organized.",
    price: 38.5,
    image: "/placeholder.svg?height=400&width=400&text=Desk+Organizer",
  },
  {
    id: "15",
    name: "Hand-Blown Glass Terrarium",
    description:
      "Geometric glass terrarium handcrafted by skilled artisans. Perfect for displaying air plants, succulents, or creating a miniature garden. Includes a small opening for easy plant care.",
    price: 52.99,
    image: "/placeholder.svg?height=400&width=400&text=Glass+Terrarium",
  },
  {
    id: "16",
    name: "Handwoven Seagrass Basket Set",
    description:
      "Set of 3 nesting baskets handwoven from natural seagrass. Features sturdy handles and a beautiful braided design. Perfect for storage, organization, or as decorative planters.",
    price: 49.99,
    image: "/placeholder.svg?height=400&width=400&text=Seagrass+Baskets",
  },
  {
    id: "17",
    name: "Vintage-Inspired Linen Apron",
    description:
      "Durable full-length apron made from stonewashed European linen. Features adjustable neck strap, large front pocket, and cross-back design. Gets softer with each wash and perfect for cooking or crafting.",
    price: 42.0,
    image: "/placeholder.svg?height=400&width=400&text=Linen+Apron",
  },
  {
    id: "18",
    name: "Handcrafted Wooden Chess Set",
    description:
      "Beautiful chess set with hand-carved wooden pieces and an inlaid board. The pieces are crafted from maple and walnut with felt bottoms. Board folds for easy storage of pieces inside.",
    price: 119.99,
    image: "/placeholder.svg?height=400&width=400&text=Chess+Set",
  },
  {
    id: "19",
    name: "Copper Moscow Mule Mugs",
    description:
      "Set of 4 authentic copper Moscow Mule mugs with 16oz capacity. Handcrafted with a pure copper exterior, stainless steel lining, and brass handle. Keeps drinks perfectly chilled.",
    price: 74.5,
    image: "/placeholder.svg?height=400&width=400&text=Copper+Mugs",
  },
  {
    id: "20",
    name: "Handmade Beeswax Food Wraps",
    description:
      "Set of 5 reusable food wraps in various sizes made from organic cotton infused with beeswax, jojoba oil, and tree resin. Sustainable alternative to plastic wrap that keeps food fresh naturally.",
    price: 32.99,
    image: "/placeholder.svg?height=400&width=400&text=Beeswax+Wraps",
  },
  {
    id: "21",
    name: "Artisanal Ceramic Berry Bowl",
    description:
      "Handcrafted ceramic colander perfect for washing and serving berries and small fruits. Features drainage holes and an elegant design with a beautiful reactive glaze. Comes with matching plate to catch drips.",
    price: 44.0,
    image: "/placeholder.svg?height=400&width=400&text=Berry+Bowl",
  },
  {
    id: "22",
    name: "Hand-Knit Chunky Throw Pillow",
    description:
      "Cozy throw pillow hand-knitted from chunky merino wool. Features a removable cover with hidden zipper and comes with a plush insert. Adds texture and warmth to any sofa or bed.",
    price: 68.99,
    image: "/placeholder.svg?height=400&width=400&text=Knit+Pillow",
  },
  {
    id: "23",
    name: "Botanical Print Collection",
    description:
      "Set of 3 archival-quality botanical prints on acid-free paper. Features detailed illustrations of native plants with hand-deckled edges. Perfect for framing and creating a gallery wall.",
    price: 54.5,
    image: "/placeholder.svg?height=400&width=400&text=Botanical+Prints",
  },
  {
    id: "24",
    name: "Handcrafted Leather Wallet",
    description:
      "Minimalist wallet handmade from full-grain vegetable-tanned leather. Features card slots, bill compartment, and RFID protection. Develops a beautiful patina over time.",
    price: 59.99,
    image: "/placeholder.svg?height=400&width=400&text=Leather+Wallet",
  },
]

// Function to get paginated products
export async function getProducts(page = 1, limit = 8): Promise<Product[]> {
  // Simulate API delay - using a shorter delay for better UX
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Calculate start and end indices for pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit

  // Return the sliced array of products for the requested page
  return mockProducts.slice(startIndex, endIndex)
}

// Function to get a single product by ID
export async function getProduct(id: string): Promise<Product | null> {
  // Simulate API delay - using a shorter delay for better UX
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Find the product by ID
  const product = mockProducts.find((p) => p.id === id)
  return product || null
}
