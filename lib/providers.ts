import { ethers } from "ethers"
import { createPool, type Pool } from "@vercel/postgres"

// Singleton pattern for database connection pool
let dbPool: Pool | null = null
let lastConnectionAttempt = 0
const CONNECTION_COOLDOWN = 5000 // 5 seconds between connection attempts

/**
 * Get a database connection pool (singleton) with improved error handling
 * @returns PostgreSQL connection pool
 */
export function getDbPool(): Pool {
  const now = Date.now()

  // Return existing pool if it exists and is not in a reconnection cooldown period
  if (dbPool && now - lastConnectionAttempt > CONNECTION_COOLDOWN) {
    return dbPool
  }

  // Update last connection attempt timestamp
  lastConnectionAttempt = now

  const connectionString = process.env.POSTGRES_URL

  if (!connectionString) {
    console.error("POSTGRES_URL environment variable is not defined")
    throw new Error("POSTGRES_URL environment variable is not defined")
  }

  // Validate connection string format
  if (!connectionString.startsWith("postgres://") && !connectionString.startsWith("postgresql://")) {
    console.error("Invalid POSTGRES_URL format. It should start with postgres:// or postgresql://")
    throw new Error("Invalid POSTGRES_URL format. It should start with postgres:// or postgresql://")
  }

  console.log(`Creating database connection pool at ${new Date().toISOString()}`)

  try {
    dbPool = createPool({
      connectionString,
      // Add connection pool configuration
      max: 10, // Maximum number of clients
      connectionTimeoutMillis: 5000, // Connection timeout
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
    })

    console.log("Database connection pool created successfully")
    return dbPool
  } catch (error) {
    console.error("Failed to create database connection pool:", error)
    // Reset the pool to null to allow future retries
    dbPool = null
    throw error
  }
}

export function getMonadProvider() {
  return new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz/")
}

export function getMonadWebProvider() {
  if (typeof window === "undefined" || !window.ethereum) return null
  return new ethers.BrowserProvider(window.ethereum)
}

