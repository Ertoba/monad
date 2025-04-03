"use client"

import { useState, useCallback } from "react"
import { ethers } from "ethers"
import {
  MONAD_SWAP_CONTRACT,
  USDT_ADDRESS,
  USDC_ADDRESS,
  SWAP_CONTRACT_ABI,
  ERC20_ABI,
  MONAD_CHAIN_ID,
} from "@/lib/constants"
import { useWalletContext } from "@/contexts/wallet-context"

// Define supported swap function names to try
const MON_TO_TOKEN_FUNCTIONS = ["swapMONforToken", "swapMONtoToken"]
const TOKEN_TO_MON_FUNCTIONS = ["swapTokenforMON", "swapTokenToMON"]

export function useSwap() {
  const [isProcessing, setIsProcessing] = useState(false)
  const { address, chainId, getMonadProvider, switchToMonad } = useWalletContext()

  // Function to call provider.getCode safely
  const checkContractCode = useCallback(
    async (contractAddress: string) => {
      if (!contractAddress) return "0x"

      try {
        const provider = getMonadProvider()
        if (!provider) return "0x"

        const code = await provider.getCode(contractAddress)
        return code
      } catch (error) {
        console.error("Error checking contract code:", error)
        return "0x"
      }
    },
    [getMonadProvider],
  )

  // Function to find a function from the ABI
  const findFunction = useCallback((contract: ethers.Contract, functionNames: string[]) => {
    for (const name of functionNames) {
      try {
        const func = contract.interface.getFunction(name)
        if (func) {
          console.log(`Found function: ${name}`)
          return { name, function: func }
        }
      } catch (error) {
        console.log(`Function ${name} not found in contract interface`)
      }
    }
    return null
  }, [])

  // Get contract instance with detailed error handling
  const getContract = useCallback(async () => {
    if (!address || chainId !== MONAD_CHAIN_ID) return null

    try {
      const provider = getMonadProvider()
      if (!provider) {
        console.error("Failed to get Monad provider")
        return null
      }

      const signer = await provider.getSigner()
      console.log("Creating contract instance at:", MONAD_SWAP_CONTRACT)

      // Verify contract exists by checking code
      const code = await checkContractCode(MONAD_SWAP_CONTRACT)
      if (code === "0x" || code === "") {
        console.error("No contract code found at address:", MONAD_SWAP_CONTRACT)
        throw new Error("Swap contract not found at the specified address")
      }

      const contract = new ethers.Contract(MONAD_SWAP_CONTRACT, SWAP_CONTRACT_ABI, signer)

      // Test if the contract interface is working
      const monToTokenFunc = findFunction(contract, MON_TO_TOKEN_FUNCTIONS)
      const tokenToMonFunc = findFunction(contract, TOKEN_TO_MON_FUNCTIONS)

      if (!monToTokenFunc && !tokenToMonFunc) {
        console.warn("Could not find expected functions in contract interface")
      } else {
        console.log("Contract interface validated")
      }

      return contract
    } catch (error) {
      console.error("Error creating contract instance:", error)
      return null
    }
  }, [address, chainId, getMonadProvider, checkContractCode, findFunction])

  // Get token contract
  const getTokenContract = useCallback(
    async (tokenAddress: string) => {
      if (!address || chainId !== MONAD_CHAIN_ID) return null

      try {
        const provider = getMonadProvider()
        if (!provider) return null

        const signer = await provider.getSigner()
        // Verify token contract exists
        const code = await checkContractCode(tokenAddress)
        if (code === "0x" || code === "") {
          console.error("No token contract found at address:", tokenAddress)
          throw new Error("Token contract not found at the specified address")
        }

        return new ethers.Contract(tokenAddress, ERC20_ABI, signer)
      } catch (error) {
        console.error("Error getting token contract:", error)
        return null
      }
    },
    [address, chainId, getMonadProvider, checkContractCode],
  )

  // Approve token spending with better error handling
  const approveToken = async (tokenAddress: string, amount: string, decimals = 6) => {
    console.log(`Approving ${amount} of token ${tokenAddress} with ${decimals} decimals`)

    const tokenContract = await getTokenContract(tokenAddress)
    if (!tokenContract) throw new Error("Failed to get token contract")

    try {
      const amountWei = ethers.parseUnits(amount, decimals)
      console.log(`Approval amount in wei: ${amountWei.toString()}`)

      // Try calling balanceOf to verify contract works
      const balance = await tokenContract.balanceOf(address)
      console.log(`Token balance: ${ethers.formatUnits(balance, decimals)}`)

      // Check existing allowance
      const currentAllowance = await tokenContract.allowance(address, MONAD_SWAP_CONTRACT)
      console.log(`Current allowance: ${ethers.formatUnits(currentAllowance, decimals)}`)

      // If already approved, skip
      if (currentAllowance >= amountWei) {
        console.log("Already approved sufficient amount")
        return null // No transaction needed
      }

      const tx = await tokenContract.approve(MONAD_SWAP_CONTRACT, amountWei, {
        gasLimit: 100000,
        gasPrice: ethers.parseUnits("50", "gwei"),
      })
      console.log("Approval transaction sent:", tx.hash)

      const receipt = await tx.wait()
      console.log("Approval confirmed:", receipt)
      return receipt
    } catch (error) {
      console.error("Error approving token:", error)
      throw new Error(`Failed to approve token: ${error.message || "Unknown error"}`)
    }
  }

  // Check if token is approved for spending
  const checkAllowance = async (tokenAddress: string, amount: string, decimals = 6) => {
    try {
      const tokenContract = await getTokenContract(tokenAddress)
      if (!tokenContract || !address) return false

      const amountWei = ethers.parseUnits(amount, decimals)
      const allowance = await tokenContract.allowance(address, MONAD_SWAP_CONTRACT)
      console.log(`Current allowance: ${allowance.toString()}, Required: ${amountWei.toString()}`)
      return allowance >= amountWei
    } catch (error) {
      console.error("Error checking allowance:", error)
      return false
    }
  }

  // Get token decimals
  const getTokenDecimals = async (tokenAddress: string) => {
    try {
      const tokenContract = await getTokenContract(tokenAddress)
      if (!tokenContract) return 6 // Default for USDC/USDT

      const decimals = await tokenContract.decimals()
      return decimals
    } catch (error) {
      console.error("Error getting token decimals:", error)
      return 6 // Default fallback
    }
  }

  // Main swap function
  const swap = async (fromToken: string, toToken: string, amount: string) => {
    if (chainId !== MONAD_CHAIN_ID) {
      await switchToMonad()
      throw new Error("Please switch to Monad Testnet")
    }

    setIsProcessing(true)
    try {
      const provider = getMonadProvider()
      if (!provider) throw new Error("No Monad provider available")

      const contract = await getContract()
      if (!contract) throw new Error("Failed to get contract")

      // Add debug logging
      console.log("Swap parameters:", { fromToken, toToken, amount })
      console.log("Contract address:", MONAD_SWAP_CONTRACT)

      // Try direct call first
      if (fromToken === "MON") {
        // Swapping MON to Token
        const tokenOut = toToken === "USDT" ? USDT_ADDRESS : USDC_ADDRESS
        const amountInWei = ethers.parseEther(amount) // MON uses 18 decimals

        console.log("MON to Token swap:", {
          amount: amount,
          amountInWei: amountInWei.toString(),
          tokenOut,
        })

        // Try multiple function signatures
        const funcInfo = findFunction(contract, MON_TO_TOKEN_FUNCTIONS)
        if (!funcInfo) {
          throw new Error("Could not find MON to token swap function in contract")
        }

        console.log(`Using function ${funcInfo.name} for swap`)

        // Calculate minimum amount out (no slippage for now)
        const minAmountOut = 0 // In a real app, calculate this based on slippage tolerance

        // Send transaction
        const tx = await contract[funcInfo.name](tokenOut, minAmountOut, {
          value: amountInWei,
          gasLimit: 5000000,
          gasPrice: ethers.parseUnits("50", "gwei"),
        })

        console.log("Transaction sent:", tx.hash)
        const receipt = await tx.wait()
        console.log("Transaction receipt:", receipt)

        if (receipt.status === 0) {
          throw new Error("Transaction reverted on-chain")
        }

        return tx.hash
      } else {
        // Swapping Token to MON
        const tokenIn = fromToken === "USDT" ? USDT_ADDRESS : USDC_ADDRESS

        // Get token decimals
        const decimals = await getTokenDecimals(tokenIn)
        console.log(`Token decimals: ${decimals}`)

        const amountInWei = ethers.parseUnits(amount, decimals)

        console.log("Token to MON swap:", {
          amount: amount,
          amountInWei: amountInWei.toString(),
          tokenIn,
        })

        // Approve token spending if needed
        const hasAllowance = await checkAllowance(tokenIn, amount, decimals)
        if (!hasAllowance) {
          console.log("Insufficient allowance, approving tokens...")
          await approveToken(tokenIn, amount, decimals)
        }

        // Try multiple function signatures
        const funcInfo = findFunction(contract, TOKEN_TO_MON_FUNCTIONS)
        if (!funcInfo) {
          throw new Error("Could not find token to MON swap function in contract")
        }

        console.log(`Using function ${funcInfo.name} for swap`)

        // Calculate minimum amount out (no slippage for now)
        const minAmountOut = 0 // In a real app, calculate this based on slippage tolerance

        // Check function parameter order
        let tx
        try {
          if (funcInfo.name === "swapTokenforMON") {
            tx = await contract.swapTokenforMON(tokenIn, amountInWei, minAmountOut, {
              gasLimit: 5000000,
              gasPrice: ethers.parseUnits("50", "gwei"),
            })
          } else {
            tx = await contract.swapTokenToMON(tokenIn, amountInWei, minAmountOut, {
              gasLimit: 5000000,
              gasPrice: ethers.parseUnits("50", "gwei"),
            })
          }
        } catch (error) {
          console.error("Failed with standard parameter order:", error)

          // Try alternative parameter orders
          console.log("Trying alternative parameter order...")
          if (funcInfo.name === "swapTokenforMON") {
            tx = await contract.swapTokenforMON(amountInWei, tokenIn, {
              gasLimit: 5000000,
              gasPrice: ethers.parseUnits("50", "gwei"),
            })
          } else {
            tx = await contract.swapTokenToMON(amountInWei, tokenIn, {
              gasLimit: 5000000,
              gasPrice: ethers.parseUnits("50", "gwei"),
            })
          }
        }

        console.log("Transaction sent:", tx.hash)
        const receipt = await tx.wait()
        console.log("Transaction receipt:", receipt)

        if (receipt.status === 0) {
          throw new Error("Transaction reverted on-chain")
        }

        return tx.hash
      }
    } catch (error) {
      console.error("Swap error details:", error)

      // Check for common error patterns
      const errorMessage = error.message || "Unknown error"

      if (errorMessage.includes("UNPREDICTABLE_GAS_LIMIT") || errorMessage.includes("missing revert data")) {
        throw new Error(
          "Transaction would fail: The swap parameters may be invalid or incorrect function signature is being used.",
        )
      } else if (errorMessage.includes("INSUFFICIENT_FUNDS")) {
        throw new Error("Insufficient funds for transaction")
      } else if (errorMessage.includes("user rejected") || errorMessage.includes("User denied")) {
        throw new Error("Transaction rejected by user")
      } else if (errorMessage.includes("NETWORK_ERROR")) {
        throw new Error("Network error. Please check your connection")
      } else if (errorMessage.includes("reverted") || errorMessage.includes("revert")) {
        throw new Error(
          "Transaction reverted: The contract rejected the transaction. This could be due to insufficient liquidity or parameter issues.",
        )
      } else {
        throw new Error(errorMessage || "Swap failed")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    swap,
    isProcessing,
    approveToken,
  }
}

