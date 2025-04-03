"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Rocket, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DeploySheet() {
  const [ticker, setTicker] = useState("")
  const [tokenName, setTokenName] = useState("")
  const [totalSupply, setTotalSupply] = useState("")
  const [isDeploying, setIsDeploying] = useState(false)
  const [error, setError] = useState("")

  const handleDeploy = async () => {
    if (!ticker.trim() || !tokenName.trim() || !totalSupply.trim()) {
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
      console.log("Deploying token:", { ticker, tokenName, totalSupply })
    } catch (err) {
      setError("Failed to deploy token. Please try again.")
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto" data-keep-open="true" onClick={(e) => e.stopPropagation()}>
      <div className="space-y-6">
        <div className="flex items-center gap-2 bg-[#1A1A1A] p-2.5 rounded-lg">
          <Rocket className="h-4 w-4 text-[#6266E4]" />
          <h2 className="text-sm font-medium text-white">Create Your Token</h2>
        </div>

        {error && (
          <Alert variant="destructive" className="py-2 text-xs bg-red-900/30 border-red-800/50 text-red-300">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ticker" className="text-sm text-gray-300 font-medium">
              Token Ticker (Symbol)
            </Label>
            <Input
              id="ticker"
              placeholder="e.g. BTC"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="bg-[#252525] border-gray-800 text-[#E4E3E8] text-base h-9 rounded-lg px-2.5"
              style={{ fontSize: "16px" }}
              maxLength={5}
            />
            <div className="text-xs text-gray-500 px-1">Maximum 5 characters, e.g., BTC, BTC, USDT</div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tokenName" className="text-sm text-gray-300 font-medium">
              Token Name
            </Label>
            <Input
              id="tokenName"
              placeholder="e.g. Bitcoin"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="bg-[#252525] border-gray-800 text-[#E4E3E8] text-base h-9 rounded-lg px-2.5"
              style={{ fontSize: "16px" }}
            />
            <div className="text-xs text-gray-500 px-1">Full name of your token, e.g., Bitcoin, Ethereum</div>
          </div>

          {/* Added total supply field */}
          <div className="space-y-1.5">
            <Label htmlFor="totalSupply" className="text-sm text-gray-300 font-medium">
              Total Supply
            </Label>
            <Input
              id="totalSupply"
              placeholder="e.g. 1000000"
              value={totalSupply}
              onChange={(e) => setTotalSupply(e.target.value)}
              className="bg-[#252525] border-gray-800 text-[#E4E3E8] text-base h-9 rounded-lg px-2.5"
              style={{ fontSize: "16px" }}
            />
            <div className="text-xs text-gray-500 px-1">The total number of tokens that will ever exist</div>
          </div>
        </div>

        {/* Additional information - More compact */}
        <div className="flex items-start gap-2 bg-[#1A1A1A] rounded-lg p-2.5 text-xs text-gray-400">
          <Info className="h-3.5 w-3.5 text-[#6266E4] mt-0.5 flex-shrink-0" />
          <p>
            Deploying a token requires a small amount of MON for gas fees. Your token will be fully compatible with the
            Monad ecosystem.
          </p>
        </div>

        {/* Deploy Button - Adjusted for consistency */}
        <Button
          onClick={handleDeploy}
          disabled={isDeploying || !ticker || !tokenName || !totalSupply}
          className="w-full bg-gradient-to-r from-[#6266E4] to-[#4A4FCF] hover:from-[#4A4FCF] hover:to-[#6266E4] text-white font-medium h-10 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeploying ? (
            <>
              <Rocket className="mr-2 h-4 w-4 animate-pulse" />
              Deploying Token...
            </>
          ) : (
            "Deploy Token"
          )}
        </Button>
      </div>
    </div>
  )
}

