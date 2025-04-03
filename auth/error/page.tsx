"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthError() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string>("Authentication failed")

  useEffect(() => {
    // Get error details from URL
    const error = searchParams?.get("error")
    if (error) {
      switch (error) {
        case "Callback":
          setErrorMessage("Failed to complete authentication with Twitter")
          break
        case "AccessDenied":
          setErrorMessage("You denied access to your Twitter account")
          break
        case "Configuration":
          setErrorMessage("There's an issue with the Twitter authentication configuration")
          break
        default:
          setErrorMessage(`Authentication error: ${error}`)
      }
    }
  }, [searchParams])

  // Handle retry
  const handleRetry = () => {
    router.push("/auth/signin")
  }

  // Handle return to home
  const handleReturnHome = () => {
    router.push("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark p-4">
      <div className="w-full max-w-md rounded-xl bg-[#1A1A1A] p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center justify-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white">Authentication Error</h1>
          <p className="text-center text-gray-400">{errorMessage}</p>
        </div>

        <div className="space-y-4">
          <Button onClick={handleRetry} className="w-full bg-[#6266E4] hover:bg-[#5254C5] text-white">
            Try Again
          </Button>

          <Button
            variant="outline"
            onClick={handleReturnHome}
            className="w-full border-gray-700 text-gray-400 hover:bg-[#252525] hover:text-white"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

