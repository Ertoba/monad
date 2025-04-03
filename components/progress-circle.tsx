"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "./ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useWalletContext } from "@/contexts/wallet-context"
import { ethers } from "ethers"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Rocket } from "lucide-react"
import { useXpTracker } from "@/hooks/useXpTracker"
import { ConfettiCelebration } from "./confetti-celebration"

// Recipient addresses list
const recipientAddresses = [
  "0xc7d2a5f7ebfccbc5f08d33f3e5475fa9f1a85fa8",
  "0xe5351328caa8fe63d81957d005ec31776cc0a765",
  "0x44f61141cd96f2adab4be5c9ee791b9a126f0b56",
  "0x49b827f34804e447378c19af8a03d53c5eeb1d5a",
  "0x72cf7257d0c7402c7d37f26414e76348b54be898",
  "0x50fca5007cb8e7a4ed874ab50c3723b6941982ce",
  "0x7fcbeac047177247c61436467471f7c7970ac19a",
  "0x5e0e8e20f14f9a85525032d0e5e7a7f7b96e8fcc",
  "0xd06037651f2c558611ee8f4bdb7476abb261bfee",
  "0xdd52598e5589886e254d5bbb801506abb751316c",
  "0x6380758041aad20e49197d861a5c3279233dee35",
  "0xec14783e7cc0285468b623a5b063367692b876a1",
  "0x3109d08630b1450aadfe16bea93f0651e08aaa1f",
  "0x244d9ff23a89a8055dab9df1cb35772ffdd88c4d",
]

// Define cycle lengths
const CYCLE_LENGTHS = [3, 7, 15, 40, 70, 100]

// Neon pulse animation component with grayscale theme
const NeonPulse = ({ show, size }: { show: boolean; size: number }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(200, 200, 200, 0.2) 30%, rgba(150, 150, 150, 0) 60%)`,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: [0, 0.7, 0],
              scale: [0.9, 1.03, 1],
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ProgressCircle() {
  const { toast } = useToast()
  const { address, isMonadNetwork } = useWalletContext()
  const { xpData, updateXp } = useXpTracker()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [animatingReset, setAnimatingReset] = useState(false)
  const [displayProgress, setDisplayProgress] = useState(0)
  const [progressOffset, setProgressOffset] = useState(0)
  const [showNeonPulse, setShowNeonPulse] = useState(false)
  const progressRef = useRef<SVGCircleElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [lastUsedRecipient, setLastUsedRecipient] = useState<string>("")
  const prevTxCountRef = useRef(0)
  const [isMajorMilestone, setIsMajorMilestone] = useState(false)

  // Constants for the circle
  const size = 300
  const strokeWidth = 24
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  // Calculate cycle information based on total transaction count
  const cycleInfo = useMemo(() => {
    const totalTxCount = xpData.txCount || 0

    // Calculate total transactions for each cycle
    const cycleTotals: number[] = []
    let runningTotal = 0

    for (const cycleLength of CYCLE_LENGTHS) {
      runningTotal += cycleLength
      cycleTotals.push(runningTotal)
    }

    // Determine which cycle we're in
    let currentCycleIndex = 0
    let txInPreviousCycles = 0
    let adjustedTotalCount = totalTxCount

    // Handle cycle repetition
    if (totalTxCount >= cycleTotals[cycleTotals.length - 1]) {
      const fullCycleSetCount = Math.floor(totalTxCount / cycleTotals[cycleTotals.length - 1])
      adjustedTotalCount = totalTxCount - fullCycleSetCount * cycleTotals[cycleTotals.length - 1]
    }

    // Find current cycle
    for (let i = 0; i < cycleTotals.length; i++) {
      if (adjustedTotalCount <= cycleTotals[i]) {
        currentCycleIndex = i
        break
      }
      txInPreviousCycles = cycleTotals[i]
    }

    // Calculate transactions in current cycle
    const txInCurrentCycle = adjustedTotalCount - txInPreviousCycles
    const currentCycleLength = CYCLE_LENGTHS[currentCycleIndex]

    // Calculate progress percentage for current cycle
    const progressPercentage = (txInCurrentCycle / currentCycleLength) * 100

    // Calculate completed cycles (full sets of all cycles)
    const completedFullCycleSets = Math.floor(totalTxCount / cycleTotals[cycleTotals.length - 1])

    return {
      cycleIndex: currentCycleIndex,
      cycleName: `Cycle ${currentCycleIndex + 1}`,
      cycleLength: currentCycleLength,
      txInCurrentCycle,
      progressPercentage,
      totalTxCount,
      completedFullCycleSets,
      isLastTxInCycle: txInCurrentCycle === currentCycleLength && totalTxCount > 0,
    }
  }, [xpData.txCount])

  // Update progress offset with smoother transitions
  useEffect(() => {
    if (!animatingReset) {
      // Ensure we have valid numbers
      const safeProgress = isNaN(cycleInfo.progressPercentage) ? 0 : cycleInfo.progressPercentage
      const safeCircumference = isNaN(circumference) ? 0 : circumference

      // Calculate target offset - for a progress bar that starts at the top (12 o'clock position)
      // and only moves one end clockwise
      const targetOffset = safeCircumference - (safeProgress / 100) * safeCircumference

      // Set progress offset directly for more responsive updates
      setProgressOffset(targetOffset)

      // Ensure display progress is 0 when no transactions
      setDisplayProgress(cycleInfo.totalTxCount === 0 ? 0 : safeProgress)
    }
  }, [cycleInfo.progressPercentage, cycleInfo.totalTxCount, animatingReset, circumference])

  // Detect transaction count changes to trigger pulse animation and cycle completion
  useEffect(() => {
    if (xpData.txCount > prevTxCountRef.current) {
      // Transaction count increased, trigger pulse animation
      setShowNeonPulse(true)
      setTimeout(() => setShowNeonPulse(false), 800)

      // Check if this transaction completes a cycle
      if (cycleInfo.isLastTxInCycle) {
        console.log(
          `Cycle ${cycleInfo.cycleIndex + 1} completed! (${CYCLE_LENGTHS[cycleInfo.cycleIndex]} transactions)`,
        )

        // Determine if this is a major milestone (completing the longest cycle)
        const isMajor = cycleInfo.cycleIndex === CYCLE_LENGTHS.length - 1
        setIsMajorMilestone(isMajor)

        // Show confetti celebration
        setShowConfetti(true)

        // Play reverse animation for the progress circle
        setAnimatingReset(true)

        // First animate to full circle (if not already)
        setProgressOffset(0)
        setDisplayProgress(100)

        // After a short delay, animate back to empty with a reverse animation
        setTimeout(() => {
          // Animate back to empty
          setProgressOffset(circumference)
          setDisplayProgress(0)

          // After the reverse animation completes, reset the animating flag
          setTimeout(() => {
            setAnimatingReset(false)
          }, 800) // Slightly longer to ensure animation completes
        }, 600)
      }

      // Update reference
      prevTxCountRef.current = xpData.txCount
    }
  }, [xpData.txCount, cycleInfo, circumference])

  // Handle confetti animation completion
  const handleConfettiComplete = () => {
    setShowConfetti(false)
    setIsMajorMilestone(false)
  }

  // Transaction function
  async function sendMonadTransaction() {
    if (!window.ethereum) {
      setError("Please install MetaMask or another Web3 wallet!")
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another Web3 wallet!",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create provider and get signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()

      // Check network
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)

      if (chainId !== 10143) {
        // Monad Testnet
        await switchToMonadNetwork()
      }

      // Randomly select a recipient from the list
      const randomIndex = Math.floor(Math.random() * recipientAddresses.length)
      const selectedRecipient = recipientAddresses[randomIndex]

      // Store the last used recipient for debugging
      setLastUsedRecipient(selectedRecipient)

      // Transaction parameters
      const randomAmount = (0.001 + Math.random() * 0.009).toFixed(6) // Random amount between 0.001 and 0.01
      const txParams = {
        to: selectedRecipient,
        value: ethers.parseEther(randomAmount),
        gasLimit: BigInt(21000), // Minimum gas
      }

      console.log(`Sending transaction with ${randomAmount} MON to ${selectedRecipient}`)

      // Send transaction
      const tx = await signer.sendTransaction(txParams)
      console.log("Transaction sent:", tx.hash)

      // Wait for transaction to be confirmed
      const receipt = await tx.wait()
      console.log("Transaction confirmed:", receipt)

      // Reset the animatingReset flag to allow progress to update again
      setAnimatingReset(false)

      // Update XP locally
      updateXp()

      // Trigger neon pulse animation
      setShowNeonPulse(true)
      setTimeout(() => setShowNeonPulse(false), 600)
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message)

      // Handle user rejection separately
      if (err.code === 4001) {
        toast({
          title: "Transaction Cancelled",
          description: "You cancelled the transaction",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Transaction Failed",
          description: err.message || "An error occurred",
          variant: "destructive",
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  async function switchToMonadNetwork() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x279F" }], // 10143 in hex
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to the wallet
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x279F",
              chainName: "Monad Testnet",
              nativeCurrency: {
                name: "MON",
                symbol: "MON",
                decimals: 18,
              },
              rpcUrls: ["https://testnet-rpc.monad.xyz", "https://rpc.zerion.io/monad"],
              blockExplorerUrls: ["https://explorer.testnet.monad.xyz"],
            },
          ],
        })
      } else {
        throw switchError
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Full-screen confetti celebration - triggered at cycle completion */}
      <ConfettiCelebration
        show={showConfetti}
        duration={3500}
        particleCount={isMajorMilestone ? 350 : 250}
        onComplete={handleConfettiComplete}
        isMajorMilestone={isMajorMilestone}
      />

      <div className="relative w-[300px] h-[300px] flex items-center justify-center overflow-hidden">
        {/* Neon pulse overlay with grayscale theme */}
        <NeonPulse show={showNeonPulse} size={size} />

        {/* Progress Circle - Fixed at top position (12 o'clock) */}
        <svg
          ref={svgRef}
          width={size}
          height={size}
          className="progress-ring absolute"
          style={{
            transform: "rotate(-90deg)", // Fixed rotation to start at top (12 o'clock)
            zIndex: 5,
          }}
        >
          {/* Gradient definitions - updated to grayscale */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#A0A0A0" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>

            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Base circle (background) */}
          <circle
            className="text-gray-200 stroke-current"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            opacity="0.2"
          />

          {/* Progress circle with gradient and glow */}
          <circle
            ref={progressRef}
            stroke="url(#progressGradient)"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={progressOffset}
            opacity="0.9"
            filter="url(#neonGlow)"
            style={{
              transition: "stroke-dashoffset 0.8s ease-out",
            }}
            className="animate-pulse-subtle"
          />
        </svg>

        {/* Content - Centered with flexbox, no background overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          {useEffect(() => {
            // Check if progress has reached 100%
            if (displayProgress >= 99.5 && !animatingReset) {
              console.log("Progress circle completed 360 degrees!")

              // Show confetti celebration
              setShowConfetti(true)

              // Play reverse animation for the progress circle
              setAnimatingReset(true)

              // First ensure we're at full circle
              setProgressOffset(0)
              setDisplayProgress(100)

              // After a short delay, animate back to empty with a reverse animation
              setTimeout(() => {
                // Animate back to empty with a longer duration for visible reverse animation
                setProgressOffset(circumference)
                setDisplayProgress(0)

                // Keep the animatingReset flag true to prevent auto-progress until next transaction
                // It will be reset when the user confirms the next transaction
              }, 800)
            }
          }, [displayProgress, circumference, animatingReset])}

          <div className="flex flex-col items-center justify-center">
            <div className="text-[48px] font-bold leading-none mb-1">
              <span className="text-white">{displayProgress.toFixed(0)}%</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[16px] text-white/90 mb-2"
            >
              {cycleInfo.cycleName}
              {cycleInfo.completedFullCycleSets > 0 && (
                <span className="ml-2 text-sm text-gray-300">Set #{cycleInfo.completedFullCycleSets + 1}</span>
              )}
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative w-full">
              <Button
                variant="outline"
                onClick={sendMonadTransaction}
                disabled={isProcessing}
                className="rounded-full text-white hover:text-white hover:bg-transparent font-semibold px-8 py-2 border-none shadow-lg relative overflow-hidden w-full"
                style={{
                  background: "linear-gradient(90deg, #303030, #505050, #303030)",
                  backgroundSize: "200% 200%",
                  position: "relative",
                }}
              >
                {/* Button gradient overlay with animation - grayscale theme */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/30 to-white/20 animate-gradient-shift"></div>

                {/* Subtle glow effect */}
                <div
                  className="absolute inset-0 rounded-full opacity-70 animate-pulse-slow"
                  style={{
                    boxShadow: "0 0 15px 2px rgba(255, 255, 255, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2)",
                  }}
                />

                <div className="relative z-10 flex items-center justify-center">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-sm">Processing...</span>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0.9 }}
                        animate={{
                          scale: [0.9, 1.05, 0.9],
                          opacity: [0.9, 1, 0.9],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                        className="relative mr-2"
                      >
                        <Rocket className="h-4 w-4 text-white" />
                        <div className="absolute inset-0 bg-white/30 blur-sm rounded-full"></div>
                      </motion.div>
                      <span className="text-sm font-medium tracking-wide">Boost TXp</span>
                    </>
                  )}
                </div>
              </Button>
            </motion.div>

            {/* Transaction counter - updated to show current cycle progress */}
            <div className="mt-3 text-xs text-white/70">
              {cycleInfo.txInCurrentCycle} / {cycleInfo.cycleLength} Transactions
              {cycleInfo.totalTxCount > 0 && (
                <span className="ml-2 text-xs text-gray-300">({cycleInfo.totalTxCount} total)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debug info - last used recipient */}
      {lastUsedRecipient && (
        <div className="mt-2 text-xs text-gray-400 truncate">
          Last recipient: {lastUsedRecipient.substring(0, 6)}...{lastUsedRecipient.substring(38)}
        </div>
      )}
    </div>
  )
}

