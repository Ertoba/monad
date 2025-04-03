"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { getMonadProvider } from "@/lib/providers"
import { MONAD_CHAIN_ID, SUPPORTED_TOKENS, ERC20_ABI } from "@/lib/constants"

interface TokenBalances {
  [key: string]: string
}

const initialBalances: TokenBalances = {
  MON: "0",
  ETH: "0",
  USDC: "0",
  USDT: "0",
}

export function useTokenBalance(address: string | null, chainId: string | null) {
  const [balances, setBalances] = useState<TokenBalances>(initialBalances)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalances = useCallback(async () => {
    if (!address || !chainId) return
    setIsLoading(true)
    setError(null)

    try {
      const newBalances: TokenBalances = { ...initialBalances }

      if (chainId === MONAD_CHAIN_ID) {
        const monadProvider = getMonadProvider()
        if (!monadProvider) throw new Error("Monad provider unavailable")

        const monBalance = await monadProvider.getBalance(address)
        newBalances[SUPPORTED_TOKENS[0].symbol] = ethers.formatEther(monBalance)

        await Promise.all(
          SUPPORTED_TOKENS.filter((token) => token.address).map(async (token) => {
            const contract = new ethers.Contract(token.address!, ERC20_ABI, monadProvider)
            const balance = await contract.balanceOf(address)
            newBalances[token.symbol] = ethers.formatUnits(balance, token.decimals)
          }),
        )
      }

      setBalances(newBalances)
    } catch (err) {
      console.error("Error fetching balances:", err)
      setError("Failed to fetch balances")
    } finally {
      setIsLoading(false)
    }
  }, [address, chainId])

  useEffect(() => {
    if (address) fetchBalances()
  }, [fetchBalances, address, chainId])

  return {
    balances,
    isLoading,
    error,
    refreshBalances: fetchBalances,
  }
}

