import { type NextRequest, NextResponse } from "next/server"
import { getLeaderboard } from "@/lib/db"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limit = Number.parseInt(searchParams.get("limit") || "10")

  try {
    const data = await getLeaderboard(limit)

    // Format addresses for display (e.g., 0x1234...5678)
    const formattedData = data.map((entry) => ({
      ...entry,
      wallet_address: formatAddress(entry.wallet_address),
    }))

    return NextResponse.json({ success: true, data: formattedData })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch leaderboard data" }, { status: 500 })
  }
}

// Helper function to format wallet addresses
function formatAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

