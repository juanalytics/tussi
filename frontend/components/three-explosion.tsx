"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"

interface ThreeExplosionProps {
  isActive: boolean
  onAnimationComplete: () => void
  originX: number
  originY: number
}

// Particle system component
function ParticleSystem({
  count = 2000,
  originX,
  originY,
}: {
  count: number
  originX: number
  originY: number
}) {
  const { viewport, camera } = useThree()
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const dummy = useRef(new THREE.Object3D())
  const particles = useRef<any[]>([])
  const animationStartTime = useRef(Date.now())

  // Convert screen coordinates to Three.js world coordinates
  const screenToWorld = (x: number, y: number) => {
    const vector = new THREE.Vector3()
    vector.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0)
    vector.unproject(camera)
    const dir = vector.sub(camera.position).normalize()
    const distance = -camera.position.z / dir.z
    return camera.position.clone().add(dir.multiplyScalar(distance))
  }

  const origin = screenToWorld(originX, originY)

  // Initialize particles
  useEffect(() => {
    if (!mesh.current) return

    particles.current = []
    animationStartTime.current = Date.now()

    for (let i = 0; i < count; i++) {
      // Create particles with random properties
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      const particle = {
        position: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi),
        ).multiplyScalar(Math.random() * 0.2 + 0.1), // Increased velocity for faster movement
        acceleration: new THREE.Vector3(0, 0, 0),
        size: Math.random() * 0.5 + 0.5,
        color: new THREE.Color(
          0.9 + Math.random() * 0.1, // Red
          0.2 + Math.random() * 0.3, // Green
          0.5 + Math.random() * 0.3, // Blue
        ),
        life: 1.0,
        decay: Math.random() * 0.05 + 0.02,
      }

      particles.current.push(particle)
    }
  }, [count])

  // Animation loop
  useFrame(() => {
    if (!mesh.current) return

    // Update and render each particle
    particles.current.forEach((particle, i) => {
      // Start with particles at the origin
      if (particle.position.length() < 0.001) {
        particle.position.copy(origin)
      }

      // Apply velocity and update position
      particle.velocity.add(particle.acceleration)
      particle.position.add(particle.velocity)

      // Add some turbulence
      particle.velocity.x += (Math.random() - 0.5) * 0.003
      particle.velocity.y += (Math.random() - 0.5) * 0.003
      particle.velocity.z += (Math.random() - 0.5) * 0.003

      // Slow down over time
      particle.velocity.multiplyScalar(0.99)

      // Reduce life based on decay rate
      particle.life -= particle.decay * 0.01

      // Only render particles that are still alive
      if (particle.life > 0) {
        dummy.current.position.copy(particle.position)

        // Scale based on life and size
        const scale = particle.size * particle.life
        dummy.current.scale.set(scale, scale, scale)

        dummy.current.updateMatrix()
        mesh.current.setMatrixAt(i, dummy.current.matrix)

        // Set color with alpha based on life
        mesh.current.setColorAt(i, particle.color)
      } else {
        // Hide dead particles
        dummy.current.scale.set(0, 0, 0)
        dummy.current.updateMatrix()
        mesh.current.setMatrixAt(i, dummy.current.matrix)
      }
    })

    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

// Background component that fades in
function Background({ progress }: { progress: number }) {
  const opacity = Math.min(progress * 1.5, 0.85) // Max opacity of 0.85

  return (
    <mesh position={[0, 0, -5]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial color="#ec4899" transparent opacity={opacity} />
    </mesh>
  )
}

// Main explosion component
function Explosion({ isActive, onAnimationComplete, originX, originY }: ThreeExplosionProps) {
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const animationDuration = 2000 // 2 seconds (in milliseconds)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now()

      // Set up the timer to complete after exactly 2 seconds
      timerRef.current = setTimeout(() => {
        onAnimationComplete()
      }, animationDuration)

      const updateProgress = () => {
        if (!startTimeRef.current) return

        const elapsed = Date.now() - startTimeRef.current
        const newProgress = Math.min(elapsed / animationDuration, 1)
        setProgress(newProgress)

        if (newProgress < 1) {
          requestAnimationFrame(updateProgress)
        }
      }

      requestAnimationFrame(updateProgress)
    } else {
      startTimeRef.current = null
      setProgress(0)

      // Clear the timer if component unmounts or animation is stopped
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isActive, onAnimationComplete, animationDuration])

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ParticleSystem count={2000} originX={originX} originY={originY} />
      <Background progress={progress} />
    </Canvas>
  )
}

export default function ThreeExplosion({ isActive, onAnimationComplete, originX, originY }: ThreeExplosionProps) {
  if (!isActive) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <Explosion isActive={isActive} onAnimationComplete={onAnimationComplete} originX={originX} originY={originY} />
    </div>
  )
}
