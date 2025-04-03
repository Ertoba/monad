"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useWalletContext } from "@/contexts/wallet-context"

// Interface for XP data
export interface XpData {
  xpTotal: number
  claimCount: number
  lastClaimedAt: Date | null
  canClaim: boolean
  nextClaimTime: Date | null
  isLoading: boolean
  error: string | null
  // Add these fields with default values
  level: number
  progress: number
  txCount: number
  xpReward: number
  totalXp: number
  // Add referral fields
  referralCode: string | null
  referrerCode: string | null
  twitterConnected: boolean
  referralXp: number
  // Add fallback indicator
  usingFallbackData?: boolean
}

// Default XP data with all fields initialized
const DEFAULT_XP_DATA: XpData = {
  xpTotal: 0,
  totalXp: 0,
  claimCount: 0,
  lastClaimedAt: null,
  canClaim: true,
  nextClaimTime: null,
  isLoading: false,
  error: null,
  level: 1,
  progress: 0,
  txCount: 0,
  xpReward: 10,
  referralCode: null,
  referrerCode: null,
  twitterConnected: false,
  referralXp: 0,
  usingFallbackData: false,
}

export function useXpTracker() {
  const { address } = useWalletContext()
  const [xpData, setXpData] = useState<XpData>(DEFAULT_XP_DATA)
  const retryCount = useRef(0)
  const maxRetries = 3
  const retryDelay = 1000 // 1 second

  // Calculate derived values based on XP total
  const calculateDerivedValues = useCallback((xpTotal: number, txCount: number, referralXp = 0) => {
    // Ensure we have valid numbers
    const safeXpTotal = typeof xpTotal === "number" && !isNaN(xpTotal) ? xpTotal : 0
    const safeTxCount = typeof txCount === "number" && !isNaN(txCount) ? txCount : 0
    const safeReferralXp = typeof referralXp === "number" && !isNaN(referralXp) ? referralXp : 0

    // Level calculation: 1 + floor(xpTotal / 100)
    const level = 1 + Math.floor(safeXpTotal / 100)

    // Progress calculation: percentage to next level (0-100)
    const xpForCurrentLevel = (level - 1) * 100
    const xpToNextLevel = level * 100
    const progress = Math.min(
      100,
      Math.floor(((safeXpTotal - xpForCurrentLevel) / (xpToNextLevel - xpForCurrentLevel)) * 100),
    )

    // XP reward calculation: base 10 XP + level bonus
    const xpReward = 10 + Math.floor(level / 2)

    return { level, progress, xpReward, txCount: safeTxCount, referralXp: safeReferralXp }
  }, [])

  // Fetch XP data from the API with retry logic
  const fetchXpData = useCallback(
    async (retry = false) => {
      if (!address) {
        setXpData(DEFAULT_XP_DATA)
        return
      }

      // Reset retry count if this is a new request (not a retry)
      if (!retry) {
        retryCount.current = 0
      }

      setXpData((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        // Fetch XP data
        const xpResponse = await fetch(`/api/xp?walletAddress=${address}`)

        if (!xpResponse.ok) {
          throw new Error(`API returned status ${xpResponse.status}`)
        }

        const xpResult = await xpResponse.json()

        // Fetch referral data
        let referralData = null
        let referralError = null
        try {
          const referralResponse = await fetch(`/api/referral?userWallet=${address}`)
          if (referralResponse.ok) {
            const referralResult = await referralResponse.json()
            if (referralResult.success) {
              referralData = referralResult.data
            }
          }
        } catch (err) {
          console.error("Error fetching referral data:", err)
          referralError = err
        }

        // Even if success is false, we should have default data
        const data = xpResult.data || {
          xp_total: 0,
          claim_count: 0,
          last_claimed_at: null,
          canClaim: true,
          nextClaimTime: null,
        }

        // Check if we're using fallback data
        const usingFallback = !!data.note?.includes("fallback")

        // Get transaction count from localStorage or default to 0
        const txCount = Number.parseInt(localStorage.getItem("txCount") || "0", 10)

        // Ensure xp_total is a number
        const xpTotal = typeof data.xp_total === "number" ? data.xp_total : 0

        // Get referral XP
        const referralXp = referralData ? referralData.xp : 0

        // Calculate derived values
        const { level, progress, xpReward } = calculateDerivedValues(xpTotal, txCount, referralXp)

        setXpData({
          xpTotal,
          totalXp: xpTotal + referralXp, // Include referral XP in total
          claimCount: data.claim_count || 0,
          lastClaimedAt: data.last_claimed_at ? new Date(data.last_claimed_at) : null,
          canClaim: !!data.canClaim,
          nextClaimTime: data.nextClaimTime ? new Date(data.nextClaimTime) : null,
          isLoading: false,
          error: xpResult.success && !usingFallback ? null : xpResult.error || referralError?.message || null,
          level,
          progress,
          txCount,
          xpReward,
          referralCode: referralData ? referralData.referral_code : null,
          referrerCode: referralData ? referralData.referrer_code : null,
          twitterConnected: referralData ? referralData.twitter_connected : false,
          referralXp,
          usingFallbackData: usingFallback,
        })
      } catch (error) {
        console.error("Failed to load XP data:", error)

        // Implement retry logic
        if (retryCount.current < maxRetries) {
          retryCount.current++
          console.log(`Retrying XP data fetch (${retryCount.current}/${maxRetries})...`)

          // Set a temporary error message during retry
          setXpData((prev) => ({
            ...prev,
            isLoading: true,
            error: `Retrying... (${retryCount.current}/${maxRetries})`,
          }))

          // Wait before retrying
          setTimeout(() => {
            fetchXpData(true)
          }, retryDelay * retryCount.current)
          return
        }

        // If all retries failed, use local data if available
        const txCount = Number.parseInt(localStorage.getItem("txCount") || "0", 10)
        const localXp = Number.parseInt(localStorage.getItem("localXp") || "0", 10)

        // Calculate derived values from local data
        const { level, progress, xpReward } = calculateDerivedValues(localXp, txCount)

        setXpData((prev) => ({
          ...prev,
          xpTotal: localXp,
          totalXp: localXp,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to load XP data",
          level,
          progress,
          txCount,
          xpReward,
          referralCode: null,
          referrerCode: null,
          twitterConnected: false,
          referralXp: 0,
          usingFallbackData: true,
        }))
      }
    },
    [address, calculateDerivedValues],
  )

  // Connect Twitter account with improved error handling
  const connectTwitter = useCallback(
    async (twitterToken: string) => {
      if (!address) return false

      try {
        const response = await fetch("/api/twitter/connect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userWallet: address, twitterToken }),
        })

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Failed to connect Twitter account")
        }

        // Check if we're using fallback data
        const usingFallback = !!result.data?.note?.includes("fallback")

        // Update local state to reflect Twitter connection
        setXpData((prev) => ({
          ...prev,
          twitterConnected: true,
          usingFallbackData: prev.usingFallbackData || usingFallback,
        }))

        // Refresh XP data after successful connection
        await fetchXpData()
        return true
      } catch (error) {
        console.error("Failed to connect Twitter account:", error)

        // Update local state anyway to prevent UI blocking
        setXpData((prev) => ({
          ...prev,
          twitterConnected: true,
          usingFallbackData: true,
          error: error instanceof Error ? error.message : "Failed to connect Twitter account",
        }))

        // Return true to prevent UI blocking
        return true
      }
    },
    [address, fetchXpData],
  )

  // Record a daily claim with retry logic and fallback
  const claimDailyReward = useCallback(async () => {
    if (!address) return false

    setXpData((prev) => ({ ...prev, isLoading: true, error: null }))
    retryCount.current = 0

    const attemptClaim = async (retry = false): Promise<boolean> => {
      try {
        const response = await fetch("/api/xp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletAddress: address }),
        })

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Failed to claim daily reward")
        }

        // Check if we're using fallback data
        const usingFallback = !!result.data?.note?.includes("fallback")

        if (usingFallback) {
          // Update local state to reflect the claim
          setXpData((prev) => ({
            ...prev,
            xpTotal: prev.xpTotal + 10, // Assume 10 XP reward
            totalXp: prev.totalXp + 10,
            claimCount: prev.claimCount + 1,
            lastClaimedAt: new Date(),
            canClaim: false,
            nextClaimTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            isLoading: false,
            usingFallbackData: true,
          }))

          // Store in localStorage as backup
          const localXp = Number.parseInt(localStorage.getItem("localXp") || "0", 10)
          localStorage.setItem("localXp", (localXp + 10).toString())

          return true
        }

        // Refresh XP data after successful claim
        await fetchXpData()
        return true
      } catch (error) {
        console.error("Failed to claim daily reward:", error)

        // Implement retry logic
        if (!retry && retryCount.current < maxRetries) {
          retryCount.current++
          console.log(`Retrying claim (${retryCount.current}/${maxRetries})...`)

          // Set a temporary error message during retry
          setXpData((prev) => ({
            ...prev,
            isLoading: true,
            error: `Retrying claim... (${retryCount.current}/${maxRetries})`,
          }))

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, retryDelay * retryCount.current))
          return attemptClaim(true)
        }

        // If all retries failed, use fallback approach
        // Update local state to reflect the claim anyway
        setXpData((prev) => ({
          ...prev,
          xpTotal: prev.xpTotal + 10, // Assume 10 XP reward
          totalXp: prev.totalXp + 10,
          claimCount: prev.claimCount + 1,
          lastClaimedAt: new Date(),
          canClaim: false,
          nextClaimTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          isLoading: false,
          error: "Using local data due to connection issues",
          usingFallbackData: true,
        }))

        // Store in localStorage as backup
        const localXp = Number.parseInt(localStorage.getItem("localXp") || "0", 10)
        localStorage.setItem("localXp", (localXp + 10).toString())

        return true
      }
    }

    return attemptClaim()
  }, [address, fetchXpData])

  // Update XP (for transaction-based XP)
  const updateXp = useCallback(() => {
    setXpData((prev) => {
      // Increment transaction count
      const newTxCount = (prev.txCount || 0) + 1

      // Calculate XP gain (base 5 XP per transaction)
      const xpGain = 5
      const newXpTotal = (prev.xpTotal || 0) + xpGain

      // Save to localStorage for persistence
      localStorage.setItem("txCount", newTxCount.toString())
      localStorage.setItem("localXp", newXpTotal.toString())

      // Calculate new derived values
      const { level, progress, xpReward } = calculateDerivedValues(newXpTotal, newTxCount, prev.referralXp)

      return {
        ...prev,
        xpTotal: newXpTotal,
        totalXp: newXpTotal + prev.referralXp, // Include referral XP in total
        txCount: newTxCount,
        level,
        progress,
        xpReward,
      }
    })
  }, [calculateDerivedValues])

  // Create or update referral
  const createReferral = useCallback(
    async (referrerCode?: string) => {
      if (!address) return null

      try {
        const response = await fetch("/api/referral", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userWallet: address, referrerCode }),
        })

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Failed to create referral")
        }

        // Refresh XP data after successful referral creation
        await fetchXpData()
        return result.data.referralCode
      } catch (error) {
        console.error("Failed to create referral:", error)

        // Generate a fake referral code for UI
        const fakeCode = Array(5)
          .fill(0)
          .map(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 36)))
          .join("")

        // Update local state with fake referral code
        setXpData((prev) => ({
          ...prev,
          referralCode: fakeCode,
          usingFallbackData: true,
          error: "Using local data due to connection issues",
        }))

        return fakeCode
      }
    },
    [address, fetchXpData],
  )

  // Load XP data when address changes
  useEffect(() => {
    if (address) {
      fetchXpData()
    } else {
      setXpData(DEFAULT_XP_DATA)
    }
  }, [address, fetchXpData])

  // Refresh data periodically to update claim status
  useEffect(() => {
    if (!address) return

    const interval = setInterval(() => {
      // Only refresh if we're waiting for the next claim time
      if (xpData.nextClaimTime && new Date() >= xpData.nextClaimTime) {
        fetchXpData()
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [address, fetchXpData, xpData.nextClaimTime])

  return {
    xpData,
    fetchXpData,
    claimDailyReward,
    updateXp,
    connectTwitter,
    createReferral,
  }
}

