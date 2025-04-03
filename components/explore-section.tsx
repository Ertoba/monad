"use client"

import { ActionCard } from "./action-card"
import { toast } from "@/hooks/use-toast"

export function ExploreSection() {
  const handleStart = (action: string) => {
    toast({
      title: "Action Started",
      description: `Starting ${action} action...`,
    })
  }

  return (
    <div className="mt-4 space-y-4 px-4">
      <ActionCard
        title="EXPLORE MONAD"
        subtitle="Visit Monad Explorer"
        reward="+75 VT"
        icon="/placeholder.svg?height=48&width=48"
        onClick={() => handleStart("exploring Monad")}
        link="https://explorer.monad.xyz/"
      />

      <ActionCard
        title="JOIN DISCORD"
        subtitle="Connect with the community"
        reward="+50 VT"
        icon="/placeholder.svg?height=48&width=48"
        onClick={() => handleStart("joining Discord")}
        link="https://discord.gg/monad"
      />

      <ActionCard
        title="FOLLOW TWITTER"
        subtitle="Stay updated with Monad news"
        reward="+25 VT"
        icon="/placeholder.svg?height=48&width=48"
        onClick={() => handleStart("following Twitter")}
        link="https://twitter.com/monad"
      />
    </div>
  )
}

