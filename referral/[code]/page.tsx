"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useWalletContext } from "@/contexts/wallet-context"
import { useXpTracker } from "@/hooks/useXpTracker"

export default function ReferralPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { address, connect } = useWalletContext()
  const { createReferral } = useXpTracker()
  const [isApplying, setIsApplying] = useState(false)
  const referralCode = params.code as string

  useEffect(() => {
    // Show toast when page loads with referral code
    toast({
      title: "Referral Code Detected",
      description: `You're using referral code: ${referralCode}`,
    })
  }, [referralCode, toast])

  const handleApplyReferralCode = async () => {
    if (!address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setIsApplying(true)
    try {
      await createReferral(referralCode)

      toast({
        title: "Success!",
        description: "Referral code applied successfully",
      })

      // Redirect to profile page
      router.push("/profile")
    } catch (error) {
      console.error("Failed to apply referral code:", error)
      toast({
        variant: "destructive",
        title: "Failed to Apply Code",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E2E2E] to-black text-white overflow-x-hidden relative pb-20">
      <div className="container mx-auto px-4 pt-20 flex flex-col items-center justify-center">
        <div className="bg-gradient-to-b from-[#2E2E2E] to-[#111111] border border-gray-800/30 p-6 rounded-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">You've Been Invited!</h1>
            <p className="text-gray-400">You're using a referral code to join AncientMonad</p>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-4 mb-6">
            <div className="text-center mb-2">
              <span className="text-sm text-gray-400">Referral Code</span>
            </div>
            <div className="text-2xl font-bold text-center text-[#6266E4]">{referralCode}</div>
          </div>

          {!address ? (
            <Button onClick={connect} className="w-full bg-[#6266E4] hover:bg-[#6266E4]/90 text-white">
              Connect Wallet
            </Button>
          ) : (
            <Button
              onClick={handleApplyReferralCode}
              disabled={isApplying}
              className="w-full bg-[#6266E4] hover:bg-[#6266E4]/90 text-white"
            >
              {isApplying ? "Applying..." : "Apply Referral Code"}
            </Button>
          )}

          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => router.push("/")} className="text-gray-400 hover:text-white">
              Skip and continue to app
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

