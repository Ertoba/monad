"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function ClickerButton() {
  const [clicks, setClicks] = useState(0)
  const [isPressed, setIsPressed] = useState(false)

  // Calculate progress for the ring (0-1)
  const progress = (clicks % 200) / 200

  // Load saved clicks from localStorage on mount
  useEffect(() => {
    const savedClicks = localStorage.getItem("clickerCount")
    if (savedClicks) {
      setClicks(Number.parseInt(savedClicks))
    }
  }, [])

  // Save clicks to localStorage when updated
  useEffect(() => {
    localStorage.setItem("clickerCount", clicks.toString())
  }, [clicks])

  const handleClick = () => {
    setClicks((prev) => prev + 1)
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150)
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative">
        {/* Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 transition-transform duration-300"
          viewBox="0 0 100 100"
        >
          <circle className="text-gray-200 stroke-current" strokeWidth="4" fill="none" r="45" cx="50" cy="50" />
          <circle
            className="text-[#6266E4] stroke-current transition-all duration-300"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            r="45"
            cx="50"
            cy="50"
            strokeDasharray={`${progress * 283} 283`}
          />
        </svg>

        {/* Clicker Button */}
        <motion.button
          className={`relative w-48 h-48 rounded-full bg-gradient-to-br from-[#6266E4] to-[#4F52B8] 
            shadow-[0_0_30px_rgba(98,102,228,0.5)] transition-transform duration-150
            flex items-center justify-center text-white text-2xl font-bold
            hover:shadow-[0_0_40px_rgba(98,102,228,0.6)]`}
          animate={{
            scale: isPressed ? 0.95 : 1,
          }}
          onClick={handleClick}
        >
          PUMP
        </motion.button>
      </div>

      {/* Points Display */}
      <div className="bg-[#252525] rounded-lg p-3 min-w-[160px] text-center">
        <div className="text-xs text-gray-400 mb-0.5">Total Points</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={clicks}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="text-2xl font-bold text-[#6266E4]"
          >
            {clicks.toLocaleString()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

