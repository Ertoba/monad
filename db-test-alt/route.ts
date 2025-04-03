import { NextResponse } from "next/server"
import { sql, getPool } from "@/lib/db"

export async function GET() {
  try {
    console.log("Testing database connection with Neon Pool...")
    const startTime = Date.now()

    if (!sql) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection is not initialized",
          data: {
            connectionString: "Missing",
          },
        },
        { status: 500 },
      )
    }

    // Test with direct SQL query
    const result = await sql`SELECT NOW() as time`

    // Also test the pool connection
    let poolResult = null
    try {
      const pool = getPool()
      const client = await pool.connect()
      try {
        const res = await client.query("SELECT version()")
        poolResult = res.rows[0].version
      } finally {
        client.release()
      }
    } catch (poolError) {
      console.error("Pool connection test failed:", poolError)
    }

    const endTime = Date.now()
    const responseTime = endTime - startTime

    return NextResponse.json({
      success: true,
      message: "Database connection successful (using Neon serverless)",
      data: {
        time: result[0].time,
        responseTime: `${responseTime}ms`,
        poolTest: poolResult ? "Success" : "Failed",
        connectionString: "Configured", // Don't expose the actual string
      },
    })
  } catch (error) {
    console.error("Database connection test failed (Neon serverless):", error)

    // Extract useful information from the error
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
        data: {
          connectionString: process.env.POSTGRES_URL ? "Configured but may be invalid" : "Missing",
        },
      },
      { status: 500 },
    )
  }
}

