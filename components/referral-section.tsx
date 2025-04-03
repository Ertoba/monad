"use client"

import { useState } from "react"
import { Copy, Share2, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ActionCard } from "./action-card"
import { useWalletContext } from "@/contexts/wallet-context"
import { useXpTracker } from "@/hooks/useXpTracker"
import { Input } from "@/components/ui/input"

export function ReferralSection() {
  const { toast } = useToast()
  const { address } = useWalletContext()
  const { xpData, createReferral, connectTwitter } = useXpTracker()
  const [referrerCode, setReferrerCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConnectingTwitter, setIsConnectingTwitter] = useState(false)

  // Generate referral link based on user's referral code
  const referralLink = xpData.referralCode ? `https://ancientmonad.xyz/referral/${xpData.referralCode}` : ""

  const copyToClipboard = () => {
    if (!referralLink) {
      toast({
        variant: "destructive",
        title: "No Referral Code",
        description: "Connect Twitter first to get your referral code",
      })
      return
    }

    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        toast({
          title: "Link Copied",
          description: "Referral link copied to clipboard",
          className: "bg-[#1C1C1C] border-gray-800 text-white",
        })
      })
      .catch((err) => {
        console.error("Failed to copy link:", err)
        toast({
          variant: "destructive",
          title: "Copy Failed",
          description: "Could not copy the referral link",
        })
      })
  }

  const handleShare = () => {
    if (!referralLink) {
      toast({
        variant: "destructive",
        title: "No Referral Code",
        description: "Connect Twitter first to get your referral code",
      })
      return
    }

    if (navigator.share) {
      navigator.share({
        title: "Join Monad with my referral",
        text: "Use my referral link to join Monad and get rewards!",
        url: referralLink,
      })
    } else {
      copyToClipboard()
    }
  }

  // Handle Twitter connection
  const handleConnectTwitter = async () => {
    if (!address || isConnectingTwitter || xpData.twitterConnected) return

    setIsConnectingTwitter(true)
    try {
      // In a real implementation, this would initiate the OAuth flow
      // For now, we'll simulate it with a mock token
      const mockTwitterToken = "mock_twitter_token_" + Date.now()

      await connectTwitter(mockTwitterToken)

      toast({
        title: "Twitter Connected",
        description: "Your Twitter account has been successfully connected!",
      })
    } catch (error) {
      console.error("Twitter connection failed:", error)
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect Twitter account",
      })
    } finally {
      setIsConnectingTwitter(false)
    }
  }

  // Handle referral code submission
  const handleSubmitReferrerCode = async () => {
    if (!address || isSubmitting || !referrerCode) return

    setIsSubmitting(true)
    try {
      await createReferral(referrerCode)

      toast({
        title: "Referral Code Applied",
        description: "The referral code has been successfully applied!",
      })

      // Clear the input
      setReferrerCode("")
    } catch (error) {
      console.error("Failed to apply referral code:", error)
      toast({
        variant: "destructive",
        title: "Failed to Apply Code",
        description: error instanceof Error ? error.message : "Failed to apply referral code",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium mb-2">Referral Program</h3>
        <p className="text-sm text-white/60">Invite friends and earn rewards when they join Monad</p>
      </div>

      {/* Twitter Connection Section */}
      {!xpData.twitterConnected && (
        <div className="bg-[#252525]/70 rounded-lg p-4 mb-6">
          <div className="text-center mb-3">
            <h4 className="text-sm font-medium text-white">Connect Twitter to Get Started</h4>
            <p className="text-xs text-gray-400 mt-1">
              Connect your Twitter account to get a referral code and start earning rewards
            </p>
          </div>

          <Button
            onClick={handleConnectTwitter}
            disabled={isConnectingTwitter}
            className="w-full bg-[#1da1f2] hover:bg-[#1a94e1] text-white"
          >
            {isConnectingTwitter ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Connecting...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Twitter className="h-4 w-4 mr-2" />
                Connect Twitter
              </div>
            )}
          </Button>
        </div>
      )}

      {/* Enter Referrer Code Section */}
      {!xpData.referrerCode && (
        <div className="bg-[#252525]/70 rounded-lg p-4 mb-6">
          <div className="text-center mb-3">
            <h4 className="text-sm font-medium text-white">Have a Referral Code?</h4>
            <p className="text-xs text-gray-400 mt-1">Enter a friend's referral code to help them earn rewards</p>
          </div>

          <div className="flex gap-2">
            <Input
              value={referrerCode}
              onChange={(e) => setReferrerCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="bg-[#1A1A1A] border-gray-700 text-white"
              maxLength={5}
            />
            <Button
              onClick={handleSubmitReferrerCode}
              disabled={isSubmitting || !referrerCode}
              className="bg-[#6266E4] hover:bg-[#6266E4]/90 text-white"
            >
              {isSubmitting ? "Applying..." : "Apply"}
            </Button>
          </div>
        </div>
      )}

      {/* Referral Link Section - Only show if user has a referral code */}
      {xpData.referralCode && (
        <div className="bg-[#252525]/70 rounded-lg p-4 mb-6">
          <div className="bg-[#1A1A1A] rounded-lg p-3 flex items-center mb-3">
            <div className="flex-1 truncate text-xs mr-2">{referralLink}</div>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={copyToClipboard}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button
            className="w-full px-3 py-1.5 h-8 text-xs bg-[#6266E4]/20 text-[#6266E4] rounded-lg font-medium border border-[#6266E4]/30 hover:bg-[#6266E4]/30 transition-colors"
            onClick={handleShare}
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Share Referral Link
          </Button>
        </div>
      )}

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#252525]/70 rounded-lg p-3">
          <div className="text-sm text-gray-400">Referral XP</div>
          <div className="text-xl font-bold">{xpData.referralXp || 0}</div>
        </div>
        <div className="bg-[#252525]/70 rounded-lg p-3">
          <div className="text-sm text-gray-400">Status</div>
          <div className="text-xl font-bold">
            {xpData.twitterConnected ? (
              <span className="text-green-400">Active</span>
            ) : (
              <span className="text-yellow-400">Inactive</span>
            )}
          </div>
        </div>
      </div>

      {/* Referral Actions */}
      <div className="space-y-4">
        <ActionCard
          title="INVITE FRIENDS"
          subtitle="Invite 3 friends"
          reward="+300 XP"
          onClick={() => {
            if (xpData.referralCode) {
              handleShare()
            } else {
              toast({
                variant: "destructive",
                title: "No Referral Code",
                description: "Connect Twitter first to get your referral code",
              })
            }
          }}
        />
      </div>
    </div>
  )
}

