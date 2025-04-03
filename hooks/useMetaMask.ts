"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"

interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  chainId: string | null
  isConnecting: boolean
  error: string | null
}

const SEPOLIA_CHAIN_ID = "0xaa36a7"
const SEPOLIA_NETWORK = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: "Ethereum Sepolia",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
}

export function useMetaMask() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isConnecting: false,
    error: null,
  })

  const checkMetaMaskInstalled = useCallback(() => {
    return typeof window !== "undefined" && !!window.ethereum
  }, [])

  const updateBalance = useCallback(async (address: string) => {
    if (!window.ethereum) return

    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      const balanceInEth = ethers.formatEther(balance)
      setState((prev) => ({ ...prev, balance: (+balanceInEth).toFixed(4) }))
    } catch (error) {
      console.error("Error fetching balance:", error)
    }
  }, [])

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      })
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SEPOLIA_NETWORK],
          })
        } catch (addError) {
          throw new Error("Failed to add Sepolia network")
        }
      }
      throw error
    }
  }, [])

  const connect = useCallback(async () => {
    if (!checkMetaMaskInstalled()) {
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

      // Switch to Sepolia if not already on it
      if (chainId !== SEPOLIA_CHAIN_ID) {
        await switchToSepolia()
      }

      const address = accounts[0]
      await updateBalance(address)

      setState((prev) => ({
        ...prev,
        isConnected: true,
        address,
        chainId: SEPOLIA_CHAIN_ID,
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
  }, [checkMetaMaskInstalled, switchToSepolia, updateBalance])

  // Listen for account and network changes
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        setState((prev) => ({
          ...prev,
          isConnected: false,
          address: null,
          balance: null,
        }))
      } else {
        const newAddress = accounts[0]
        await updateBalance(newAddress)
        setState((prev) => ({
          ...prev,
          isConnected: true,
          address: newAddress,
        }))
      }
    }

    const handleChainChanged = async (chainId: string) => {
      if (chainId !== SEPOLIA_CHAIN_ID) {
        try {
          await switchToSepolia()
        } catch (error) {
          console.error("Failed to switch network:", error)
        }
      }
      setState((prev) => ({ ...prev, chainId }))
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }, [switchToSepolia, updateBalance])

  return {
    ...state,
    isMetaMaskInstalled: checkMetaMaskInstalled(),
    connect,
  }
}

