import { sql } from "@/lib/db"

export async function initializeDatabase() {
  try {
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255),
        wallet_address VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create transactions table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        tx_hash VARCHAR(255),
        amount DECIMAL(18, 8),
        token_symbol VARCHAR(10),
        status VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create xp_events table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS xp_events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        event_type VARCHAR(50) NOT NULL,
        xp_amount INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create referrals table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        referrer_id INTEGER REFERENCES users(id),
        referred_id INTEGER REFERENCES users(id),
        code VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(referred_id)
      )
    `

    return {
      success: true,
      message: "Database schema initialized successfully",
      tables: ["users", "transactions", "xp_events", "referrals"],
    }
  } catch (error) {
    console.error("Failed to initialize database schema:", error)
    return {
      success: false,
      message: "Failed to initialize database schema",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

