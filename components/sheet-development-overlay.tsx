"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export function SheetDevelopmentOverlay() {
  return (
    <motion.div
      className="absolute inset-0 z-10 rounded-t-2xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient blur background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2E2E2E]/80 to-black/80 backdrop-blur-md" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          {/* Main content */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10">
            {/* Smaller, faster spinning loader */}
            <Loader2 className="h-3.5 w-3.5 text-[#6266E4] animate-[spin_0.8s_linear_infinite]" />
            <span className="text-white/90 text-sm font-medium">Under Development</span>
          </div>

          {/* Mirror-like reflection */}
          <motion.div
            className="mt-1.5 px-4 py-1 rounded-lg bg-black/20 backdrop-blur-sm w-[90%]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0.1, 0.2, 0] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <div className="text-white/20 text-xs blur-[0.5px] transform scale-y-[-0.8] opacity-50 text-center">
              Under Development
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

