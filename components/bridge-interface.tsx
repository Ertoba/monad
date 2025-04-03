"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowDownUp } from "lucide-react"
import { ChainSelector } from "@/components/chain-selector"
import { TokenSelector } from "@/components/token-selector"
import { chains, tokens } from "@/lib/data"
import { useBridge } from "@/hooks/useBridge"
import { useWalletContext } from "@/contexts/wallet-context"
import { useToast } from "@/components/ui/use-toast"
import { useTokenBalance } from "@/hooks/useTokenBalance"
import { MONAD_CHAIN_ID } from "@/lib/constants"
import { DevelopmentOverlay } from "@/components/development-overlay"

export default function BridgeInterface() {
  const sourceChains = chains.filter((chain) => chain.isSource)
  const destinationChains = chains.filter((chain) => chain.isDestination)

  const [sourceChain, setSourceChain] = useState(sourceChains[0])
  const [destinationChain, setDestinationChain] = useState(destinationChains[0])
  const [selectedToken, setSelectedToken] = useState(tokens[0])
  const [amount, setAmount] = useState("")
  const [receivedAmount, setReceivedAmount] = useState("")
  const [isBridgeOpen, setIsBridgeOpen] = useState(false)

  const { address, chainId, isMetaMaskInstalled, connect, switchNetwork } = useWalletContext()
  const { balances, isLoading, refreshBalances } = useTokenBalance(address, chainId)
  const { toast } = useToast()
  const { isProcessing, bridge } = useBridge()

  // Conversion rate: 1 ETH = 6 MON
  const CONVERSION_RATE = 6

  useEffect(() => {
    if (amount && !isNaN(Number(amount))) {
      const converted = Number(amount) * CONVERSION_RATE
      setReceivedAmount(converted.toFixed(6))
      console.log(`Converting ${amount} ETH to ${converted} MON`)
    } else {
      setReceivedAmount("")
    }
  }, [amount])

  const handleBridge = async () => {
    if (!address || !amount || isNaN(Number(amount))) return

    try {
      // Check if user is on the correct network for the source chain
      const requiredChainId = `0x${sourceChain.id.toString(16)}`
      if (chainId !== requiredChainId) {
        console.log(`Switching network from ${chainId} to ${requiredChainId}`)
        await switchNetwork(requiredChainId)
      }

      const chainIdHex = `0x${sourceChain.id.toString(16)}`
      console.log(`Initiating bridge from chain ${chainIdHex}`)
      console.log(`Amount: ${amount} ${selectedToken.symbol}`)

      await bridge(amount, chainIdHex)
      await refreshBalances()

      toast({
        title: "Bridge Successful",
        description: `Bridged ${amount} ${selectedToken.symbol} to ${receivedAmount} MON`,
      })
    } catch (error: any) {
      console.error("Bridge failed:", error)
      toast({
        variant: "destructive",
        title: "Bridge Failed",
        description: error.message,
      })
    }
  }

  const getCurrentBalance = () => {
    if (!address) return "0.0000"

    if (chainId === MONAD_CHAIN_ID) {
      return balances.MON || "0.0000"
    }

    // If on Sepolia, show ETH balance
    if (chainId === "0xaa36a7") {
      return balances.ETH || "0.0000"
    }

    return "0.0000"
  }

  const getDisplaySymbol = () => {
    if (chainId === MONAD_CHAIN_ID) return "MON"
    if (chainId === "0xaa36a7") return "ETH"
    return selectedToken.symbol
  }

  return (
    <div className="w-full max-w-sm mx-auto relative">
      <div className="bg-[#F5F5F5] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden p-4">
        <div className="space-y-4">
          {/* Network Warning */}
          {address && chainId && chainId !== MONAD_CHAIN_ID && chainId !== "0xaa36a7" && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm">
              Please switch to Sepolia or Monad Testnet to use the bridge
            </div>
          )}

          {/* Chain Selection */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ChainSelector
                selectedChain={sourceChain}
                onSelectChain={setSourceChain}
                otherChain={destinationChain}
                availableChains={sourceChains}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg bg-[#252525] hover:bg-[#2A2A2A] border border-gray-800"
            >
              <ArrowDownUp className="h-4 w-4 text-[#6266E4]" />
            </Button>

            <div className="flex-1">
              <ChainSelector
                selectedChain={destinationChain}
                onSelectChain={setDestinationChain}
                otherChain={sourceChain}
                availableChains={destinationChains}
              />
            </div>
          </div>

          {/* Rate Display */}
          <div className="text-xs text-gray-600 px-1">Rate: 1 ETH = {CONVERSION_RATE} MON</div>

          {/* Amount Input Section */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#252525] border-gray-800 text-[#E4E3E8] text-base h-10 rounded-lg px-3"
                    disabled={!address || isProcessing}
                  />
                </div>
                <div className="w-[120px] flex-shrink-0">
                  <TokenSelector selectedToken={selectedToken} onSelectToken={setSelectedToken} />
                </div>
              </div>
              {/* Balance Display */}
              {address && (
                <div className="text-xs text-gray-600 px-1">
                  Balance: {isLoading ? "Loading..." : getCurrentBalance()} {getDisplaySymbol()}
                </div>
              )}
            </div>

            {/* You Receive Field */}
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="w-full bg-[#252525] border border-gray-800 text-[#E4E3E8] text-sm h-10 rounded-lg px-3 flex items-center">
                    {receivedAmount || "0.0"}
                  </div>
                </div>
                <div className="w-[120px] flex-shrink-0">
                  <div className="flex items-center gap-1.5 bg-[#252525] border border-gray-800 px-3 h-10 rounded-lg">
                    <div className="h-5 w-5 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={tokens[1].logoUrl || "/placeholder.svg"}
                        alt="MON"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium text-[#E4E3E8]">MON</span>
                  </div>
                </div>
              </div>
              {/* MON Balance */}
              {address && <div className="text-xs text-gray-600 px-1">Balance: {balances.MON || "0.0000"} MON</div>}
            </div>
          </div>

          {/* Bridge Button */}
          <Button
            className="w-full bg-[#6266E4] hover:bg-[#6266E4]/90 text-white font-medium h-10 text-sm rounded-lg"
            onClick={address ? handleBridge : connect}
            disabled={isProcessing || (address && (!amount || isNaN(Number(amount))))}
          >
            {isProcessing
              ? "Processing..."
              : !isMetaMaskInstalled
                ? "Install MetaMask"
                : !address
                  ? "Connect Wallet"
                  : "Bridge"}
          </Button>
        </div>
      </div>

      {isBridgeOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 flex items-center justify-center"
          onClick={() => setIsBridgeOpen(false)}
        >
          <div
            className="flex flex-col items-center justify-center bg-[#1A1A1A]/80 p-8 rounded-xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="animate-spin rounded-full border-4 border-gray-300 border-t-[#6266E4] h-16 w-16"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-[#6266E4]"></div>
              </div>
            </div>
            <span className="mt-4 text-white font-semibold text-lg">Under Development</span>
            <p className="mt-2 text-gray-400 text-sm max-w-xs text-center">
              The bridge functionality is coming soon. Check back later for updates.
            </p>
            <Button
              className="mt-6 bg-[#6266E4] hover:bg-[#6266E4]/90 text-white"
              onClick={() => setIsBridgeOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Add the new overlay */}
      <DevelopmentOverlay />
    </div>
  )
}

