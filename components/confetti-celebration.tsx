"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Define confetti particle types with more variety
type ParticleShape = "circle" | "square" | "rectangle" | "triangle" | "star" | "hexagon"
type ParticleProps = {
  id: number
  x: number
  y: number
  size: number
  color: string
  shape: ParticleShape
  rotation: number
  rotationSpeed: number
  duration: number
  delay: number
  horizontalDrift: number
  swayFactor: number
  opacity: number
  hasGradient: boolean
}

// Enhanced grayscale color palette with more variety
const COLORS = [
  "#FFFFFF",
  "#F0F0F0",
  "#E0E0E0",
  "#D0D0D0",
  "#C0C0C0",
  "#B0B0B0",
  "#A0A0A0",
  "#909090",
  "#808080",
  "#707070",
  "#606060",
  "#505050",
]

// Gradient definitions for more visual interest
const GRADIENTS = [
  "linear-gradient(135deg, #FFFFFF, #A0A0A0)",
  "linear-gradient(135deg, #E0E0E0, #808080)",
  "linear-gradient(45deg, #D0D0D0, #505050)",
  "linear-gradient(90deg, #F0F0F0, #909090)",
  "linear-gradient(180deg, #C0C0C0, #404040)",
  "radial-gradient(circle, #FFFFFF, #808080)",
]

export function ConfettiCelebration({
  show,
  duration = 3000,
  particleCount = 100,
  onComplete,
  isMajorMilestone = false,
}: {
  show: boolean
  duration?: number
  particleCount?: number
  onComplete?: () => void
  isMajorMilestone?: boolean
}) {
  const [particles, setParticles] = useState<ParticleProps[]>([])
  const animationTimer = useRef<NodeJS.Timeout | null>(null)
  const hasFired = useRef(false)

  // Determine optimal particle count based on device
  const getOptimalParticleCount = () => {
    // Reduce for mobile devices
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return Math.floor(particleCount * 2)
    }
    return particleCount * 3 // Triple the base count
  }

  useEffect(() => {
    if (show && !hasFired.current) {
      hasFired.current = true

      // Significantly increase particle count
      const baseCount = getOptimalParticleCount()
      const actualParticleCount = isMajorMilestone ? baseCount * 1.5 : baseCount

      // Generate particles with more variety
      setParticles(
        Array.from({ length: Math.floor(actualParticleCount) }, (_, i) => {
          // More shape variety
          const shape = ["circle", "square", "rectangle", "triangle", "star", "hexagon"][
            Math.floor(Math.random() * 6)
          ] as ParticleShape

          // More size variety based on shape
          const baseSize = shape === "star" ? 10 : shape === "rectangle" ? 8 : shape === "triangle" ? 9 : 5
          const sizeVariation = shape === "star" ? 8 : 6
          const size = baseSize + Math.random() * sizeVariation

          // Position particles at the top with horizontal distribution
          const x = Math.random() * 100 // percentage of screen width
          const y = -10 - Math.random() * 20 // start above the viewport, with more variation

          // Enhanced physics properties
          const duration = 2000 + Math.random() * 1500 // longer fall (2-3.5s)
          const horizontalDrift = (Math.random() - 0.5) * 40 // more drift
          const swayFactor = Math.random() * 3 // random sway intensity
          const rotationSpeed = (Math.random() - 0.5) * 720 // more rotation

          // Visual variety
          const hasGradient = Math.random() > 0.5
          const color = hasGradient
            ? GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]
            : COLORS[Math.floor(Math.random() * COLORS.length)]

          // Varied opacity
          const opacity = 0.7 + Math.random() * 0.3

          return {
            id: i,
            x,
            y,
            size,
            color,
            shape,
            rotation: Math.random() * 360,
            rotationSpeed,
            duration,
            delay: Math.random() * 1200, // more staggered start
            horizontalDrift,
            swayFactor,
            opacity,
            hasGradient,
          }
        }),
      )

      // Set cleanup timer
      animationTimer.current = setTimeout(() => {
        setParticles([])
        if (onComplete) onComplete()
        hasFired.current = false
      }, duration + 2000) // Add buffer time
    }

    return () => {
      if (animationTimer.current) {
        clearTimeout(animationTimer.current)
      }
    }
  }, [show, particleCount, duration, onComplete, isMajorMilestone])

  // Render different shapes
  const renderShape = (shape: ParticleShape, color: string) => {
    switch (shape) {
      case "triangle":
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: color,
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            }}
          />
        )
      case "star":
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: color,
              clipPath:
                "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
            }}
          />
        )
      case "hexagon":
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: color,
              clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
            }}
          />
        )
      default:
        return null // For basic shapes handled by CSS
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute will-change-transform"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.shape === "rectangle" ? `${particle.size * 2}px` : `${particle.size}px`,
              height: particle.shape === "rectangle" ? `${particle.size * 0.5}px` : `${particle.size}px`,
              background: ["triangle", "star", "hexagon"].includes(particle.shape) ? undefined : particle.color,
              borderRadius: particle.shape === "circle" ? "50%" : particle.shape === "square" ? "2px" : "1px",
              boxShadow: particle.hasGradient ? "0 0 3px rgba(255,255,255,0.3)" : "0 0 2px rgba(255,255,255,0.2)",
              transform: `rotate(${particle.rotation}deg)`,
              zIndex: 9999,
              opacity: particle.opacity,
            }}
            initial={{
              y: `${particle.y}vh`,
              x: `${particle.x}vw`,
              rotate: particle.rotation,
              opacity: particle.opacity,
            }}
            animate={{
              // Fall further down (90% of viewport)
              y: [`${particle.y}vh`, `${90 + Math.random() * 10}vh`],
              // Add sway with sine wave pattern
              x: [
                `${particle.x}vw`,
                `${particle.x + particle.horizontalDrift + Math.sin(particle.swayFactor * Math.PI) * 10}vw`,
              ],
              rotate: [particle.rotation, particle.rotation + particle.rotationSpeed],
              opacity: [particle.opacity, particle.opacity, 0],
            }}
            transition={{
              y: {
                duration: particle.duration / 1000,
                delay: particle.delay / 1000,
                ease: [0.1, 0.4, 0.7, 1], // Accelerated fall
              },
              x: {
                duration: particle.duration / 1000,
                delay: particle.delay / 1000,
                ease: "easeOut",
              },
              rotate: {
                duration: particle.duration / 1000,
                delay: particle.delay / 1000,
                ease: "linear",
              },
              // Start fading out at 70% of the animation duration
              opacity: {
                duration: (particle.duration / 1000) * 0.3, // Fade out over 30% of the total duration
                delay: particle.delay / 1000 + (particle.duration / 1000) * 0.7, // Start fading at 70% of animation
                times: [0, 0.7, 1],
                ease: "easeOut",
              },
            }}
          >
            {["triangle", "star", "hexagon"].includes(particle.shape) && renderShape(particle.shape, particle.color)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

