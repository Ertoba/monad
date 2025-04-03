"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Rocket, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DeployInterface() {
  const [ticker, setTicker] = useState("")
  const [tokenName, setTokenName] = useState("")
  const [isDeploying, setIsDeploying] = useState(false)
  const [error, setError] = useState("")

  const handleDeploy = async () => {
    if (!ticker.trim() || !tokenName.trim()) {
      setError("Please fill in all fields")
      return
    }

    if (ticker.length > 5) {
      setError("Ticker should be 5 characters or less")
      return
    }

    setError("")
    setIsDeploying(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      // Here you would actually deploy the token
      console.log("Deploying token:", { ticker, tokenName })
    } catch (err) {
      setError("Failed to deploy token. Please try again.")
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-[#F5F5F5] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-[#6266E4]" />
            <h2 className="text-sm font-medium text-gray-800">Deploy Token</h2>
          </div>

          {error && (
            <Alert variant="destructive" className="py-2 text-xs bg-red-100 border-red-200 text-red-800">
              <AlertCircle className="h-3 w-3" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ticker" className="text-xs text-gray-600">
                Token Ticker
              </Label>
              <Input
                id="ticker"
                placeholder="e.g. BTC"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="bg-[#252525] border-gray-800 text-[#E4E3E8] text-base h-10 rounded-lg"
                maxLength={5}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tokenName" className="text-xs text-gray-600">
                Token Name
              </Label>
              <Input
                id="tokenName"
                placeholder="e.g. Bitcoin"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="bg-[#252525] border-gray-800 text-[#E4E3E8] text-base h-10 rounded-lg"
              />
            </div>
          </div>

          <Button
            onClick={handleDeploy}
            disabled={isDeploying || !ticker || !tokenName}
            className="w-full bg-[#6266E4] hover:bg-[#6266E4]/90 text-white font-medium h-8 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeploying ? (
              <>
                <Rocket className="mr-2 h-4 w-4 animate-pulse" />
                Deploying...
              </>
            ) : (
              "Deploy Token"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

