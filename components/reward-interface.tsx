"use client"

import { useState } from "react"
import { Trophy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function RewardInterface() {
  const [isLoading, setIsLoading] = useState(false)
  const [points, setPoints] = useState(0)
  const { toast } = useToast()

  // Handle claim action
  const handleClaim = async () => {
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setPoints((prev) => prev + 5)

      toast({
        title: "Points Claimed!",
        description: "You've earned 5 XP points for today!",
        className: "bg-[#1C1C1C] border-gray-800 text-white",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Claim Failed",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-b from-[#2E2E2E] to-[#111111] border border-gray-800/30 p-6 rounded-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-[#6266E4]" />
              <h2 className="text-xl font-semibold text-white">Daily Rewards</h2>
            </div>
            <div className="flex items-center gap-2 bg-[#252525] px-3 py-1.5 rounded-lg text-[#E4E3E8]">
              <Trophy className="h-4 w-4 text-[#6266E4]" />
              <span className="text-sm font-medium">{points} XP</span>
            </div>
          </div>

          {/* Description */}
          <motion.div
            className="text-center text-sm text-gray-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Collect daily rewards to earn XP and increase your rewards! Claim once every 24 hours.
          </motion.div>

          {/* Smaller Claim Button with Misty Gray Gradient */}
          <div className="flex justify-center">
            <Button
              onClick={handleClaim}
              disabled={isLoading}
              className="px-8 py-2 h-10 bg-gradient-to-r from-[#333333] to-[#222222] hover:from-[#444444] hover:to-[#333333] text-white font-medium rounded-lg transition-all duration-300 border border-gray-700/30"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Claiming...</span>
                </div>
              ) : (
                "Claim Reward"
              )}
            </Button>
          </div>

          {/* Status Message */}
          <div className="text-center text-sm text-gray-400">Next reward available in 24 hours</div>
        </div>
      </div>
    </div>
  )
}

