import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db-schema"

export async function GET() {
  try {
    const result = await initializeDatabase()

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 500 })
    }
  } catch (error) {
    console.error("Error in db-init route:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to initialize database",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

