"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ethers } from "ethers"
import { useWalletContext } from "@/contexts/wallet-context"
import { useToast } from "@/components/ui/use-toast"
import { useXpTracker } from "@/hooks/useXpTracker"

// მისამართების სია, საიდანაც შემთხვევით აირჩევა მიმღები
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

// Update the PlusOneAnimation component to show the transaction amount
const PlusOneAnimation = ({ id, amount }: { id: number; amount?: string }) => {
  // Generate random position
  const xPos = 20 + Math.random() * 60 // 20-80% of container width
  const yPos = 20 + Math.random() * 60 // 20-80% of container height

  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{ left: `${xPos}%`, top: `${yPos}%` }}
      initial={{ scale: 0.5, opacity: 0, y: 0 }}
      animate={{
        scale: [0.5, 1.2, 1],
        opacity: [0, 1, 0],
        y: [0, -30],
      }}
      transition={{
        duration: 1,
        ease: "easeOut",
      }}
    >
      <div className="text-xl font-bold text-white bg-clip-text drop-shadow-[0_0_8px_rgba(98,102,228,0.8)]">
        +1 TX {amount && <span className="text-sm">({amount} MON)</span>}
      </div>
    </motion.div>
  )
}

// Ripple effect component
const Ripple = ({ x, y, size, onComplete }: { x: number; y: number; size: number; onComplete: () => void }) => {
  return (
    <motion.div
      className="absolute rounded-full bg-white/30"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
      }}
      initial={{ scale: 0, opacity: 0.8 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onAnimationComplete={onComplete}
    />
  )
}

export function TapTapButton() {
  const { toast } = useToast()
  const { address, isMonadNetwork, switchToMonad } = useWalletContext()
  const { updateXp } = useXpTracker()
  const [isProcessing, setIsProcessing] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  // Update the state to track transaction amounts
  const [animations, setAnimations] = useState<Array<{ id: number; amount?: string }>>([])
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([])
  const buttonRef = useRef<HTMLDivElement>(null)
  const transactionQueue = useRef<number>(0)
  const processingRef = useRef<boolean>(false)
  const animationIdCounter = useRef<number>(0)
  const rippleIdCounter = useRef<number>(0)
  // Add a transaction status indicator to show the user what's happening
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  // ბოლოს გამოყენებული მისამართის ჩვენება დებაგისთვის
  const [lastUsedRecipient, setLastUsedRecipient] = useState<string>("")

  // Update the sendMicroTransaction function to accept an amount parameter
  const sendMicroTransaction = useCallback(async (amount: string) => {
    if (!window.ethereum) {
      throw new Error("No wallet provider detected")
    }

    try {
      // Create provider and get signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // შემთხვევით ვირჩევთ მისამართს სიიდან
      const randomIndex = Math.floor(Math.random() * recipientAddresses.length)
      const selectedRecipient = recipientAddresses[randomIndex]

      // შევინახოთ ბოლოს გამოყენებული მისამართი დებაგისთვის
      setLastUsedRecipient(selectedRecipient)

      console.log(`Sending transaction with ${amount} MON to ${selectedRecipient}`)

      // Transaction parameters with specified amount
      const txParams = {
        to: selectedRecipient,
        value: ethers.parseEther(amount),
        gasLimit: BigInt(21000), // Minimum gas
      }

      // Send transaction
      const tx = await signer.sendTransaction(txParams)
      console.log("Transaction sent:", tx.hash)

      // Wait for transaction to be mined (but don't block UI)
      tx.wait()
        .then((receipt) => {
          console.log("Transaction confirmed:", receipt)
        })
        .catch((error) => {
          console.error("Transaction failed after sending:", error)
        })

      return tx.hash
    } catch (error) {
      console.error("Error sending transaction:", error)
      throw error
    }
  }, [])

  // Update the processQueue function to pass the transaction amount to the animation
  const processQueue = useCallback(async () => {
    // If already processing or queue is empty, return
    if (processingRef.current || transactionQueue.current <= 0) return

    // Set processing flag to prevent concurrent processing
    processingRef.current = true
    setTransactionStatus("processing")

    try {
      // Generate random amount between 0.001 and 0.01 MON
      const randomAmount = (0.001 + Math.random() * 0.009).toFixed(6)

      // Send transaction with random amount
      const txHash = await sendMicroTransaction(randomAmount)

      // Decrement queue counter
      transactionQueue.current -= 1

      // Update status
      setTransactionStatus("success")

      // Add animation with amount
      const newAnimationId = animationIdCounter.current++
      setAnimations((prev) => [...prev, { id: newAnimationId, amount: randomAmount }])

      // Remove animation after it completes
      setTimeout(() => {
        setAnimations((prev) => prev.filter((anim) => anim.id !== newAnimationId))
      }, 1000)

      // Update tap count
      setTapCount((prev) => prev + 1)

      // Update XP with error handling
      try {
        updateXp()
      } catch (error) {
        console.error("Error updating XP:", error)
      }

      console.log(
        `Transaction ${txHash} processed with ${randomAmount} MON to ${lastUsedRecipient}. Remaining in queue: ${transactionQueue.current}`,
      )
    } catch (error) {
      console.error("Transaction failed:", error)
      setTransactionStatus("error")

      // Show error toast only for non-user-rejected errors
      if (!(error instanceof Error && error.message.includes("user rejected"))) {
        toast({
          title: "Transaction Failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        })
      }
    } finally {
      // Reset processing flag
      processingRef.current = false

      // Reset status after a short delay
      setTimeout(() => {
        setTransactionStatus("idle")
      }, 500)

      // Process next item in queue if any
      if (transactionQueue.current > 0) {
        // Use setTimeout to prevent call stack issues with large queues
        setTimeout(() => {
          processQueue()
        }, 50)
      }
    }
  }, [toast, updateXp, sendMicroTransaction, lastUsedRecipient])

  // Optimize the queueTransaction function
  const queueTransaction = useCallback(() => {
    // Increment queue counter
    transactionQueue.current += 1

    // Start processing if not already processing
    if (!processingRef.current) {
      processQueue()
    }

    // Provide immediate feedback regardless of transaction status
    const feedbackRippleId = rippleIdCounter.current++
    setRipples((prev) => [
      ...prev,
      {
        id: feedbackRippleId,
        x: buttonRef.current ? buttonRef.current.clientWidth / 2 : 50,
        y: buttonRef.current ? buttonRef.current.clientHeight / 2 : 50,
        size: buttonRef.current ? Math.max(buttonRef.current.clientWidth, buttonRef.current.clientHeight) * 0.5 : 50,
      },
    ])
  }, [processQueue])

  // Enhance the handleTap function to be more responsive
  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Prevent default behavior to avoid any browser delays
      e.preventDefault()

      if (!address) {
        toast({
          title: "Connect Wallet",
          description: "Please connect your wallet to use the Tap-Tap button",
          variant: "destructive",
        })
        return
      }

      if (!isMonadNetwork) {
        switchToMonad().catch(console.error)
        toast({
          title: "Wrong Network",
          description: "Please switch to Monad Testnet to continue",
          variant: "destructive",
        })
        return
      }

      // Create ripple effect at the exact tap position
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const size = Math.max(rect.width, rect.height) * 0.5

        const newRippleId = rippleIdCounter.current++
        setRipples((prev) => [...prev, { id: newRippleId, x, y, size }])
      }

      // Queue transaction - this is now decoupled from the UI feedback
      queueTransaction()

      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
    },
    [address, isMonadNetwork, queueTransaction, switchToMonad, toast],
  )

  // Remove completed ripples
  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((ripple) => ripple.id !== id))
  }, [])

  // Clean up any pending transactions on unmount
  useEffect(() => {
    return () => {
      transactionQueue.current = 0
      processingRef.current = false
    }
  }, [])

  return (
    <div className="relative">
      {/* Animations */}
      <AnimatePresence>
        {/* Update the animations rendering in the return statement */}
        {animations.map((anim) => (
          <PlusOneAnimation key={anim.id} id={anim.id} amount={anim.amount} />
        ))}
      </AnimatePresence>

      {/* Button */}
      <motion.div
        ref={buttonRef}
        className={`relative w-40 h-40 rounded-full bg-gradient-to-br from-[#6266E4] to-[#4A4FCF] shadow-[0_0_30px_rgba(98,102,228,0.5)] flex items-center justify-center cursor-pointer overflow-hidden ${
          transactionStatus === "processing" ? "animate-pulse" : ""
        }`}
        whileTap={{ scale: 0.95 }}
        onClick={handleTap}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <Ripple
            key={ripple.id}
            x={ripple.x}
            y={ripple.y}
            size={ripple.size}
            onComplete={() => removeRipple(ripple.id)}
          />
        ))}

        {/* Inner content */}
        <div className="flex flex-col items-center justify-center z-10">
          <span className="text-white text-2xl font-bold mb-1">TAP</span>
          <div className="text-white/80 text-sm">{tapCount} taps</div>

          {/* Status indicator */}
          {transactionStatus === "processing" && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="bg-white/20 rounded-full px-3 py-1 text-xs animate-pulse">Processing...</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Transaction queue indicator */}
      {transactionQueue.current > 0 && (
        <div className="absolute -top-2 -right-2 bg-[#6266E4] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {transactionQueue.current}
        </div>
      )}

      {/* დებაგისთვის ბოლოს გამოყენებული მისამართის ჩვენება */}
      {lastUsedRecipient && (
        <div className="mt-2 text-xs text-gray-400 truncate">
          Last recipient: {lastUsedRecipient.substring(0, 6)}...{lastUsedRecipient.substring(38)}
        </div>
      )}
    </div>
  )
}

