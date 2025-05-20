"use client"

import { useEffect, useRef, useState } from "react"

interface PinkExplosionProps {
  isActive: boolean
  onAnimationComplete: () => void
  originX: number
  originY: number
}

export default function PinkExplosion({ isActive, onAnimationComplete, originX, originY }: PinkExplosionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const [opacity, setOpacity] = useState(0)

  // Particle class for the explosion effect
  class Particle {
    x: number
    y: number
    size: number
    speedX: number
    speedY: number
    color: string
    alpha: number

    constructor(x: number, y: number) {
      this.x = x
      this.y = y
      this.size = Math.random() * 15 + 5
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 8 + 2
      this.speedX = Math.cos(angle) * speed
      this.speedY = Math.sin(angle) * speed
      this.color = "#ec4899" // Pink-500
      this.alpha = 1
    }

    update() {
      this.x += this.speedX
      this.y += this.speedY
      this.speedX *= 0.98
      this.speedY *= 0.98
      this.size *= 1.02
      this.alpha -= 0.005
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.globalAlpha = this.alpha
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.fill()
    }
  }

  // Initialize the explosion
  const initExplosion = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear previous particles
    particlesRef.current = []

    // Create particles
    for (let i = 0; i < 100; i++) {
      particlesRef.current.push(new Particle(originX, originY))
    }

    // Start animation
    animate()

    // Fade in the background
    setOpacity(0)
    const fadeIn = setInterval(() => {
      setOpacity((prev) => {
        const newOpacity = prev + 0.02
        if (newOpacity >= 0.8) {
          clearInterval(fadeIn)
          // Notify parent that animation is complete
          setTimeout(() => {
            onAnimationComplete()
          }, 300)
          return 0.8
        }
        return newOpacity
      })
    }, 20)
  }

  // Animation loop
  const animate = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    particlesRef.current.forEach((particle) => {
      particle.update()
      particle.draw(ctx)
    })

    // Continue animation if particles are still visible
    if (particlesRef.current.some((p) => p.alpha > 0)) {
      animationRef.current = requestAnimationFrame(animate)
    }
  }

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // Start animation when isActive changes
  useEffect(() => {
    if (isActive) {
      initExplosion()
    } else {
      cancelAnimationFrame(animationRef.current)
      setOpacity(0)
    }

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isActive])

  if (!isActive && opacity === 0) return null

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-50 bg-pink-500 transition-opacity duration-300"
        style={{ opacity }}
      />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-40"
        style={{ opacity: isActive ? 1 : 0 }}
      />
    </>
  )
}
