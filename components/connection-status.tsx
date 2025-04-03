"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConnectionStatusProps {
  onRetry?: () => Promise<void>
  isConnected?: boolean
  retryCount?: number
  className?: string
}

export function ConnectionStatus({
  onRetry,
  isConnected = true,
  retryCount = 0,
  className = "",
}: ConnectionStatusProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [showStatus, setShowStatus] = useState(false)

  // Only show the status after a delay if not connected
  useEffect(() => {
    if (!isConnected) {
      const timer = setTimeout(() => {
        setShowStatus(true)
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      setShowStatus(false)
    }
  }, [isConnected])

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return

    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  if (!showStatus) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-2 bg-[#1A1A1A] rounded-lg p-2 text-xs ${className}`}
    >
      <WifiOff className="h-3.5 w-3.5 text-amber-400" />
      <span className="text-amber-400">
        Database connection issue
        {retryCount > 0 && ` (Retry ${retryCount})`}
      </span>
      <Button
        size="sm"
        variant="outline"
        className="h-6 text-xs px-2 py-0.5 ml-auto bg-[#252525] border-gray-700 text-white/80 hover:bg-[#2A2A2A]"
        onClick={handleRetry}
        disabled={isRetrying}
      >
        {isRetrying ? (
          <>
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            <span>Retrying...</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-3 w-3 mr-1" />
            <span>Retry</span>
          </>
        )}
      </Button>
    </motion.div>
  )
}

