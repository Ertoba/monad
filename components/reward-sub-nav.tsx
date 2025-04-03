"use client"

import { cn } from "@/lib/utils"

type TabType = "referral" | "mint" | "explore"

interface RewardSubNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function RewardSubNav({ activeTab, onTabChange }: RewardSubNavProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-[#1A1A1A] rounded-full p-2 flex w-full max-w-sm">
        <button
          onClick={() => onTabChange("referral")}
          className={cn(
            "flex-1 px-4 py-3 rounded-full text-sm font-medium transition-colors",
            activeTab === "referral" ? "bg-[#333333] text-white" : "text-gray-400 hover:text-white",
          )}
        >
          Referral
        </button>
        <button
          onClick={() => onTabChange("mint")}
          className={cn(
            "flex-1 px-4 py-3 rounded-full text-sm font-medium transition-colors",
            activeTab === "mint" ? "bg-[#333333] text-white" : "text-gray-400 hover:text-white",
          )}
        >
          Mint
        </button>
        <button
          onClick={() => onTabChange("explore")}
          className={cn(
            "flex-1 px-4 py-3 rounded-full text-sm font-medium transition-colors",
            activeTab === "explore" ? "bg-[#333333] text-white" : "text-gray-400 hover:text-white",
          )}
        >
          Explore
        </button>
      </div>
    </div>
  )
}

