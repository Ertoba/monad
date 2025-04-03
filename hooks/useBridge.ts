"use client"

import { useState, useCallback } from "react"
import { ethers } from "ethers"
import { BRIDGE_ABI, BRIDGE_CONTRACT } from "@/lib/constants"

export function useBridge() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bridge = useCallback(async (amount: string, sourceChainId: string) => {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed")
    }

    setIsProcessing(true)
    setError(null)

    console.log("Starting bridge transaction")
    console.log("Amount:", amount)
    console.log("Source Chain ID:", sourceChainId)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(BRIDGE_CONTRACT, BRIDGE_ABI, signer)

      // Convert amount to Wei
      const amountWei = ethers.parseEther(amount)
      console.log("Amount in Wei:", amountWei.toString())

      // Convert chain ID from hex to decimal for the contract call
      const chainIdDecimal = Number.parseInt(sourceChainId, 16)
      console.log("Chain ID in decimal:", chainIdDecimal)

      // Estimate gas before sending transaction
      const gasEstimate = await contract.bridge.estimateGas(chainIdDecimal, {
        value: amountWei,
      })

      console.log("Estimated gas:", gasEstimate.toString())

      // Add 20% buffer to gas estimate
      const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100)

      const tx = await contract.bridge(chainIdDecimal, {
        value: amountWei,
        gasLimit,
      })

      console.log("Transaction sent:", tx.hash)

      const receipt = await tx.wait()
      console.log("Transaction confirmed:", receipt)

      setIsProcessing(false)
      return receipt.hash
    } catch (error: any) {
      console.error("Bridge error:", error)
      setIsProcessing(false)

      // Handle specific error cases
      if (error.code === "INSUFFICIENT_FUNDS") {
        throw new Error("Insufficient funds for transaction")
      } else if (error.code === "USER_REJECTED") {
        throw new Error("Transaction rejected by user")
      } else if (error.code === "NETWORK_ERROR") {
        throw new Error("Network error. Please check your connection")
      } else {
        throw new Error(error.message || "Bridge transaction failed")
      }
    }
  }, [])

  return {
    bridge,
    isProcessing,
    error,
  }
}

