"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowDownUp, Info, Loader2, AlertCircle } from "lucide-react"
import { TokenSelector } from "@/components/token-selector"
import { SUPPORTED_TOKENS } from "@/lib/tokens"
import { useWalletContext } from "@/contexts/wallet-context"
import { useTokenBalance } from "@/hooks/useTokenBalance"
import { useSwap } from "@/hooks/useSwap"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SwapSheet() {
  const [inputAmount, setInputAmount] = useState("")
  const [outputAmount, setOutputAmount] = useState("")
  const [inputToken, setInputToken] = useState(SUPPORTED_TOKENS[0])
  const [outputToken, setOutputToken] = useState(SUPPORTED_TOKENS[1])
  const [error, setError] = useState<string | null>(null)
  const [swapStatus, setSwapStatus] = useState<"idle" | "approving" | "swapping">("idle")
  const [lastTransaction, setLastTransaction] = useState<string | null>(null)

  const { address, chainId, connect } = useWalletContext()
  const { balances, isLoading, refreshBalances } = useTokenBalance(address, chainId)
  const { swap, isProcessing: isSwapping, approveToken } = useSwap()
  const { toast } = useToast()

  const handleSwitch = () => {
    const tempToken = inputToken
    setInputToken(outputToken)
    setOutputToken(tempToken)
    setInputAmount(outputAmount)
    setOutputAmount(inputAmount)
    setError(null)
  }

  const handleInputChange = (value: string) => {
    setInputAmount(value)
    // For now, using 1:1 ratio. In production, you'd calculate this based on reserves
    setOutputAmount(value)
    setError(null)
  }

  // Update swap status based on isSwapping
  useEffect(() => {
    if (!isSwapping) {
      setSwapStatus("idle")
    }
  }, [isSwapping])

  // Refresh balances when component mounts or address changes
  useEffect(() => {
    if (address) {
      refreshBalances()
    }
  }, [address, refreshBalances])

  // Refresh balances after a transaction completes
  useEffect(() => {
    if (lastTransaction && address) {
      refreshBalances()
    }
  }, [lastTransaction, address, refreshBalances])

  const handleApproveToken = async () => {
    if (!address || !inputAmount || inputToken.isNative) return

    setSwapStatus("approving")
    setError(null)

    try {
      const tokenAddress =
        inputToken.symbol === "USDT"
          ? SUPPORTED_TOKENS.find((t) => t.symbol === "USDT")?.address
          : SUPPORTED_TOKENS.find((t) => t.symbol === "USDC")?.address

      if (!tokenAddress) {
        throw new Error("Token address not found")
      }

      await approveToken(tokenAddress, inputAmount, inputToken.decimals)

      toast({
        title: "Approval Successful",
        description: `Successfully approved ${inputToken.symbol} for swapping`,
      })
    } catch (error) {
      console.error("Approval failed:", error)
      setError(`Approval failed: ${error.message || "Unknown error"}`)

      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "Failed to approve token",
      })
    } finally {
      setSwapStatus("idle")
    }
  }

  const handleSwapTokens = async () => {
    if (!address || !inputAmount || isNaN(Number(inputAmount))) return

    // Reset error state
    setError(null)

    // Check if amount is too small
    if (Number(inputAmount) <= 0) {
      setError("Amount must be greater than 0")
      return
    }

    // Check if amount is too large (might be a test or demo, so keep this limit reasonable)
    if (Number(inputAmount) > 1000000) {
      setError("Amount is too large for a test transaction")
      return
    }

    // Check if we have sufficient balance
    const tokenBalance = balances[inputToken.symbol]
    if (tokenBalance && Number(inputAmount) > Number(tokenBalance)) {
      setError(`Insufficient ${inputToken.symbol} balance`)
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: `You need ${inputAmount} ${inputToken.symbol}, but have ${tokenBalance}`,
      })
      return
    }

    try {
      console.log(`Initiating swap of ${inputAmount} ${inputToken.symbol} to ${outputAmount} ${outputToken.symbol}`)

      // Update status to swapping
      setSwapStatus("swapping")

      // Call the swap function from useSwap hook with the correct parameters
      const txHash = await swap(inputToken.symbol, outputToken.symbol, inputAmount)

      console.log("Transaction successful:", txHash)
      setLastTransaction(txHash)

      toast({
        title: "Swap Successful",
        description: `Swapped ${inputAmount} ${inputToken.symbol} to ${outputAmount} ${outputToken.symbol}`,
      })

      // Only reset form after successful transaction
      setInputAmount("")
      setOutputAmount("")

      // Refresh balances after successful swap
      refreshBalances()
    } catch (error: any) {
      console.error("Swap failed:", error)

      // Provide a more user-friendly error message
      let errorMessage = error.message || "An error occurred during the swap"

      // If the error contains technical details, simplify it
      if (errorMessage.includes("missing revert data") || errorMessage.includes("UNPREDICTABLE_GAS_LIMIT")) {
        errorMessage = "The swap cannot be completed. This may be due to incorrect contract function signatures."
      } else if (errorMessage.includes("reverted")) {
        errorMessage = "Transaction failed. This may be due to insufficient liquidity or contract limitations."
      }

      setError(errorMessage)

      toast({
        variant: "destructive",
        title: "Swap Failed",
        description: errorMessage,
      })
    } finally {
      setSwapStatus("idle")
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto" data-keep-open="true" onClick={(e) => e.stopPropagation()}>
      <div className="space-y-6">
        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="py-2 bg-red-900/30 border-red-800/50 text-red-300">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Last transaction hash */}
        {lastTransaction && (
          <div className="px-2.5 py-1.5 text-xs text-gray-400 bg-[#1A1A1A] rounded-lg overflow-hidden">
            <div className="mb-1 font-medium">Last Transaction:</div>
            <div className="truncate">
              <a
                href={`https://explorer.testnet.monad.xyz/tx/${lastTransaction}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6266E4] hover:underline"
              >
                {lastTransaction}
              </a>
            </div>
          </div>
        )}

        {/* Input Token */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="0.0"
                value={inputAmount}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full bg-[#252525] border-gray-800 text-[#E4E3E8] text-base h-9 rounded-lg px-2.5"
                style={{ fontSize: "16px" }}
                disabled={swapStatus !== "idle"}
              />
            </div>
            <div className="w-[100px] flex-shrink-0">
              <TokenSelector
                selectedToken={inputToken}
                onSelectToken={(token) => {
                  setInputToken(token)
                  setError(null)
                }}
                availableTokens={SUPPORTED_TOKENS}
                className="h-9"
              />
            </div>
          </div>
          <div className="text-xs text-gray-500 px-1">
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Loading...
              </span>
            ) : (
              <span>
                Available: {balances[inputToken.symbol] || "0.00"} {inputToken.symbol}
              </span>
            )}
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center my-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwitch}
            className="h-8 w-8 rounded-lg bg-[#252525] hover:bg-[#2A2A2A] border border-gray-800 flex items-center justify-center"
            disabled={swapStatus !== "idle"}
          >
            <ArrowDownUp className="h-3.5 w-3.5 text-[#6266E4]" />
          </Button>
        </div>

        {/* Output Token */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div
                className="w-full bg-[#252525] border border-gray-800 text-[#E4E3E8] text-base h-9 rounded-lg px-2.5 flex items-center"
                style={{ fontSize: "16px" }}
              >
                {outputAmount || "0.0"}
              </div>
            </div>
            <div className="w-[100px] flex-shrink-0">
              <TokenSelector
                selectedToken={outputToken}
                onSelectToken={(token) => {
                  setOutputToken(token)
                  setError(null)
                }}
                availableTokens={SUPPORTED_TOKENS}
                className="h-9"
              />
            </div>
          </div>
          <div className="text-xs text-gray-500 px-1">
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Loading...
              </span>
            ) : (
              <span>
                Available: {balances[outputToken.symbol] || "0.00"} {outputToken.symbol}
              </span>
            )}
          </div>
        </div>

        {/* Rate Display */}
        {inputAmount && (
          <div className="flex items-center gap-2 text-xs text-gray-400 px-2.5 py-1.5 bg-[#1A1A1A] rounded-lg">
            <Info className="h-3.5 w-3.5 text-[#6266E4]" />
            <span>
              Rate: 1 {inputToken.symbol} = 1 {outputToken.symbol}
            </span>
          </div>
        )}

        {/* Approve Button - only show for token to MON swaps when needed */}
        {!inputToken.isNative && inputAmount && (
          <Button
            variant="outline"
            onClick={handleApproveToken}
            disabled={swapStatus !== "idle" || !address || !inputAmount}
            className="w-full bg-[#252525] hover:bg-[#2A2A2A] text-white font-medium h-8 text-sm rounded-lg mb-2"
          >
            {swapStatus === "approving" ? (
              <span className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Approving...
              </span>
            ) : (
              "Approve Token"
            )}
          </Button>
        )}

        {/* Swap Button */}
        <Button
          className="w-full bg-gradient-to-r from-[#6266E4] to-[#4A4FCF] hover:from-[#4A4FCF] hover:to-[#6266E4] text-white font-medium h-10 text-sm rounded-lg"
          onClick={address ? handleSwapTokens : connect}
          disabled={!address || !inputAmount || isLoading || swapStatus !== "idle"}
        >
          {!address ? (
            "Connect Wallet"
          ) : swapStatus === "approving" ? (
            <span className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Approving...
            </span>
          ) : swapStatus === "swapping" ? (
            <span className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Swapping...
            </span>
          ) : isLoading ? (
            "Loading..."
          ) : (
            "Swap Tokens"
          )}
        </Button>

        {/* Refresh button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshBalances}
            disabled={isLoading || !address || swapStatus !== "idle"}
            className="text-xs text-gray-400 hover:text-gray-300"
          >
            <Loader2 className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Balances
          </Button>
        </div>
      </div>
    </div>
  )
}

