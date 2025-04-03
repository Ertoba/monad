"use client"

import { ActionCard } from "./action-card"
import { toast } from "@/hooks/use-toast"

export function MintSection() {
  const handleStart = (action: string) => {
    toast({
      title: "Action Started",
      description: `Starting ${action} action...`,
    })
  }

  return (
    <div className="mt-4 space-y-4 px-4">
      <ActionCard
        title="MINT NFT"
        subtitle="Mint your first NFT"
        reward="+50 VT"
        icon="/placeholder.svg?height=48&width=48"
        onClick={() => handleStart("NFT minting")}
        showMonadText={true}
      />

      <ActionCard
        title="MINT COLLECTION"
        subtitle="Create a collection of 3 NFTs"
        reward="+100 VT"
        icon="/placeholder.svg?height=48&width=48"
        onClick={() => handleStart("collection minting")}
      />

      <ActionCard
        title="PREMIUM MINT"
        subtitle="Mint a premium NFT"
        reward="+200 VT"
        icon="/placeholder.svg?height=48&width=48"
        onClick={() => handleStart("premium minting")}
      />
    </div>
  )
}

