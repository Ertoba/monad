"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Twitter } from "lucide-react"

export default function SignIn() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get callbackUrl from query parameters
  const callbackUrl = searchParams?.get("callbackUrl") || "/"

  // Auto-redirect to Twitter OAuth
  useEffect(() => {
    const autoSignIn = async () => {
      setIsLoading(true)
      try {
        await signIn("twitter", { callbackUrl })
      } catch (err) {
        setError("Failed to connect to Twitter. Please try again.")
        setIsLoading(false)
      }
    }

    // Small delay to allow the page to render first
    const timer = setTimeout(() => {
      autoSignIn()
    }, 500)

    return () => clearTimeout(timer)
  }, [callbackUrl])

  // Handle manual sign in
  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("twitter", { callbackUrl })
    } catch (err) {
      setError("Failed to connect to Twitter. Please try again.")
      setIsLoading(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    router.push("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark p-4">
      <div className="w-full max-w-md rounded-xl bg-[#1A1A1A] p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-white">Connect Twitter</h1>
          <p className="text-gray-400">You're being redirected to Twitter to connect your account.</p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-400">{error}</div>}

        <div className="space-y-4">
          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full bg-[#1da1f2] hover:bg-[#1a94e1] text-white"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connecting...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Twitter className="mr-2 h-4 w-4" />
                Connect with Twitter
              </div>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full border-gray-700 text-gray-400 hover:bg-[#252525] hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

