"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Wallet, Check, Copy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWalletContext } from "@/contexts/wallet-context"
import { MONAD_CHAIN_ID } from "@/lib/constants"
import { useToast } from "@/components/ui/use-toast"

export function ConnectWalletButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const { address, chainId, isConnecting, error, isMetaMaskInstalled, connect, disconnect, switchNetwork } =
    useWalletContext()
  const { toast } = useToast()

  const handleConnect = async () => {
    if (address) return // Prevent reconnection if already connected

    try {
      await connect()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to connect:", error)
    }
  }

  const handleAddressClick = useCallback(async () => {
    if (!address) return

    try {
      await navigator.clipboard.writeText(address)
      setIsCopied(true)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })

      // Reset copy state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy address:", err)
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
      })
    }
  }, [address, toast])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isOnMonad = chainId === MONAD_CHAIN_ID

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className={`${
            address ? "bg-[#6266E4] hover:bg-[#6266E4]/90" : "bg-[#6266E4] hover:bg-[#6266E4]/90"
          } text-white font-semibold rounded-lg px-4 py-2 h-10 relative group`}
          onClick={(e) => {
            if (address) {
              e.preventDefault()
              handleAddressClick()
            }
          }}
        >
          {address ? (
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>{formatAddress(address)}</span>
              {isCopied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              {!isOnMonad && <span className="text-yellow-300">(Wrong Network)</span>}
            </div>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-[#E4E3E8] text-black border-gray-200">
        <DialogHeader>
          <DialogTitle>Connect your wallet</DialogTitle>
          <DialogDescription>Connect your wallet to use the Ancientmonad bridge</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="bg-red-100 border-red-200 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isMetaMaskInstalled ? (
          <div className="space-y-4 py-4">
            <p className="text-center text-gray-600">MetaMask is not installed. Please install MetaMask to continue.</p>
            <Button className="w-full" onClick={() => window.open("https://metamask.io/download/", "_blank")}>
              Install MetaMask
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {address && !isOnMonad ? (
              <div className="space-y-4">
                <p className="text-center text-gray-600">Please switch to Monad Testnet:</p>
                <Button
                  onClick={() => switchNetwork(MONAD_CHAIN_ID)}
                  className="w-full flex flex-col items-center justify-center h-24 bg-white hover:bg-gray-50"
                >
                  <span className="text-sm font-medium">Switch to Monad Testnet</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={isConnecting || !!address}
                className="w-full bg-[#6266E4] hover:bg-[#6266E4]/90 text-white"
              >
                {isConnecting ? "Connecting..." : address ? "Connected" : "Connect with MetaMask"}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

