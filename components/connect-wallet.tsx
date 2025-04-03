"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Wallet } from "lucide-react"

export function ConnectWallet() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const connectWallet = async (walletType: string) => {
    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress = "0x" + Math.random().toString(16).slice(2, 12)
      setWalletAddress(mockAddress)
      setIsConnected(true)
      setIsDialogOpen(false)
    }, 1000)
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress("")
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className={isConnected ? "bg-amber-600 hover:bg-amber-700" : "bg-amber-500 hover:bg-amber-600"}
          onClick={() => (isConnected ? disconnectWallet() : setIsDialogOpen(true))}
        >
          {isConnected ? (
            <span className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4)}
            </span>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle>Connect your wallet</DialogTitle>
          <DialogDescription>Connect your wallet to use the Ancientmonad bridge</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 hover:bg-gray-800 hover:text-amber-400 border-gray-700"
            onClick={() => connectWallet("metamask")}
          >
            <div className="h-10 w-10 rounded-full bg-orange-500 mb-2"></div>
            <span>MetaMask</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 hover:bg-gray-800 hover:text-amber-400 border-gray-700"
            onClick={() => connectWallet("walletconnect")}
          >
            <div className="h-10 w-10 rounded-full bg-blue-500 mb-2"></div>
            <span>WalletConnect</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 hover:bg-gray-800 hover:text-amber-400 border-gray-700"
            onClick={() => connectWallet("coinbase")}
          >
            <div className="h-10 w-10 rounded-full bg-blue-700 mb-2"></div>
            <span>Coinbase</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 hover:bg-gray-800 hover:text-amber-400 border-gray-700"
            onClick={() => connectWallet("trustwallet")}
          >
            <div className="h-10 w-10 rounded-full bg-green-600 mb-2"></div>
            <span>Trust Wallet</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

