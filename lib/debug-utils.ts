/**
 * Debug utility functions for troubleshooting wallet and network issues
 */

/**
 * Log detailed information about the current wallet and network state
 */
export async function debugWalletState() {
  console.group("🔍 Wallet Debug Information")

  try {
    // Check if ethereum is available
    if (!window.ethereum) {
      console.log("❌ No ethereum provider detected (MetaMask not installed)")
      console.groupEnd()
      return
    }

    console.log("✅ Ethereum provider detected")

    // Get chain ID
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      console.log(`🔗 Current Chain ID (hex): ${chainId}`)
      console.log(`🔗 Current Chain ID (decimal): ${Number.parseInt(chainId, 16)}`)

      // Check if on Monad
      const isMonad = chainId.toLowerCase() === "0x279f"
      console.log(`🔗 On Monad Testnet: ${isMonad ? "Yes ✅" : "No ❌"}`)
    } catch (error) {
      console.error("❌ Error getting chain ID:", error)
    }

    // Get accounts
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts.length > 0) {
        console.log(`👤 Connected account: ${accounts[0]}`)

        // Get balance
        try {
          const balance = await window.ethereum.request({
            method: "eth_getBalance",
            params: [accounts[0], "latest"],
          })
          console.log(`💰 Account balance (hex): ${balance}`)
          console.log(`💰 Account balance (ETH): ${Number.parseInt(balance, 16) / 1e18}`)
        } catch (error) {
          console.error("❌ Error getting balance:", error)
        }
      } else {
        console.log("👤 No accounts connected")
      }
    } catch (error) {
      console.error("❌ Error getting accounts:", error)
    }

    // Check provider properties
    console.log("🔧 Provider properties:")
    console.log(`- isMetaMask: ${window.ethereum.isMetaMask}`)
    console.log(`- isTrust: ${window.ethereum.isTrust}`)
    console.log(`- isConnected: ${window.ethereum.isConnected?.()}`)

    // List available methods
    console.log("🔧 Available methods:")
    const methods = [
      "eth_chainId",
      "eth_accounts",
      "eth_requestAccounts",
      "wallet_switchEthereumChain",
      "wallet_addEthereumChain",
    ]

    for (const method of methods) {
      try {
        // Just check if the method exists
        console.log(`- ${method}: ${typeof window.ethereum.request === "function" ? "✅" : "❌"}`)
      } catch (error) {
        console.log(`- ${method}: ❌`)
      }
    }
  } catch (error) {
    console.error("❌ Unexpected error during wallet debugging:", error)
  }

  console.groupEnd()
}

/**
 * Test network switching to Monad Testnet
 */
export async function testSwitchToMonad() {
  console.group("🔄 Testing Network Switch to Monad")

  try {
    if (!window.ethereum) {
      console.log("❌ No ethereum provider detected")
      console.groupEnd()
      return
    }

    // Get current chain ID
    const initialChainId = await window.ethereum.request({ method: "eth_chainId" })
    console.log(`🔗 Initial Chain ID: ${initialChainId}`)

    // Try to switch to Monad
    try {
      console.log("🔄 Attempting to switch to Monad Testnet...")
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x279f" }],
      })

      // Check if switch was successful
      const newChainId = await window.ethereum.request({ method: "eth_chainId" })
      console.log(`🔗 New Chain ID: ${newChainId}`)

      if (newChainId.toLowerCase() === "0x279f") {
        console.log("✅ Successfully switched to Monad Testnet")
      } else {
        console.log("❌ Failed to switch to Monad Testnet")
      }
    } catch (error: any) {
      console.error("❌ Error switching network:", error)

      // If chain not added, try to add it
      if (error.code === 4902) {
        console.log("🔄 Monad Testnet not added to wallet, attempting to add...")
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x279f",
                chainName: "Monad Testnet",
                rpcUrls: ["https://testnet-rpc.monad.xyz/"],
                nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
                blockExplorerUrls: ["https://explorer.testnet.monad.xyz"],
              },
            ],
          })

          // Check if add was successful
          const finalChainId = await window.ethereum.request({ method: "eth_chainId" })
          console.log(`🔗 Final Chain ID after add attempt: ${finalChainId}`)

          if (finalChainId.toLowerCase() === "0x279f") {
            console.log("✅ Successfully added and switched to Monad Testnet")
          } else {
            console.log("❌ Added Monad Testnet but did not switch")
          }
        } catch (addError) {
          console.error("❌ Error adding Monad Testnet:", addError)
        }
      }
    }
  } catch (error) {
    console.error("❌ Unexpected error during network switch test:", error)
  }

  console.groupEnd()
}

