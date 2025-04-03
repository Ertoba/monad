import { createPool } from "@vercel/postgres"
import { sql as vercelSql } from "@vercel/postgres"
import { neon, type Pool } from "@neondatabase/serverless"
import { safeDbQuery, safeDbValue, handleDbError } from "@/lib/dbUtils"

// Export the sql object from @vercel/postgres
export const sql = vercelSql

let pool: Pool | null = null

export function getPool(): Pool {
  if (pool) {
    return pool
  }

  const connectionString = process.env.POSTGRES_URL

  if (!connectionString) {
    throw new Error("POSTGRES_URL environment variable is not defined")
  }

  pool = neon(connectionString)
  return pool
}

export async function getPoolClient() {
  const dbPool = getDbPool()
  return await dbPool.connect()
}

// Get a database connection pool
export function getDbPool() {
  // Get the connection string from environment variables
  const connectionString = process.env.POSTGRES_URL

  if (!connectionString) {
    throw new Error("POSTGRES_URL environment variable is not defined")
  }

  // Create and return the connection pool
  return createPool({
    connectionString,
  })
}

export async function initializeDatabase() {
  try {
    // Test the database connection by running a simple query
    await sql`SELECT 1`
    return { success: true, message: "Database connection successful" }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return {
      success: false,
      message: "Database connection test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getLeaderboard(limit = 10) {
  try {
    const result = await safeDbQuery(
      () => sql`
        SELECT wallet_address, xp_total 
        FROM users 
        ORDER BY xp_total DESC 
        LIMIT ${limit}
      `,
      [],
    )
    return result
  } catch (error) {
    console.error("Failed to fetch leaderboard data:", error)
    return []
  }
}

export async function createOrUpdateReferral(userWallet: string, referrerCode?: string) {
  try {
    // Validate userWallet
    if (!userWallet) {
      throw new Error("User wallet address is required")
    }

    // Check if the user already exists
    const existingUser = await sql`SELECT id FROM users WHERE wallet_address = ${userWallet}`
    let userId: number

    if (existingUser.length > 0) {
      userId = existingUser[0].id
    } else {
      // Create a new user
      const newUser = await sql`
        INSERT INTO users (username, wallet_address) 
        VALUES (${userWallet}, ${userWallet})
        RETURNING id
      `
      userId = newUser[0].id
    }

    // If a referrer code is provided, try to use it
    if (referrerCode) {
      // Validate referrer code
      if (!/^[A-Z0-9]{5}$/.test(referrerCode)) {
        throw new Error("Invalid referrer code format")
      }

      // Get referrer's user ID
      const referrer = await sql`SELECT id FROM users WHERE username = ${referrerCode}`

      if (referrer.length === 0) {
        throw new Error("Invalid referrer code")
      }

      const referrerId = referrer[0].id

      // Check if the referral already exists
      const existingReferral = await sql`SELECT id FROM referrals WHERE referred_id = ${userId}`

      if (existingReferral.length === 0) {
        // Create a new referral
        await sql`
          INSERT INTO referrals (referrer_id, referred_id, code)
          VALUES (${referrerId}, ${userId}, ${generateRandomString(5)})
        `
      }
    }

    // Generate a unique referral code for the user
    let referralCodeGenerated = generateRandomString(5)
    let isCodeUnique = false

    while (!isCodeUnique) {
      const existingCode = await sql`SELECT id FROM users WHERE username = ${referralCodeGenerated}`
      if (existingCode.length === 0) {
        isCodeUnique = true
      } else {
        referralCodeGenerated = generateRandomString(5)
      }
    }

    // Update the user's username with the referral code
    await sql`UPDATE users SET username = ${referralCodeGenerated} WHERE id = ${userId}`

    return referralCodeGenerated
  } catch (error) {
    console.error("Failed to create or update referral:", error)
    throw new Error(handleDbError(error, "create or update referral"))
  }
}

export async function getUserReferralInfo(userWallet: string) {
  try {
    const result = await safeDbQuery(
      () => sql`
        SELECT 
          u.username as referral_code,
          r.code as referrer_code,
          u.twitter_connected,
          COALESCE(SUM(xp_events.xp_amount), 0) as xp
        FROM users u
        LEFT JOIN referrals r ON u.id = r.referred_id
        LEFT JOIN xp_events ON u.id = xp_events.user_id
        WHERE u.wallet_address = ${userWallet}
        GROUP BY u.username, r.code, u.twitter_connected
      `,
      [],
    )

    if (result.length === 0) {
      return null
    }

    return {
      referral_code: safeDbValue(result[0].referral_code, null),
      referrer_code: safeDbValue(result[0].referrer_code, null),
      twitter_connected: safeDbValue(result[0].twitter_connected, false),
      xp: safeDbValue(Number(result[0].xp), 0),
    }
  } catch (error) {
    console.error("Failed to get user referral info:", error)
    return null
  }
}

export async function connectTwitterAccount(userWallet: string) {
  try {
    // Update the user's twitter_connected field to true
    const result = await sql`
      UPDATE users
      SET twitter_connected = TRUE
      WHERE wallet_address = ${userWallet}
    `

    return result.count > 0
  } catch (error) {
    console.error("Failed to connect Twitter account:", error)
    return false
  }
}

export async function getUserXp(walletAddress: string) {
  try {
    const result = await safeDbQuery(
      () => sql`SELECT xp_total, claim_count, last_claimed_at FROM users WHERE wallet_address = ${walletAddress}`,
      null,
    )

    if (!result || result.length === 0) {
      return { xp_total: 0, claim_count: 0, last_claimed_at: null }
    }

    return {
      xp_total: safeDbValue(Number(result[0].xp_total), 0),
      claim_count: safeDbValue(Number(result[0].claim_count), 0),
      last_claimed_at: safeDbValue(result[0].last_claimed_at, null),
    }
  } catch (error) {
    console.error("Failed to get user XP:", error)
    return { xp_total: 0, claim_count: 0, last_claimed_at: null }
  }
}

export async function recordDailyClaim(walletAddress: string) {
  try {
    // Check if the user exists
    const existingUser = await sql`SELECT id, xp_total FROM users WHERE wallet_address = ${walletAddress}`

    if (existingUser.length === 0) {
      throw new Error("User not found")
    }

    const userId = existingUser[0].id
    const currentXp = Number(existingUser[0].xp_total) || 0

    // Update the user's XP and claim count
    const result = await sql`
      UPDATE users
      SET 
        xp_total = ${currentXp + 10},
        claim_count = claim_count + 1,
        last_claimed_at = NOW()
      WHERE id = ${userId}
      RETURNING xp_total, claim_count, last_claimed_at
    `

    if (result.length === 0) {
      throw new Error("Failed to record daily claim")
    }

    return {
      xp_total: safeDbValue(Number(result[0].xp_total), 0),
      claim_count: safeDbValue(Number(result[0].claim_count), 0),
      last_claimed_at: safeDbValue(result[0].last_claimed_at, null),
    }
  } catch (error) {
    console.error("Failed to record daily claim:", error)
    throw new Error(handleDbError(error, "record daily claim"))
  }
}

export async function canUserClaim(walletAddress: string) {
  try {
    const result = await safeDbQuery(
      () => sql`SELECT last_claimed_at FROM users WHERE wallet_address = ${walletAddress}`,
      null,
    )

    if (!result || result.length === 0) {
      return { canClaim: true, nextClaimTime: null }
    }

    const lastClaimedAt = result[0]?.last_claimed_at

    if (!lastClaimedAt) {
      return { canClaim: true, nextClaimTime: null }
    }

    const nextClaimTime = new Date(lastClaimedAt.getTime() + 24 * 60 * 60 * 1000) // 24 hours
    const now = new Date()

    return {
      canClaim: now >= nextClaimTime,
      nextClaimTime: nextClaimTime,
    }
  } catch (error) {
    console.error("Failed to check claim status:", error)
    return { canClaim: true, nextClaimTime: null }
  }
}

function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

