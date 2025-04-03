"use client"

import { useState, useEffect, useCallback } from "react"

interface NetworkConfig {
  chainId: string
  chainName: string
  rpcUrls: string[]
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  blockExplorerUrls: string[]
}

export const SUPPORTED_NETWORKS: { [key: string]: NetworkConfig } = {
  "0xaa36a7": {
    // Sepolia Testnet
    chainId: "0xaa36a7",
    chainName: "Ethereum Sepolia",
    rpcUrls: ["https://rpc.sepolia.org"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  "0x279F": {
    // Monad Testnet
    chainId: "0x279F",
    chainName: "Monad Testnet",
    rpcUrls: ["https://rpc.testnet.monad.xyz/"],
    nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
    blockExplorerUrls: ["https://explorer.testnet.monad.xyz"],
  },
}

interface WalletState {
  address: string | null
  chainId: string | null
  isConnecting: boolean
  error: string | null
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnecting: false,
    error: null,
  })

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== "undefined" && !!window.ethereum
  }, [])

  // Handle account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setState((prev) => ({ ...prev, address: null }))
      } else {
        setState((prev) => ({ ...prev, address: accounts[0] }))
      }
    }

    const handleChainChanged = (chainId: string) => {
      setState((prev) => ({ ...prev, chainId }))
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }, [isMetaMaskInstalled])

  // Switch or add network
  const switchNetwork = useCallback(
    async (chainId: string) => {
      if (!isMetaMaskInstalled()) return

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        })
      } catch (error: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [SUPPORTED_NETWORKS[chainId]],
            })
          } catch (addError) {
            throw new Error("Failed to add network to MetaMask")
          }
        }
        throw error
      }
    },
    [isMetaMaskInstalled],
  )

  const validateNetwork = useCallback(async (chainId: string) => {
    if (!SUPPORTED_NETWORKS[chainId]) {
      throw new Error("Please switch to a supported network (Sepolia or Monad Testnet)")
    }
    return true
  }, [])

  // Connect wallet
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setState((prev) => ({
        ...prev,
        error: "Please install MetaMask to connect your wallet",
      }))
      return
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }))

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      // Get current chain ID
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      })

      // Check if the network is supported
      try {
        await validateNetwork(chainId)
      } catch (error: any) {
        // Default to Sepolia if not on a supported network
        await switchNetwork("0xaa36a7")
      }

      setState((prev) => ({
        ...prev,
        address: accounts[0],
        chainId,
        isConnecting: false,
        error: null,
      }))
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || "Failed to connect wallet",
      }))
    }
  }, [isMetaMaskInstalled, switchNetwork, validateNetwork])

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      isConnecting: false,
      error: null,
    })
  }, [])

  return {
    ...state,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    connect,
    disconnect,
    switchNetwork,
  }
}

