import { NextResponse } from "next/server"

export async function GET() {
  // Check if environment variables are set (not their values)
  const variables = {
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    TWITTER_CLIENT_ID: !!process.env.TWITTER_CLIENT_ID,
    TWITTER_CLIENT_SECRET: !!process.env.TWITTER_CLIENT_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
  }

  return NextResponse.json({
    variables,
    timestamp: new Date().toISOString(),
  })
}

