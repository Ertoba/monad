import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a balance with appropriate decimal places
 * @param balance The balance to format
 * @param decimals Number of decimal places to show
 * @returns Formatted balance string
 */
export function formatBalance(balance: string | number, decimals = 4): string {
  if (typeof balance === "string") {
    balance = Number.parseFloat(balance)
  }

  if (isNaN(balance)) {
    return "0.0000"
  }

  // Format with specified decimal places
  return balance.toFixed(decimals)
}

/**
 * Truncate an Ethereum address
 * @param address The address to truncate
 * @returns Truncated address (e.g., 0x1234...5678)
 */
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) {
    return address || ""
  }
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

