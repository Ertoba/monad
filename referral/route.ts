import { type NextRequest, NextResponse } from "next/server"
import { createOrUpdateReferral, getUserReferralInfo } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { userWallet, referrerCode } = await request.json()

    if (!userWallet) {
      return NextResponse.json({ success: false, error: "User wallet address is required" }, { status: 400 })
    }

    // Create or update referral
    const referralCode = await createOrUpdateReferral(userWallet, referrerCode)

    return NextResponse.json({
      success: true,
      data: {
        referralCode,
        userWallet,
      },
    })
  } catch (error) {
    console.error("Error creating referral:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userWallet = searchParams.get("userWallet")

    if (!userWallet) {
      return NextResponse.json({ success: false, error: "User wallet address is required" }, { status: 400 })
    }

    // Get user's referral info
    const referralInfo = await getUserReferralInfo(userWallet)

    if (!referralInfo) {
      return NextResponse.json(
        {
          success: false,
          error: "No referral information found for this wallet",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: referralInfo,
    })
  } catch (error) {
    console.error("Error fetching referral info:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

