"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ClaimButtonConfig {
  text: string
  size: { width: string; height: string }
  border: { radius: string; width: string; color: string }
  background: {
    gradient: {
      colors: string[]
      animation: { type: string; duration: string; infinite: boolean }
    }
  }
  textStyle: { color: string; fontSize: string; fontWeight: string }
  hoverEffect: { scale: number; transition: string }
}

interface AnimatedClaimButtonProps {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
}

const claimButtonConfig: ClaimButtonConfig = {
  text: "Claim",
  size: { width: "200px", height: "60px" },
  border: { radius: "30px", width: "2px", color: "#ffffff" },
  background: {
    gradient: {
      colors: ["#6266E4", "#4A4FCF", "#200052"],
      animation: { type: "radial-gradient", duration: "2s", infinite: true },
    },
  },
  textStyle: { color: "#ffffff", fontSize: "18px", fontWeight: "bold" },
  hoverEffect: { scale: 1.05, transition: "0.3s" },
}

export function AnimatedClaimButton({ onClick, disabled, loading, className }: AnimatedClaimButtonProps) {
  const [showPopup, setShowPopup] = useState(false)

  const handleClick = async () => {
    if (disabled || loading || !onClick) return

    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 3000)
    onClick()
  }

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn(
          "relative overflow-hidden group",
          "w-full h-[42px] rounded-[30px]",
          "border-2 border-white/20",
          "text-white text-lg font-bold",
          "transition-all duration-300",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "before:absolute before:inset-0",
          "before:bg-[radial-gradient(circle,#6266E4,#4A4FCF,#200052)]",
          "before:animate-gradient-animation",
          "after:absolute after:inset-0",
          "after:bg-black/20 after:opacity-0",
          "after:transition-opacity after:duration-300",
          "hover:after:opacity-100",
          "focus:outline-none focus:ring-2 focus:ring-[#6266E4]/50",
          className,
        )}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <span className="relative z-10 flex items-center justify-center gap-3 text-2xl font-bold -translate-y-4">
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </>
          ) : (
            claimButtonConfig.text
          )}
        </span>
      </motion.button>

      {/* Animated Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="absolute -top-20 bg-white/90 text-[#200052] px-5 py-3 rounded-xl shadow-lg text-base font-medium"
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            🎉 Reward Claimed! 🎁
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

