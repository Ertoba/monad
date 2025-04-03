"use client"

import { motion } from "framer-motion"

interface ComingSoonOverlayProps {
  className?: string
}

export function ComingSoonOverlay({ className }: ComingSoonOverlayProps) {
  return (
    <div className={`absolute inset-0 z-50 overflow-hidden ${className}`} aria-label="Coming Soon Overlay">
      {/* Frosted glass effect */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md" aria-hidden="true" />

      {/* Animated gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#6266E4]/20 to-transparent opacity-50"
        aria-hidden="true"
      />

      {/* Content */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="text-center">
          <motion.h2
            className="text-4xl font-bold text-white drop-shadow-lg"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Coming Soon
          </motion.h2>
          <motion.div
            className="mt-2 text-white/80 text-sm"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            This feature is currently under development
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div
        className="absolute inset-0 bg-[url('/glow.png')] bg-cover opacity-20 mix-blend-overlay"
        aria-hidden="true"
      />
    </div>
  )
}

