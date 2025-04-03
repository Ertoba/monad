import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  const startTime = Date.now()

  try {
    // Test the database connection by running a simple query
    const result = await sql`SELECT NOW() as time`
    const responseTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        time: result[0]?.time,
        responseTime: `${responseTime}ms`,
        connectionString: process.env.POSTGRES_URL ? "Configured" : "Not configured",
        environment: process.env.NODE_ENV || "Not set",
      },
    })
  } catch (error) {
    console.error("Database connection test failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Database connection test failed",
        error: error instanceof Error ? error.message : "Unknown error",
        data: {
          connectionString: process.env.POSTGRES_URL ? "Configured" : "Not configured",
          environment: process.env.NODE_ENV || "Not set",
        },
      },
      { status: 500 },
    )
  }
}

