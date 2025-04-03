import { NextResponse } from "next/server"
import { getDbPool } from "@/lib/providers"
import { initializeDatabase } from "@/lib/db"

export async function GET() {
  try {
    // Simple query to check database connection
    const startTime = Date.now()

    // Attempt to initialize the database
    const initResult = await initializeDatabase()
    if (!initResult) {
      return NextResponse.json(
        {
          status: "error",
          database: "failed to initialize",
          error: "Database initialization failed",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    // Get the connection pool
    const pool = getDbPool()

    // Execute a simple query to test the connection
    const result = await pool.sql`SELECT NOW() as time, current_database() as database`

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status: "ok",
      database: "connected",
      responseTime: `${responseTime}ms`,
      timestamp: result.rows[0].time,
      databaseName: result.rows[0].database,
      environment: process.env.NODE_ENV || "unknown",
      serverTime: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database health check failed:", error)

    // Return a more detailed error response
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown database error",
        errorCode: error.code,
        errorDetail: error.detail,
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
        timestamp: new Date().toISOString(),
        hint: "Check your POSTGRES_URL environment variable and ensure NeonDB is running",
        hasPostgresUrl: !!process.env.POSTGRES_URL,
      },
      { status: 500 },
    )
  }
}

