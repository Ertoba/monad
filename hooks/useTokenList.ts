"use client"

import { useState, useEffect } from "react"
import { SUPPORTED_TOKENS, type Token } from "@/lib/tokens"
import { useWalletContext } from "@/contexts/wallet-context"
import { MONAD_CHAIN_ID } from "@/lib/constants"

export function useTokenList() {
  const { chainId } = useWalletContext()
  const [customTokens, setCustomTokens] = useState<Token[]>([])

  // Filter tokens based on the current network
  const availableTokens = SUPPORTED_TOKENS.filter((token) => {
    if (chainId === MONAD_CHAIN_ID) {
      // Show all tokens on Monad network
      return true
    }
    // On other networks, only show native token
    return token.isNative
  })

  // Add logging to check token filtering
  useEffect(() => {
    console.log("Chain ID:", chainId)
    console.log("Available Tokens:", availableTokens)
  }, [chainId, availableTokens])

  // Remove duplicates based on address
  const uniqueTokens = availableTokens.filter(
    (token, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          (t.address === null && token.address === null) || // Handle null addresses (native token)
          (t.address && token.address && t.address.toLowerCase() === token.address.toLowerCase()),
      ),
  )

  return {
    availableTokens: uniqueTokens,
    customTokens,
  }
}

