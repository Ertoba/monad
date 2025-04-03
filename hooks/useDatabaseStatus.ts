"use client"

import { useState, useEffect, useCallback } from "react"

export function useDatabaseStatus() {
  const [isConnected, setIsConnected] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [retryDelay, setRetryDelay] = useState(1000) // Initial retry delay: 1 second

  // Function to check database connection with retry logic
  const checkConnection = useCallback(
    async (isManualRetry = false) => {
      if (isChecking && !isManualRetry) return

      setIsChecking(true)

      try {
        const startTime = Date.now()
        const response = await fetch("/api/health")
        const data = await response.json()
        const endTime = Date.now()

        setResponseTime(endTime - startTime)
        setIsConnected(response.ok && data.status === "ok")
        setLastChecked(new Date())

        // Reset retry count and delay on successful connection
        if (response.ok && data.status === "ok") {
          setRetryCount(0)
          setRetryDelay(1000)
        }
      } catch (error) {
        console.error("Database connection check failed:", error)
        setIsConnected(false)

        // Increment retry count for exponential backoff
        if (!isManualRetry) {
          setRetryCount((prev) => prev + 1)
        }
      } finally {
        setIsChecking(false)
      }
    },
    [isChecking, retryCount],
  )

  // Check connection on mount
  useEffect(() => {
    checkConnection()

    // Set up periodic checks with exponential backoff
    const interval = setInterval(
      () => {
        // If not connected, use exponential backoff for retries
        if (!isConnected) {
          // Calculate exponential backoff delay (max 30 seconds)
          const newDelay = Math.min(1000 * Math.pow(1.5, retryCount), 30000)
          setRetryDelay(newDelay)
          console.log(`Retrying database connection in ${newDelay}ms (retry #${retryCount + 1})`)
        }

        checkConnection()
      },
      isConnected ? 60000 : retryDelay,
    ) // Check every minute if connected, or use backoff delay

    return () => clearInterval(interval)
  }, [checkConnection, isConnected, retryCount, retryDelay])

  return {
    isConnected,
    isChecking,
    lastChecked,
    responseTime,
    retryCount,
    checkConnection: () => checkConnection(true), // Manual retry
  }
}

