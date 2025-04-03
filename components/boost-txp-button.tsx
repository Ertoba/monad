"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Rocket } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useWalletContext } from "@/contexts/wallet-context"
import { ethers } from "ethers"
import { useXpTracker } from "@/hooks/useXpTracker"

// Add the recipient addresses list at the top of the file, after the imports
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

// Floating +1 Text Component that appears in random locations
const FloatingPlusOne = ({ index, xpAmount = 1 }: { index: number; xpAmount?: number }) => {
  // Generate random position with slightly reduced movement range
  const xPos = 30 + Math.random() * 40 // More centered horizontal position
  const yPos = 30 + Math.random() * 40 // More centered vertical position
  const scale = 0.6 + Math.random() * 0.4 // Smaller scale between 0.6-1.0
  const rotation = -10 + Math.random() * 20 // Reduced rotation range
  const delay = Math.random() * 0.5 // Shorter random delay

  // Random colors from the brand palette
  const colors = ["from-[#6266E4] to-[#ff6b81]", "from-[#ff6b81] to-[#6266E4]", "from-[#200052] to-[#6266E4]"]
  const colorClass = colors[Math.floor(Math.random() * colors.length)]

  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{ left: `${xPos}%`, top: `${yPos}%` }}
      initial={{ scale: 0.5, opacity: 0, y: 0, rotate: rotation }}
      animate={{
        scale: [0.5, scale, scale * 0.8],
        opacity: [0, 1, 0],
        y: [0, -40 - Math.random() * 20], // Reduced movement range
        rotate: [rotation, rotation + (Math.random() > 0.5 ? 5 : -5)],
      }}
      transition={{
        duration: 1.5 + Math.random(), // Shorter duration
        delay: delay,
        ease: "easeOut",
        times: [0, 0.3, 1],
      }}
    >
      <div
        className={`text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${colorClass} drop-shadow-[0_0_8px_rgba(98,102,228,0.8)]`}
      >
        +{xpAmount} XP
      </div>
    </motion.div>
  )
}

// Modify the Firework component to be smaller
const Firework = ({ x, y, color, size = 0.7 }: { x: number; y: number; color: string; size?: number }) => {
  // Generate fewer particles for better performance
  const particleCount = Math.floor(10 + Math.random() * 8) // Reduced from 15-25 to 10-18 particles
  const particles = Array.from({ length: particleCount }).map((_, i) => {
    const angle = (i / particleCount) * Math.PI * 2
    const distance = (20 + Math.random() * 50) * size // Reduced distance
    return {
      id: i,
      angle,
      distance,
      delay: Math.random() * 0.2,
      size: (0.8 + Math.random() * 0.8) * size, // Smaller particles
    }
  })

  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute h-${Math.ceil(particle.size * 2)} w-${Math.ceil(particle.size * 2)} rounded-full ${color}`}
          initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
          animate={{
            scale: [0, particle.size, 0],
            x: [0, Math.cos(particle.angle) * particle.distance],
            y: [0, Math.sin(particle.angle) * particle.distance],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1 + Math.random() * 0.3, // Shorter duration
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}
      <motion.div
        className={`absolute h-${Math.ceil(5 * size)} w-${Math.ceil(5 * size)} rounded-full ${color} blur-md -translate-x-1/2 -translate-y-1/2`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.5 * size, 0],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  )
}

// Optimized Star component
const Star = ({
  delay,
  duration,
  color,
  x,
  y,
  size,
}: {
  delay: number
  duration: number
  color: string
  x: number
  y: number
  size: number
}) => (
  <motion.div
    className="absolute"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      y: [y, y - 15 - Math.random() * 15], // Reduced movement range
      rotate: [0, 180],
    }}
    transition={{
      duration,
      delay,
      ease: "easeOut",
    }}
  >
    <div className={`h-${size} w-${size} ${color} rounded-full blur-[1px]`} />
  </motion.div>
)

// Glowing Text Effect
const GlowingText = ({ text, delay }: { text: string; delay: number }) => {
  const xPos = Math.random() * 100
  const yPos = Math.random() * 100

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${xPos}%`, top: `${yPos}%` }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.8] }}
      transition={{ delay, duration: 2, ease: "easeOut" }}
    >
      <div className="text-2xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">{text}</div>
    </motion.div>
  )
}

// Update the CelebrationAnimation component to use fewer animations and support dynamic XP
const CelebrationAnimation = ({ show, xpGained = 1 }: { show: boolean; xpGained?: number }) => {
  // Use useRef to ensure we generate random positions only once per animation
  const animationData = useRef({
    stars: Array.from({ length: 40 }).map((_, i) => ({
      // Reduced from 70 to 40 stars
      id: i,
      delay: Math.random() * 1.5, // Slightly reduced delay
      duration: 0.8 + Math.random() * 1.2, // Shorter duration
      color: ["bg-yellow-300", "bg-blue-400", "bg-purple-400", "bg-pink-400"][Math.floor(Math.random() * 4)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.floor(Math.random() * 2) + 1, // Smaller stars
    })),
    fireworks: [
      // Reduced from 7 to 5 fireworks
      { id: 1, x: 30 + Math.random() * 15, y: 30 + Math.random() * 15, delay: 0, color: "bg-pink-500", size: 0.8 },
      { id: 2, x: 50 + Math.random() * 15, y: 20 + Math.random() * 15, delay: 0.3, color: "bg-blue-500", size: 0.7 },
      { id: 3, x: 70 + Math.random() * 15, y: 40 + Math.random() * 15, delay: 0.7, color: "bg-yellow-500", size: 0.9 },
      { id: 4, x: 40 + Math.random() * 15, y: 50 + Math.random() * 15, delay: 0.5, color: "bg-red-500", size: 0.7 },
      { id: 5, x: 60 + Math.random() * 15, y: 30 + Math.random() * 15, delay: 0.2, color: "bg-purple-500", size: 0.8 },
    ],
    plusOnes: Array.from({ length: 4 }).map((_, i) => ({
      // Reduced from 6 to 4
      id: i,
    })),
    celebrationTexts:
      xpGained >= 25
        ? [
            // Only show text for higher XP gains
            { id: 1, text: "Level Up!", delay: 0.5 },
            { id: 2, text: "Amazing!", delay: 1.0 },
          ]
        : [],
  }).current

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Dynamic XP gain text */}
          {animationData.plusOnes.map((plusOne) => (
            <FloatingPlusOne key={plusOne.id} index={plusOne.id} xpAmount={xpGained} />
          ))}

          {/* Celebration Text Phrases - only for higher levels */}
          {animationData.celebrationTexts.map((text) => (
            <GlowingText key={text.id} text={text.text} delay={text.delay} />
          ))}

          {/* Stars and Fireworks */}
          <motion.div
            className="fixed inset-0 pointer-events-none z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Background glow effect - simplified */}
            <motion.div
              className="absolute inset-0 bg-gradient-radial from-[#6266E4]/5 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 2, times: [0, 0.3, 1] }}
            />

            {/* Stars - reduced quantity */}
            {animationData.stars.slice(0, 20).map((star) => (
              <Star
                key={star.id}
                delay={star.delay}
                duration={star.duration}
                color={star.color}
                x={star.x}
                y={star.y}
                size={star.size}
              />
            ))}

            {animationData.stars.slice(20).map((star) => (
              <Star
                key={star.id}
                delay={star.delay + 0.4}
                duration={star.duration}
                color={star.color}
                x={star.x}
                y={star.y}
                size={star.size}
              />
            ))}

            {/* Fireworks - fewer and smaller */}
            {animationData.fireworks.map((firework) => (
              <motion.div
                key={firework.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: firework.delay }}
              >
                <Firework x={firework.x} y={firework.y} color={firework.color} size={firework.size} />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Update the main BoostTXpButton component to use the XP tracker
export function BoostTXpButton() {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { address, isMonadNetwork } = useWalletContext()

  // Store the selected recipient address for display
  const [selectedRecipient, setSelectedRecipient] = useState<string>("")

  // Use the XP tracker hook
  const { xpData, fetchXpData, updateXp } = useXpTracker()

  // Completely rewritten transaction function
  async function sendMonadTransaction() {
    console.warn("🚨 EXECUTING NEW VERSION OF sendMonadTransaction FUNCTION 🚨")

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

      // Generate random amount between 0.0001 and 0.005 MON
      const randomAmount = (0.0001 + Math.random() * (0.005 - 0.0001)).toFixed(6)

      // COMPLETELY DIFFERENT APPROACH TO SELECT RECIPIENT
      // Force a specific recipient for testing - using the first address in the list
      // This is just to verify if our code is being executed at all
      const firstRecipient = recipientAddresses[0] // Always use the first address for now

      console.warn("⚠️ ADDRESSES LIST:", recipientAddresses)
      console.warn("⚠️ SELECTED FIRST ADDRESS:", firstRecipient)

      // Store the selected recipient for display in the UI
      setSelectedRecipient(firstRecipient)

      // Log which address was selected for debugging
      console.warn(`⚠️ SENDING ${randomAmount} MON to FIRST ADDRESS: ${firstRecipient}`)

      // Transaction parameters with first recipient and random amount
      const txParams = {
        to: firstRecipient, // Use the first address from the list
        value: ethers.parseEther(randomAmount),
        gasLimit: BigInt(21000), // Minimum gas
      }

      console.warn("⚠️ TRANSACTION PARAMS:", txParams)

      // Send transaction
      const tx = await signer.sendTransaction(txParams)
      console.log("Transaction sent:", tx.hash)

      // Wait for transaction to be mined
      const receipt = await tx.wait()
      console.log("Transaction confirmed:", receipt)

      // Update XP locally
      updateXp()

      // Get the XP reward for toast message
      const xpReward = xpData.xpReward

      toast({
        title: "TXp Boosted!",
        description: `You've sent ${randomAmount} MON to ${firstRecipient} and received ${xpReward} XP!`,
        className: "bg-[#1C1C1C] border-gray-800 text-white",
      })

      // Show celebration animation with the correct XP amount
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 4000) // Reduced from 5000ms to 4000ms

      return xpReward
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

    return 0
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
              rpcUrls: [
                "https://testnet-rpc.monad.xyz",
                "https://rpc.zerion.io/monad", // Added for Zerion compatibility
              ],
              blockExplorerUrls: ["https://explorer.testnet.monad.xyz"],
            },
          ],
        })
      } else {
        throw switchError
      }
    }
  }

  // Check and switch network before sending transaction
  async function checkAndSwitchNetwork() {
    if (!window.ethereum) return false

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)

      if (chainId !== 10143) {
        try {
          await switchToMonadNetwork()
        } catch (err) {
          console.error("Network switch failed:", err)
          setError("ქსელის გადართვა ვერ მოხერხდა. გთხოვთ, ხელით გადაერთეთ Monad Testnet-ზე.")
          toast({
            variant: "destructive",
            title: "Network Switch Failed",
            description: "Please manually switch to Monad Testnet",
          })
          return false
        }
      }
      return true
    } catch (err) {
      console.error("Network check failed:", err)
      return false
    }
  }

  // Handle button click with network check
  async function handleButtonClick() {
    console.warn("🔴 BOOST TXP BUTTON CLICKED - NEW VERSION 🔴")
    const isNetworkCorrect = await checkAndSwitchNetwork()
    if (isNetworkCorrect) {
      await sendMonadTransaction()
    }
  }

  // Render the full-screen celebration animation
  useEffect(() => {
    // Clean up the celebration animation if component unmounts
    return () => {
      if (showCelebration) {
        setShowCelebration(false)
      }
    }
  }, [showCelebration])

  // Refresh XP data when wallet connects
  useEffect(() => {
    if (address) {
      fetchXpData()
    }
  }, [address, fetchXpData])

  // Log on component mount to verify the new version is loaded
  useEffect(() => {
    console.warn("🔵 BOOST TXP BUTTON COMPONENT MOUNTED - NEW VERSION 🔵")
    console.warn("🔵 RECIPIENT ADDRESSES:", recipientAddresses)
  }, [])

  return (
    <div className="w-full max-w-sm mx-auto mb-6 relative">
      {/* Full-screen celebration animation with dynamic XP */}
      <CelebrationAnimation show={showCelebration} xpGained={xpData.xpReward} />

      <div className="bg-[#F5F5F5]/80 backdrop-blur-sm rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.06)] overflow-hidden p-4 border border-white/20 relative">
        {/* Debug info - remove in production */}
        <div className="mb-2 text-xs text-red-500 bg-red-100 p-2 rounded">
          <div>Debug: Using updated code (v2)</div>
          {selectedRecipient && <div>Last recipient: {selectedRecipient}</div>}
        </div>

        <motion.button
          onClick={handleButtonClick}
          whileHover={{ scale: isProcessing ? 1 : 1.02 }}
          className="w-full h-10 rounded-lg relative overflow-hidden group"
          disabled={isProcessing}
        >
          {/* Gradient background with brand colors */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#200052] via-[#6266E4] to-[#ff6b81] bg-size-200 animate-gradient-shift"></div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

          {/* Button content */}
          <div className="relative z-10 flex items-center justify-center gap-3 text-white font-medium">
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {/* Animated rocket icon with reduced movement */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.9 }}
                  animate={{
                    scale: [0.9, 1.05, 0.9],
                    opacity: [0.9, 1, 0.9],
                    rotate: [0, 3, -3, 0], // Reduced rotation range
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <Rocket className="h-5 w-5 text-yellow-300" />
                  <div className="absolute inset-0 bg-yellow-300/30 blur-sm rounded-full"></div>
                </motion.div>

                <span className="text-base tracking-wide">Boost TXp</span>
              </>
            )}
          </div>
        </motion.button>

        {/* Error message */}
        {error && <div className="mt-2 text-sm text-red-500 text-center">{error}</div>}

        {/* XP Data UI */}
        <div className="mt-4 bg-[#252525] rounded-lg p-3 border border-gray-700/20">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-[#6266E4] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                {xpData.level || 1}
              </div>
              <span className="text-[#E4E3E8] text-sm font-medium">Level {xpData.level || 1}</span>
            </div>
            <div className="text-[#6266E4] text-sm font-bold">{xpData.totalXp || 0} XP</div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6266E4] to-[#ff6b81] rounded-full transition-all duration-500"
              style={{ width: `${isNaN(xpData.progress) ? 0 : xpData.progress}%` }}
            />
          </div>

          {/* Transaction counter */}
          <div className="flex justify-between mt-2">
            <span className="text-gray-400 text-xs">
              {xpData.txCount || 0} TX{(xpData.txCount || 0) !== 1 ? "s" : ""}
            </span>
            <span className="text-gray-400 text-xs">Next reward: +{xpData.xpReward || 10} XP</span>
          </div>

          {/* Loading or error state */}
          {xpData.isLoading && (
            <div className="mt-2 text-center text-xs text-gray-400">
              <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
              Loading XP data...
            </div>
          )}

          {xpData.error && !xpData.isLoading && (
            <div className="mt-2 text-center text-xs text-amber-400">
              <span>Using local data</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

