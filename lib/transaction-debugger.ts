/**
 * This file contains utilities to debug transaction issues
 */

// Function to check if there are any transaction interceptors
export async function checkForInterceptors() {
  console.group("🔍 Transaction Interceptor Check")

  try {
    // Check if ethereum object has been modified
    if (typeof window !== "undefined" && window.ethereum) {
      console.log("Ethereum object found")

      // Check for custom properties that might indicate modifications
      const customProps = Object.keys(window.ethereum).filter(
        (key) =>
          !["request", "isMetaMask", "isConnected", "on", "removeListener", "autoRefreshOnNetworkChange"].includes(key),
      )

      if (customProps.length > 0) {
        console.warn("⚠️ Custom properties found on ethereum object:", customProps)
      } else {
        console.log("✅ No suspicious custom properties found on ethereum object")
      }

      // Check if request method has been overridden
      const originalRequest = window.ethereum.request
      if (originalRequest.toString().includes("[native code]")) {
        console.log("✅ ethereum.request appears to be original")
      } else {
        console.warn("⚠️ ethereum.request may have been overridden")
      }

      // Check for browser extensions that might interfere
      const userAgent = navigator.userAgent
      console.log("User Agent:", userAgent)

      // Check for MetaMask version
      if (window.ethereum.isMetaMask) {
        try {
          const version = await window.ethereum.request({
            method: "web3_clientVersion",
          })
          console.log("MetaMask version:", version)
        } catch (error) {
          console.log("Could not get MetaMask version:", error)
        }
      }
    } else {
      console.log("❌ Ethereum object not found")
    }
  } catch (error) {
    console.error("Error during interceptor check:", error)
  }

  console.groupEnd()

  return {
    hasEthereum: typeof window !== "undefined" && !!window.ethereum,
    isMetaMask: typeof window !== "undefined" && !!window.ethereum?.isMetaMask,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
  }
}

// Function to check if there's a global transaction hook
export async function checkForGlobalHooks() {
  console.group("🔍 Global Hooks Check")

  try {
    // Check for Next.js middleware
    console.log("Checking for Next.js middleware...")
    const hasMiddleware = typeof window !== "undefined" && window.location.pathname.includes("/_next/data")

    if (hasMiddleware) {
      console.warn("⚠️ Next.js middleware detected")
    } else {
      console.log("✅ No Next.js middleware detected")
    }

    // Check for service workers
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      if (registrations.length > 0) {
        console.warn("⚠️ Service workers detected:", registrations.length)
      } else {
        console.log("✅ No service workers detected")
      }
    }

    // Check for localStorage items that might indicate custom configurations
    if (typeof window !== "undefined" && window.localStorage) {
      const suspiciousKeys = Object.keys(localStorage).filter(
        (key) =>
          key.toLowerCase().includes("wallet") ||
          key.toLowerCase().includes("transaction") ||
          key.toLowerCase().includes("web3") ||
          key.toLowerCase().includes("ethereum"),
      )

      if (suspiciousKeys.length > 0) {
        console.warn("⚠️ Suspicious localStorage keys found:", suspiciousKeys)
      } else {
        console.log("✅ No suspicious localStorage keys found")
      }
    }
  } catch (error) {
    console.error("Error during global hooks check:", error)
  }

  console.groupEnd()
}

// Function to test a direct transaction
export async function testDirectTransaction(recipient: string) {
  console.group("🔍 Direct Transaction Test")

  try {
    if (typeof window === "undefined" || !window.ethereum) {
      console.log("❌ Ethereum object not available")
      return { success: false, error: "Ethereum object not available" }
    }

    console.log("Requesting accounts...")
    await window.ethereum.request({ method: "eth_requestAccounts" })

    // Get the current provider
    const provider = new (window as any).ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    // Get the current address
    const address = await signer.getAddress()
    console.log("Current address:", address)

    // Get the current network
    const network = await provider.getNetwork()
    console.log("Current network:", network.name, network.chainId)

    // Create a minimal transaction
    const tx = {
      to: recipient,
      value: (window as any).ethers.utils.parseEther("0.0001"),
      gasLimit: 21000,
    }

    console.log("Transaction object:", tx)

    // Send the transaction
    console.log("Sending transaction...")
    const txResponse = await signer.sendTransaction(tx)
    console.log("Transaction sent:", txResponse.hash)

    // Wait for confirmation
    console.log("Waiting for confirmation...")
    const receipt = await txResponse.wait()
    console.log("Transaction confirmed:", receipt)

    // Check if the recipient matches
    if (receipt.to.toLowerCase() !== recipient.toLowerCase()) {
      console.warn(`⚠️ RECIPIENT MISMATCH! Expected ${recipient} but got ${receipt.to}`)
      return {
        success: false,
        error: "Recipient mismatch",
        expected: recipient,
        actual: receipt.to,
        hash: receipt.transactionHash,
      }
    }

    console.log("✅ Transaction sent to correct recipient!")
    return {
      success: true,
      hash: receipt.transactionHash,
      recipient: receipt.to,
    }
  } catch (error) {
    console.error("Error during direct transaction test:", error)
    return { success: false, error: error.message }
  } finally {
    console.groupEnd()
  }
}

