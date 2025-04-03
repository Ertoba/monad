/**
 * Safely executes a database query with timeout and error handling
 * @param queryFn The database query function to execute
 * @param fallbackValue The fallback value to return if the query fails
 * @param timeoutMs The timeout in milliseconds
 * @returns The query result or fallback value
 */
export async function safeDbQuery<T>(queryFn: () => Promise<T>, fallbackValue: T, timeoutMs = 5000): Promise<T> {
  try {
    // Execute the query with a timeout
    const result = await Promise.race([
      queryFn(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Database query timeout")), timeoutMs)),
    ])

    return result
  } catch (error) {
    console.error("Database query failed:", error)
    return fallbackValue
  }
}

/**
 * Safely parses a database value with a fallback
 * @param value The value to parse
 * @param fallback The fallback value
 * @returns The parsed value or fallback
 */
export function safeDbValue<T>(value: any, fallback: T): T {
  if (value === undefined || value === null) {
    return fallback
  }
  return value as T
}

/**
 * Formats a wallet address for display
 * @param address The wallet address
 * @returns The formatted address
 */
export function formatWalletAddress(address: string): string {
  if (!address || address.length < 10) {
    return address || ""
  }
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

/**
 * Validates a referral code format
 * @param code The referral code to validate
 * @returns True if valid, false otherwise
 */
export function validateReferralCode(code: string): boolean {
  // Check if code is exactly 5 characters and contains only alphanumeric characters
  return /^[A-Z0-9]{5}$/.test(code)
}

/**
 * Generates a random alphanumeric string of specified length
 * @param length The length of the string to generate
 * @returns A random alphanumeric string
 */
export function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  return Array(length)
    .fill(0)
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join("")
}

/**
 * Handles database errors with detailed logging
 * @param error The error to handle
 * @param operation The operation that caused the error
 * @returns A user-friendly error message
 */
export function handleDbError(error: any, operation: string): string {
  // Log the detailed error for debugging
  console.error(`Database error during ${operation}:`, error)

  // Extract error code if available
  const errorCode = error.code || "UNKNOWN"

  // Return user-friendly message based on error type
  if (errorCode === "23505") {
    return "A record with this information already exists."
  } else if (errorCode === "23503") {
    return "Referenced record does not exist."
  } else if (errorCode === "42P01") {
    return "Database table not found. Please contact support."
  } else if (error.message?.includes("timeout")) {
    return "Database operation timed out. Please try again later."
  } else if (error.message?.includes("connection")) {
    return "Database connection error. Please try again later."
  }

  // Default message
  return "An unexpected database error occurred. Please try again later."
}

