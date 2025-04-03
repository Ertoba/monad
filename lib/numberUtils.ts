/**
 * Safely parses a value to a number, returning a default value if parsing fails
 * @param value The value to parse
 * @param defaultValue The default value to return if parsing fails
 * @returns A number
 */
export function safeNumber(value: any, defaultValue = 0): number {
  if (value === null || value === undefined) {
    return defaultValue
  }

  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value))
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Safely calculates a percentage, avoiding division by zero
 * @param numerator The numerator
 * @param denominator The denominator
 * @param scale The scale factor (default: 100 for percentage)
 * @returns A percentage value
 */
export function safePercentage(numerator: number, denominator: number, scale = 100): number {
  const safeNumerator = safeNumber(numerator)
  const safeDenominator = safeNumber(denominator)

  if (safeDenominator === 0) {
    return 0
  }

  return Math.min(scale, Math.max(0, (safeNumerator / safeDenominator) * scale))
}

/**
 * Safely formats a number with commas for thousands
 * @param value The value to format
 * @param defaultValue The default value to return if formatting fails
 * @returns A formatted string
 */
export function formatNumber(value: any, defaultValue = "0"): string {
  try {
    const num = safeNumber(value)
    return num.toLocaleString()
  } catch (e) {
    return defaultValue
  }
}

