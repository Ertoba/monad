"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react"
import { ethers } from "ethers"
import { MONAD_CHAIN_ID, MONAD_NETWORK } from "@/lib/constants"
import { usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface WalletState {
  address: string | null
  chainId: string | null
  isConnecting: boolean
  error: string | null
  isMetaMaskInstalled: boolean
  walletType: string | null
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (targetChainId: string) => Promise<void>
  switchToMonad: () => Promise<void>
  getMonadProvider: () => ethers.BrowserProvider | null
  getMonadRpcProvider: () => ethers.JsonRpcProvider
  isMonadNetwork: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnecting: false,
    error: null,
    isMetaMaskInstalled: false,
    walletType: null,
  })

  const pathname = usePathname()
  const { toast } = useToast()

  // Computed property to check if we're on Monad network
  const isMonadNetwork = state.chainId?.toLowerCase() === MONAD_CHAIN_ID.toLowerCase()

  // Detect wallet type and availability
  useEffect(() => {
    const detectWallet = () => {
      const isMetaMaskInstalled = typeof window !== "undefined" && !!window.ethereum?.isMetaMask

      // Detect wallet type (MetaMask, Trust Wallet, Zerion, etc.)
      let walletType = null
      if (typeof window !== "undefined" && window.ethereum) {
        if (window.ethereum.isMetaMask) walletType = "metamask"
        else if (window.ethereum.isTrust) walletType = "trustwallet"
        else if (window.ethereum.isZerion) walletType = "zerion"
        else if (window.ethereum.isCoinbaseWallet) walletType = "coinbase"
        else walletType = "unknown"
      }

      setState((prev) => ({
        ...prev,
        isMetaMaskInstalled,
        walletType,
      }))
    }

    detectWallet()
  }, [])

  const switchNetwork = useCallback(
    async (targetChainId: string) => {
      if (!window.ethereum) {
        throw new Error("No wallet provider detected")
      }

      try {
        console.log(`Switching to network: ${targetChainId}`)

        // Try to switch to the network
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainId }],
        })

        // Get the current chain ID to verify the switch
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" })
        console.log(`After switch request, current chainId: ${currentChainId}`)

        // Update state after successful switch
        setState((prev) => ({
          ...prev,
          chainId: currentChainId,
        }))

        // Verify the switch was successful
        const isTargetNetwork = currentChainId.toLowerCase() === targetChainId.toLowerCase()
        console.log(`Switch successful? ${isTargetNetwork}`)

        return isTargetNetwork
      } catch (error: any) {
        console.error("Switch network error:", error)

        // This error code indicates that the chain has not been added to the wallet
        if (error.code === 4902) {
          try {
            // For Monad network, use our enhanced configuration
            const networkParams = targetChainId === MONAD_CHAIN_ID ? MONAD_NETWORK : null

            if (!networkParams) {
              throw new Error("Unsupported network")
            }

            console.log("Adding network with params:", networkParams)

            // Add the network to the wallet
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [networkParams],
            })

            // Verify the network was added and switched
            const currentChainId = await window.ethereum.request({ method: "eth_chainId" })
            console.log(`After add network, current chainId: ${currentChainId}`)

            if (currentChainId.toLowerCase() !== targetChainId.toLowerCase()) {
              // Try switching one more time
              console.log("Network added but not switched, trying again...")
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: targetChainId }],
              })

              // Check again
              const finalChainId = await window.ethereum.request({ method: "eth_chainId" })
              console.log(`After second switch attempt, chainId: ${finalChainId}`)
            }

            // Update the state after switch attempts
            const finalChainId = await window.ethereum.request({ method: "eth_chainId" })
            setState((prev) => ({
              ...prev,
              chainId: finalChainId,
            }))

            // Return success status
            return finalChainId.toLowerCase() === targetChainId.toLowerCase()
          } catch (addError) {
            console.error("Add network error:", addError)
            toast({
              variant: "destructive",
              title: "Network Error",
              description: "Failed to add network to your wallet. Please try adding it manually.",
            })
            throw new Error("Failed to add network to wallet")
          }
        }
        throw error
      }
    },
    [toast],
  )

  const switchToMonad = useCallback(async () => {
    return await switchNetwork(MONAD_CHAIN_ID)
  }, [switchNetwork])

  const connect = async () => {
    if (!window.ethereum) {
      setState((prev) => ({
        ...prev,
        error: "Please install a Web3 wallet like MetaMask to connect",
      }))
      return
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }))

    try {
      console.log("Requesting accounts...")
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      // Get current chain ID
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      })

      console.log(`Connected to wallet with chainId: ${chainId}`)
      console.log(`Connected account: ${accounts[0]}`)
      console.log(`Monad chainId: ${MONAD_CHAIN_ID}`)
      console.log(`Is on Monad: ${chainId.toLowerCase() === MONAD_CHAIN_ID.toLowerCase()}`)

      // Set wallet information in state
      setState((prev) => ({
        ...prev,
        address: accounts[0],
        chainId: chainId,
        isConnecting: false,
        error: null,
      }))

      // Show error message only if on wrong network
      if (chainId.toLowerCase() !== MONAD_CHAIN_ID.toLowerCase()) {
        toast({
          title: "Wrong Network",
          description: "Please switch to Monad Testnet to use all features",
          variant: "destructive",
        })
      }

      return accounts[0]
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || "Failed to connect wallet",
      }))

      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect to your wallet",
      })

      throw error
    }
  }

  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      isConnecting: false,
      error: null,
      isMetaMaskInstalled: typeof window !== "undefined" && !!window.ethereum?.isMetaMask,
      walletType: null,
    })
  }, [])

  const getMonadProvider = () => {
    if (!window.ethereum || state.chainId !== MONAD_CHAIN_ID) return null
    return new ethers.BrowserProvider(window.ethereum)
  }

  const getMonadRpcProvider = () => {
    return new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz/")
  }

  const handleChainChanged = async (chainId: string) => {
    console.log(`Chain changed to: ${chainId}`)
    console.log(`Monad chainId: ${MONAD_CHAIN_ID}`)
    console.log(`Is on Monad: ${chainId.toLowerCase() === MONAD_CHAIN_ID.toLowerCase()}`)

    setState((prev) => ({ ...prev, chainId }))

    // Only show warning if not on Monad
    if (chainId.toLowerCase() !== MONAD_CHAIN_ID.toLowerCase()) {
      toast({
        title: "Network Changed",
        description: "Please switch to Monad Testnet for full functionality",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (!window.ethereum) return

    const handleChainChanged = async (chainId: string) => {
      console.log(`Chain changed to: ${chainId}`)

      setState((prev) => ({ ...prev, chainId }))

      // If not on Monad, show a warning
      if (chainId !== MONAD_CHAIN_ID) {
        toast({
          title: "Network Changed",
          description: "Please switch to Monad Testnet for full functionality",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Connected to Monad",
          description: "Successfully connected to Monad Testnet",
        })
      }
    }

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        setState((prev) => ({ ...prev, address: accounts[0] }))
      }
    }

    window.ethereum.on("chainChanged", handleChainChanged)
    window.ethereum.on("accountsChanged", handleAccountsChanged)

    return () => {
      window.ethereum.removeListener("chainChanged", handleChainChanged)
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
    }
  }, [disconnect, toast])

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        switchNetwork,
        switchToMonad,
        getMonadProvider,
        getMonadRpcProvider,
        isMonadNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletProvider")
  }
  return context
}

