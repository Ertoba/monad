"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Rocket, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ethers } from "ethers"

// Define a completely different list of recipient addresses
const RECIPIENT_ADDRESSES = [
  "0xc7d2a5f7ebfccbc5f08d33f3e5475fa9f1a85fa8",
  "0xe5351328caa8fe63d81957d005ec31776cc0a765",
  "0x44f61141cd96f2adab4be5c9ee791b9a126f0b56",
  "0x49b827f34804e447378c19af8a03d53c5eeb1d5a",
  "0x72cf7257d0c7402c7d37f26414e76348b54be898",
]

export function NewTxpButton() {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastRecipient, setLastRecipient] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Function to send a transaction using a completely different approach
  async function sendTransaction() {
    console.warn("🔴 NEW-TXP-BUTTON: Starting transaction function")

    if (!window.ethereum) {
      setError("MetaMask not installed")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Use a different method to get the provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()

      // Log the signer address
      const signerAddress = await signer.getAddress()
      console.warn("🔴 NEW-TXP-BUTTON: Signer address:", signerAddress)

      // Check if we're on Monad network
      const network = await provider.getNetwork()
      console.warn("🔴 NEW-TXP-BUTTON: Current network:", network.name, network.chainId)

      // Select a recipient - use the first one for testing
      const recipient = RECIPIENT_ADDRESSES[0]
      console.warn("🔴 NEW-TXP-BUTTON: Selected recipient:", recipient)

      // Store for display
      setLastRecipient(recipient)

      // Create a minimal transaction
      const tx = {
        to: recipient,
        value: ethers.parseEther("0.0001"),
        gasLimit: 21000n,
      }

      console.warn(
        "🔴 NEW-TXP-BUTTON: Transaction object:",
        JSON.stringify(tx, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
      )

      // Send the transaction
      const txResponse = await signer.sendTransaction(tx)
      console.warn("🔴 NEW-TXP-BUTTON: Transaction sent:", txResponse.hash)

      // Wait for confirmation
      const receipt = await txResponse.wait()
      console.warn("🔴 NEW-TXP-BUTTON: Transaction confirmed:", receipt?.hash)

      toast({
        title: "Transaction Successful",
        description: `Sent 0.0001 MON to ${recipient.substring(0, 6)}...${recipient.substring(38)}`,
      })
    } catch (err: any) {
      console.error("🔴 NEW-TXP-BUTTON: Error:", err)
      setError(err.message || "Transaction failed")

      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: err.message || "Unknown error",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto p-4 bg-red-50 border border-red-200 rounded-xl">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-red-600">New TXp Button (Test)</h3>
        <p className="text-sm text-red-500">This is a completely new component for testing</p>
      </div>

      {lastRecipient && (
        <div className="mb-4 p-2 bg-white rounded border border-red-200 text-xs">
          <div className="font-bold">Last recipient:</div>
          <div className="break-all">{lastRecipient}</div>
        </div>
      )}

      <Button
        onClick={sendTransaction}
        disabled={isProcessing}
        className="w-full bg-red-500 hover:bg-red-600 text-white"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Rocket className="mr-2 h-4 w-4" />
            Send Test Transaction
          </>
        )}
      </Button>

      {error && <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700">{error}</div>}

      <div className="mt-4 text-xs text-red-500">
        <p>Debug info:</p>
        <ul className="list-disc pl-5">
          <li>Component: new-txp-button.tsx</li>
          <li>First recipient: {RECIPIENT_ADDRESSES[0]}</li>
          <li>Check console for detailed logs</li>
        </ul>
      </div>
    </div>
  )
}

