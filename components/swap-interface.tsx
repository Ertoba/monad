"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowDownUp, AlertCircle, Loader2 } from "lucide-react"
import { TokenSelector } from "@/components/token-selector"
import { useWalletContext } from "@/contexts/wallet-context"
import { useToast } from "@/components/ui/use-toast"
import { ethers } from "ethers"
import { DevelopmentOverlay } from "@/components/development-overlay"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Add the contract address and token list from the provided code
const CONTRACT_ADDRESS = "0xD1E7F0D2a76defDa10e51be9aDCbaA87dDe64D08"
const MONAD_CHAIN_ID = "0x279F" // 10143 in hex
const MONAD_RPC_URL = "https://testnet-rpc.monad.xyz/"

const tokenList = [
  {
    name: "USDC",
    symbol: "USDC",
    address: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea",
    decimals: 6,
    logoUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  },
  {
    name: "USDT",
    symbol: "USDT",
    address: "0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D",
    decimals: 6,
    logoUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
  },
  {
    name: "WBTC",
    symbol: "WBTC",
    address: "0xcf5a6076cfa32686c0Df13aBaDa2b40dec133F1d",
    decimals: 8,
    logoUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
  },
  {
    name: "WETH",
    symbol: "WETH",
    address: "0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37",
    decimals: 18,
    logoUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  },
  {
    name: "WSOL",
    symbol: "WSOL",
    address: "0x369CD1E20Fa7ea1F8e6dc0759709bA0bD978abE7",
    decimals: 18,
    logoUrl: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
  },
]

// Add the native MON token to the beginning of the list
const SUPPORTED_TOKENS = [
  {
    name: "Monad",
    symbol: "MON",
    address: null,
    decimals: 18,
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7260-JTBCM5BkQ3DxScsUPi3el25ESTH8Vy.jpeg",
    isNative: true,
  },
  ...tokenList,
]

// Replace the existing SwapInterface component with the updated one
export default function SwapInterface() {
  const [inputAmount, setInputAmount] = useState("")
  const [outputAmount, setOutputAmount] = useState("")
  const [inputToken, setInputToken] = useState(SUPPORTED_TOKENS[0])
  const [outputToken, setOutputToken] = useState(SUPPORTED_TOKENS[1])
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)

  const { address, chainId, isMetaMaskInstalled, connect, isMonadNetwork, switchToMonad } = useWalletContext()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize tokens when component loads
  useEffect(() => {
    if (SUPPORTED_TOKENS.length >= 2) {
      setInputToken(SUPPORTED_TOKENS[0])
      setOutputToken(SUPPORTED_TOKENS[1])
    }
  }, [])

  // Fetch token balances
  const fetchBalances = useCallback(async () => {
    if (!address || !window.ethereum) {
      console.log("No address or ethereum provider, skipping balance fetch")
      return
    }

    setIsLoadingBalances(true)
    const newBalances: Record<string, string> = {}

    try {
      console.log("Fetching balances for address:", address)

      // Get current chain ID directly
      const chainIdHex = await window.ethereum.request({ method: "eth_chainId" })
      console.log("Current chainId when fetching balances:", chainIdHex)

      // Check if we're on Monad
      if (chainIdHex.toLowerCase() === MONAD_CHAIN_ID.toLowerCase()) {
        // Create provider - prefer direct RPC for reliability
        const provider = new ethers.BrowserProvider(window.ethereum)

        // Fetch native token balance (MON)
        const nativeBalance = await provider.getBalance(address)
        const formattedNativeBalance = ethers.formatEther(nativeBalance)
        console.log("Native MON balance:", formattedNativeBalance)

        // Store native token balance with 4 decimal precision
        newBalances["MON"] = (+formattedNativeBalance).toFixed(4)

        // Only fetch ERC20 token balances on Monad network
        await Promise.all(
          SUPPORTED_TOKENS.filter((token) => !token.isNative && token.address).map(async (token) => {
            try {
              console.log(`Fetching ${token.symbol} balance from address ${token.address}`)
              const tokenContract = new ethers.Contract(
                token.address!,
                ["function balanceOf(address) view returns (uint256)"],
                provider,
              )

              const balance = await tokenContract.balanceOf(address)
              const formattedBalance = ethers.formatUnits(balance, token.decimals)
              newBalances[token.symbol] = (+formattedBalance).toFixed(4)
              console.log(`${token.symbol} balance:`, formattedBalance)
            } catch (error) {
              console.error(`Error fetching ${token.symbol} balance:`, error)
              newBalances[token.symbol] = "0.0000"
            }
          }),
        )
      } else {
        // On other networks, just show ETH balance
        const provider = new ethers.BrowserProvider(window.ethereum)
        const ethBalance = await provider.getBalance(address)
        const formattedBalance = ethers.formatEther(ethBalance)
        newBalances["ETH"] = (+formattedBalance).toFixed(4)
      }

      console.log("All balances:", newBalances)
      setBalances(newBalances)
    } catch (error) {
      console.error("Error fetching balances:", error)
      toast({
        variant: "destructive",
        title: "Failed to fetch balances",
        description: "Please check your connection and try again",
      })
    } finally {
      setIsLoadingBalances(false)
    }
  }, [address, toast])

  // Check if user is on Monad Testnet
  useEffect(() => {
    if (!address) {
      setNetworkError(null)
      return
    }

    const checkNetwork = async () => {
      try {
        // Get current chain ID directly from ethereum provider
        const chainIdHex = await window.ethereum.request({ method: "eth_chainId" })
        console.log("Current chainId (hex):", chainIdHex)
        console.log("Monad chainId (hex):", MONAD_CHAIN_ID)

        // Convert hex to decimal for easier debugging
        const chainIdDecimal = Number.parseInt(chainIdHex, 16)
        console.log("Current chainId (decimal):", chainIdDecimal)

        const isOnMonad = chainIdHex.toLowerCase() === MONAD_CHAIN_ID.toLowerCase()
        console.log("Is on Monad network:", isOnMonad)

        if (!isOnMonad) {
          setNetworkError("Please switch to Monad Testnet to use the swap feature")
        } else {
          setNetworkError(null)
          // Refresh balances when we confirm we're on the right network
          fetchBalances()
        }
      } catch (error) {
        console.error("Error checking network:", error)
        setNetworkError("Error detecting network. Please refresh the page.")
      }
    }

    checkNetwork()
  }, [address, fetchBalances])

  // Fetch balances when address or network changes
  useEffect(() => {
    if (address) {
      fetchBalances()
    } else {
      setBalances({})
    }
  }, [address, fetchBalances])

  // Listen for network and account changes
  useEffect(() => {
    if (!window.ethereum) return

    const handleChainChanged = (chainId: string) => {
      console.log("Chain changed to:", chainId)
      // Check if on Monad network
      const isOnMonad = chainId.toLowerCase() === MONAD_CHAIN_ID.toLowerCase()

      if (isOnMonad) {
        setNetworkError(null)
        toast({
          title: "Connected to Monad",
          description: "You are now on Monad Testnet",
        })
      } else {
        setNetworkError("Please switch to Monad Testnet to use the swap feature")
        toast({
          variant: "destructive",
          title: "Wrong Network",
          description: "Please switch to Monad Testnet",
        })
      }

      // Refresh balances
      fetchBalances()
    }

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("Accounts changed:", accounts)
      if (accounts.length > 0) {
        fetchBalances()
      }
    }

    window.ethereum.on("chainChanged", handleChainChanged)
    window.ethereum.on("accountsChanged", handleAccountsChanged)

    return () => {
      window.ethereum.removeListener("chainChanged", handleChainChanged)
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
    }
  }, [fetchBalances, toast])

  const handleSwitch = () => {
    const tempToken = inputToken
    setInputToken(outputToken)
    setOutputToken(tempToken)
    setInputAmount(outputAmount)
    setOutputAmount(inputAmount)
  }

  const handleInputChange = (value: string) => {
    setInputAmount(value)

    // Don't calculate output if input is empty or invalid
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      setOutputAmount("")
      return
    }

    try {
      // Handle decimal conversion between tokens with different decimals
      if (inputToken.decimals === outputToken.decimals) {
        // Same decimals, straightforward conversion
        setOutputAmount(value)
      } else {
        // Convert considering decimal differences
        const inputDecimal = Number(inputToken.decimals)
        const outputDecimal = Number(outputToken.decimals)
        const decimalDiff = outputDecimal - inputDecimal

        // Calculate the conversion factor based on decimal difference
        const factor = Math.pow(10, decimalDiff)
        const converted = Number(value) * factor

        // Format with appropriate precision
        setOutputAmount(converted.toString())
      }
    } catch (error) {
      console.error("Error calculating output amount:", error)
      setOutputAmount("0")
    }
  }

  // MON → Token swap function
  const swapMONtoToken = async () => {
    if (!address || !inputAmount || isNaN(Number(inputAmount))) {
      console.error("Invalid input for swapMONtoToken:", { address, inputAmount })
      return
    }

    if (!isMonadNetwork) {
      console.log("Not on Monad network, attempting to switch...")
      await switchToMonad()
      return
    }

    try {
      setIsProcessing(true)
      console.log("Starting MON to Token swap...")
      console.log("Input amount:", inputAmount, "MON")
      console.log("Output token:", outputToken.symbol, "at address", outputToken.address)

      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      console.log("Got signer:", await signer.getAddress())

      // Create contract instance
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ["function swapMONtoToken(address token, uint256 amount) payable"],
        signer,
      )
      console.log("Contract instance created at address:", CONTRACT_ADDRESS)

      // Parse amount to wei
      const amountInWei = ethers.parseEther(inputAmount)
      console.log("Amount in wei:", amountInWei.toString())

      // Execute swap - NOTE: adding mandatory 50 gwei gas price for Monad
      console.log("Executing swap transaction with 50 gwei gas price...")
      const tx = await contract.swapMONtoToken(outputToken.address, amountInWei, {
        value: amountInWei,
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("50", "gwei"), // Important: Monad requires 50 gwei
      })
      console.log("Transaction sent:", tx.hash)

      // Wait for transaction to be mined
      const receipt = await tx.wait()
      console.log("Transaction confirmed:", receipt)

      toast({
        title: "Swap Successful",
        description: `Swapped ${inputAmount} MON to ${outputToken.symbol}`,
      })

      // Reset form and refresh balances
      setInputAmount("")
      setOutputAmount("")
      fetchBalances()
    } catch (error: any) {
      console.error("Swap failed:", error)

      // Provide more specific error messages
      let errorMessage = "An error occurred during the swap"

      if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient balance for this swap"
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Transaction rejected by user"
      } else if (error.message.includes("reverted")) {
        errorMessage = "Transaction reverted by contract: " + (error.reason || "unknown reason")
      }

      toast({
        variant: "destructive",
        title: "Swap Failed",
        description: errorMessage,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Token → MON swap function
  const swapTokenToMON = async () => {
    if (!address || !inputAmount || isNaN(Number(inputAmount))) {
      console.error("Invalid input for swapTokenToMON:", { address, inputAmount })
      return
    }

    if (!isMonadNetwork) {
      console.log("Not on Monad network, attempting to switch...")
      await switchToMonad()
      return
    }

    try {
      setIsProcessing(true)
      console.log("Starting Token to MON swap...")
      console.log("Input amount:", inputAmount, inputToken.symbol)
      console.log("Input token address:", inputToken.address)

      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      console.log("Got signer:", await signer.getAddress())

      // Parse amount based on token decimals
      const amountInUnits = ethers.parseUnits(inputAmount, inputToken.decimals)
      console.log("Amount in units:", amountInUnits.toString())

      // First approve the contract to spend tokens - with 50 gwei gas price
      console.log("Approving token spend with 50 gwei gas price...")
      const erc20 = new ethers.Contract(
        inputToken.address!,
        ["function approve(address spender, uint256 amount) returns (bool)"],
        signer,
      )

      const approveTx = await erc20.approve(CONTRACT_ADDRESS, amountInUnits, {
        gasLimit: 3000000, // Increased from 100000 for complex transactions
        gasPrice: ethers.parseUnits("50", "gwei"), // Important: Monad requires 50 gwei
      })
      console.log("Approval transaction sent:", approveTx.hash)

      const approveReceipt = await approveTx.wait()
      console.log("Approval confirmed:", approveReceipt)

      // Then execute the swap - with 50 gwei gas price
      console.log("Executing swap transaction with 50 gwei gas price...")
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ["function swapTokenToMON(address token, uint256 amount)"],
        signer,
      )

      const tx = await contract.swapTokenToMON(inputToken.address, amountInUnits, {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("50", "gwei"), // Important: Monad requires 50 gwei
      })
      console.log("Transaction sent:", tx.hash)

      const receipt = await tx.wait()
      console.log("Transaction confirmed:", receipt)

      toast({
        title: "Swap Successful",
        description: `Swapped ${inputAmount} ${inputToken.symbol} to MON`,
      })

      // Reset form and refresh balances
      setInputAmount("")
      setOutputAmount("")
      fetchBalances()
    } catch (error: any) {
      console.error("Swap failed:", error)

      // Provide more specific error messages
      let errorMessage = "An error occurred during the swap"

      if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient balance for this swap"
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Transaction rejected by user"
      } else if (error.message.includes("reverted")) {
        errorMessage = "Transaction reverted by contract: " + (error.reason || "unknown reason")
      } else if (error.message.includes("gas required exceeds")) {
        errorMessage = "Transaction requires too much gas. Try a smaller amount."
      }

      toast({
        variant: "destructive",
        title: "Swap Failed",
        description: errorMessage,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle swap based on token direction
  const handleSwap = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault() // Prevent any form submission

    console.log("Swap button clicked")
    console.log("Current state:", {
      address,
      inputAmount,
      inputToken: inputToken.symbol,
      outputToken: outputToken.symbol,
    })

    if (!address) {
      console.log("No wallet connected, prompting connection")
      connect()
      return
    }

    if (!inputAmount || isNaN(Number(inputAmount)) || Number(inputAmount) <= 0) {
      console.error("Invalid input amount:", inputAmount)
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid amount",
      })
      return
    }

    // Check if on Monad network
    if (!isMonadNetwork) {
      console.log("Not on Monad network, attempting to switch...")
      try {
        await switchToMonad()
        toast({
          title: "Network Changed",
          description: "Please try swapping again now that you're on Monad network",
        })
        return
      } catch (error) {
        console.error("Failed to switch network:", error)
        toast({
          variant: "destructive",
          title: "Network Switch Failed",
          description: "Please manually switch to Monad Testnet",
        })
        return
      }
    }

    // Check if we have sufficient balance
    const tokenBalance = balances[inputToken.symbol]
    if (tokenBalance && Number(inputAmount) > Number(tokenBalance)) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: `You need ${inputAmount} ${inputToken.symbol}, but have ${tokenBalance}`,
      })
      return
    }

    try {
      if (inputToken.isNative) {
        // MON to Token swap
        console.log("Executing MON to Token swap")
        await swapMONtoToken()
      } else if (outputToken.isNative) {
        // Token to MON swap
        console.log("Executing Token to MON swap")
        await swapTokenToMON()
      } else {
        // Token to Token swap (not implemented in the provided code)
        console.log("Token to Token swap not supported")
        toast({
          variant: "destructive",
          title: "Not Supported",
          description: "Direct token to token swaps are not supported yet. Swap to MON first.",
        })
      }
    } catch (error: any) {
      console.error("Swap failed:", error)
      toast({
        variant: "destructive",
        title: "Swap Failed",
        description: error.message || "An error occurred during the swap",
      })
    }
  }

  const getBalance = (symbol: string) => {
    if (isLoadingBalances) return "Loading..."
    if (!address) return "0.0000"
    return balances[symbol] || "0.0000"
  }

  // Add this after other useEffect hooks

  // Ensure we have valid tokens before rendering
  if (!inputToken?.symbol || !outputToken?.symbol) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-[#F5F5F5] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden p-4">
          <div className="text-center text-gray-600">Loading tokens...</div>
        </div>
      </div>
    )
  }

  // Debug button to manually refresh balances
  const handleRefreshBalances = () => {
    fetchBalances()
    toast({
      title: "Refreshing Balances",
      description: "Fetching latest token balances...",
    })
  }

  return (
    <div className="w-full max-w-sm mx-auto relative">
      <div className="bg-[#F5F5F5] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden p-4">
        <div className="space-y-4">
          {/* Network Error Alert */}
          {networkError && (
            <Alert variant="destructive" className="py-2 mb-2 bg-red-900/30 border-red-800/50 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{networkError}</AlertDescription>
            </Alert>
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
                  className="w-full bg-[#252525] border-gray-800 text-[#E4E3E8] text-base h-10 rounded-lg px-3"
                  disabled={!address || isProcessing}
                />
              </div>
              <div className="w-[120px] flex-shrink-0">
                <TokenSelector
                  selectedToken={inputToken}
                  onSelectToken={setInputToken}
                  availableTokens={SUPPORTED_TOKENS}
                />
              </div>
            </div>
            <div className="flex justify-between px-1 text-xs">
              <span className="text-gray-600">
                Balance: {getBalance(inputToken.symbol)} {inputToken.symbol}
              </span>
              {isLoadingBalances && (
                <span className="text-gray-500 flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Loading...
                </span>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwitch}
              className="h-8 w-8 rounded-lg bg-[#252525] hover:bg-[#2A2A2A] border border-gray-800 flex items-center justify-center"
            >
              <ArrowDownUp className="h-4 w-4 text-[#6266E4]" />
            </Button>
          </div>

          {/* Output Token */}
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="w-full bg-[#252525] border border-gray-800 text-[#E4E3E8] text-sm h-10 rounded-lg px-3 flex items-center">
                  {outputAmount || "0.0"}
                </div>
              </div>
              <div className="w-[120px] flex-shrink-0">
                <TokenSelector
                  selectedToken={outputToken}
                  onSelectToken={setOutputToken}
                  availableTokens={SUPPORTED_TOKENS}
                />
              </div>
            </div>
            <div className="flex justify-between px-1 text-xs">
              <span className="text-gray-600">
                Balance: {getBalance(outputToken.symbol)} {outputToken.symbol}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshBalances}
                className="h-4 p-0 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                disabled={isLoadingBalances || !address}
              >
                <Loader2 className={`h-3 w-3 ${isLoadingBalances ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Rate Display */}
          {inputAmount && (
            <div className="text-xs text-gray-600 px-1 mt-1">
              Rate: 1 {inputToken.symbol} = 1 {outputToken.symbol}
            </div>
          )}

          {/* Swap Button */}
          <Button
            className="w-full bg-[#6266E4] hover:bg-[#6266E4]/90 text-white font-medium h-10 text-sm rounded-lg mt-2"
            onClick={handleSwap}
            disabled={isProcessing || !address || (address && (!inputAmount || Number(inputAmount) <= 0))}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : !isMetaMaskInstalled ? (
              "Install MetaMask"
            ) : !address ? (
              "Connect Wallet"
            ) : networkError ? (
              "Switch to Monad"
            ) : (
              "Swap"
            )}
          </Button>
        </div>
      </div>

      {/* Debug button - only visible in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              // Import debug utilities dynamically
              const { debugWalletState } = await import("@/lib/debug-utils")

              // Run debug functions
              debugWalletState()

              // Log important state
              console.group("🔍 Component State Debug")
              console.log("Address:", address)
              console.log("Chain ID from context:", chainId)
              console.log("Is on Monad (context):", isMonadNetwork)
              console.log("Network Error:", networkError)
              console.log("Balances:", balances)
              console.log("Input Amount:", inputAmount)
              console.log("Input Token:", inputToken)
              console.log("Output Token:", outputToken)

              // Check gas price requirements
              console.log("Required Gas Price: 50 gwei")
              console.groupEnd()

              // Refresh balances
              fetchBalances()

              toast({
                title: "Debug Info",
                description: "Check browser console for debug information",
              })
            }}
            className="text-xs"
          >
            Debug Wallet
          </Button>
        </div>
      )}

      {/* Add the overlay */}
      <DevelopmentOverlay />
    </div>
  )
}

