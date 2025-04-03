"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowDownUp } from "lucide-react"
import { ChainSelector } from "@/components/chain-selector"
import { TokenSelector } from "@/components/token-selector"
import { chains, tokens } from "@/lib/data"
import { useWalletContext } from "@/contexts/wallet-context"

export function BridgeSheet() {
  const sourceChains = chains.filter((chain) => chain.isSource)
  const destinationChains = chains.filter((chain) => chain.isDestination)

  const [sourceChain, setSourceChain] = useState(sourceChains[0])
  const [destinationChain, setDestinationChain] = useState(destinationChains[0])
  const [selectedToken, setSelectedToken] = useState(tokens[0])
  const [amount, setAmount] = useState("")
  const [receivedAmount, setReceivedAmount] = useState("")

  const { address, connect } = useWalletContext()

  // Conversion rate: 1 ETH = 6 MON
  const CONVERSION_RATE = 6

  const handleInputChange = (value: string) => {
    setAmount(value)
    if (value && !isNaN(Number(value))) {
      const converted = Number(value) * CONVERSION_RATE
      setReceivedAmount(converted.toFixed(6))
    } else {
      setReceivedAmount("")
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto" data-keep-open="true" onClick={(e) => e.stopPropagation()}>
      <div className="space-y-6">
        {/* Chain Selection - More compact */}
        <div className="space-y-1.5">
          <div className="text-sm text-gray-300 font-medium mb-1">Select Networks</div>
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
              <ArrowDownUp className="h-3.5 w-3.5 text-[#6266E4]" />
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
        </div>

        {/* Amount Input Section - More compact and consistent */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="text-sm text-gray-300 font-medium">You Send</div>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full bg-[#252525] border-gray-800 text-[#E4E3E8] text-base h-9 rounded-lg px-2.5"
                  style={{ fontSize: "16px" }}
                />
              </div>
              <div className="w-[100px] flex-shrink-0">
                <TokenSelector selectedToken={selectedToken} onSelectToken={setSelectedToken} className="h-9" />
              </div>
            </div>
            <div className="text-xs text-gray-500 px-1">Available: 0.00 ETH</div>
          </div>

          {/* You Receive Field - Matched height and styling */}
          <div className="space-y-1.5">
            <div className="text-sm text-gray-300 font-medium">You Receive</div>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div
                  className="w-full bg-[#252525] border border-gray-800 text-[#E4E3E8] text-base h-9 rounded-lg px-2.5 flex items-center"
                  style={{ fontSize: "16px" }}
                >
                  {receivedAmount || "0.0"}
                </div>
              </div>
              <div className="w-[100px] flex-shrink-0">
                <div className="flex items-center gap-1.5 bg-[#252525] border border-gray-800 px-2.5 h-9 rounded-lg">
                  <div className="h-4 w-4 rounded-full overflow-hidden flex-shrink-0">
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
            <div className="text-xs text-gray-500 px-1">Available: 0.00 MON</div>
          </div>
        </div>

        {/* Bridge Button - Adjusted for consistency */}
        <Button
          className="w-full bg-gradient-to-r from-[#6266E4] to-[#4A4FCF] hover:from-[#4A4FCF] hover:to-[#6266E4] text-white font-medium h-10 text-sm rounded-lg"
          onClick={address ? () => {} : connect}
        >
          {!address ? "Connect Wallet" : "Bridge Assets"}
        </Button>
      </div>
    </div>
  )
}

