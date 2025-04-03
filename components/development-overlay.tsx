"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface DevelopmentOverlayProps {
  className?: string
}

export function DevelopmentOverlay({ className }: DevelopmentOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-40 overflow-hidden rounded-xl", // Lower z-index
        "backdrop-blur-md bg-white/10",
        "shadow-[inset_0_0_1px_rgba(255,255,255,0.1)]",
        className,
      )}
      aria-label="Development Overlay"
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#6266E4]/20 via-transparent to-[#4A4FCF]/20 animate-gradient-shift"
        aria-hidden="true"
      />

      {/* Content */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            {/* Spinning loader - smaller and faster */}
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/40 animate-[spin_1s_linear_infinite]" />
            </div>

            {/* Text */}
            <motion.span
              className="text-white/90 text-sm font-medium"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Under Development
            </motion.span>
          </div>

          {/* Mirror-like reflection animation */}
          <motion.div
            className="mt-1 px-4 py-1 rounded-lg bg-white/5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0.1, 0.3, 0] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <div className="text-white/30 text-xs blur-[0.5px] transform scale-y-[-0.8] opacity-50">
              Under Development
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Inner shadow overlay */}
      <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_30px_rgba(0,0,0,0.1)]" aria-hidden="true" />
    </div>
  )
}

