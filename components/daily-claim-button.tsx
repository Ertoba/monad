"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DailyClaimButtonProps {
  onClaim: () => Promise<void>
  isDisabled: boolean
  nextClaimTime?: Date | null
  className?: string
}

export function DailyClaimButton({ onClaim, isDisabled, nextClaimTime, className }: DailyClaimButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { toast } = useToast()

  // Format the time remaining until next claim
  useEffect(() => {
    if (!nextClaimTime || isDisabled === false) {
      setTimeRemaining("")
      return
    }

    const updateTimeRemaining = () => {
      const now = new Date()
      const diff = nextClaimTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining("")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [nextClaimTime, isDisabled])

  const handleClaim = async () => {
    if (isDisabled || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      await onClaim()
      setShowSuccess(true)

      toast({
        title: "Reward Claimed!",
        description: "You've earned 10 XP. Come back tomorrow for more!",
        className: "bg-[#1C1C1C] border-gray-800 text-white",
      })

      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      setRetryCount((prev) => prev + 1)

      // If we've tried 3 times, show a more helpful message
      const errorMessage =
        retryCount >= 2
          ? "Connection issues persist. Try again later."
          : error instanceof Error
            ? error.message
            : "Something went wrong"

      setError(errorMessage)

      toast({
        variant: "destructive",
        title: "Claim Failed",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className={cn("relative w-full", className)}
        whileHover={{ scale: isDisabled ? 1 : 1.03 }}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      >
        <Button
          onClick={handleClaim}
          disabled={isDisabled || isLoading}
          className={cn(
            "w-full h-[42px] rounded-xl overflow-hidden relative border border-white/20",
            "bg-gradient-to-r from-white/20 via-white/30 to-white/20",
            "text-white font-semibold shadow-inner shadow-white/5",
            isDisabled ? "opacity-70 cursor-not-allowed" : "",
            className,
          )}
        >
          {/* Enhanced misty gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/20 to-white/5 opacity-80 animate-gradient-shift"></div>

          {/* Dynamic particle effects */}
          <AnimatePresence>
            {!isDisabled && !isLoading && !showSuccess && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute w-1 h-1 rounded-full bg-white/80"
                    initial={{ opacity: 0, x: "50%", y: "50%" }}
                    animate={{
                      opacity: [0, 0.8, 0],
                      x: ["50%", `${30 + Math.random() * 40}%`],
                      y: ["50%", `${30 + Math.random() * 40}%`],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          <div className="relative z-10 flex items-center justify-center">
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>Claiming...</span>
              </>
            ) : showSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2 text-green-400" />
                <span>Claimed!</span>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-5 h-5 mr-2 text-amber-400" />
                <span>Try Again</span>
              </>
            ) : (
              <span className="text-gradient-gray font-medium tracking-wide text-base">Claim Daily Reward</span>
            )}
          </div>
        </Button>
      </motion.div>

      {/* Time remaining indicator */}
      {isDisabled && timeRemaining && (
        <div className="mt-3 text-sm text-white/70">
          Next claim available in <span className="text-white font-medium">{timeRemaining}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-2 text-xs text-amber-400">
          {error.includes("Retrying") ? error : "Connection issue - Try again"}
        </div>
      )}
    </div>
  )
}

