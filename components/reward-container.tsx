"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { RewardSubNav } from "./reward-sub-nav"
import { MintSection } from "./mint-section"
import { ExploreSection } from "./explore-section"
import { ReferralSection } from "./referral-section"

type TabType = "referral" | "mint" | "explore"

export function RewardContainer() {
  const [activeTab, setActiveTab] = useState<TabType>("referral")

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className="bg-gradient-to-b from-[#2E2E2E] to-[#111111] border border-gray-800/30 p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold text-white mb-1">Rewards</h2>
            <p className="text-sm text-gray-400">Explore rewards and opportunities</p>
          </div>

          {/* Tab Navigation */}
          <RewardSubNav activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab content */}
          <div className="bg-[#1A1A1A]/50 rounded-xl overflow-hidden pb-4">
            {activeTab === "referral" && <ReferralSection />}
            {activeTab === "mint" && <MintSection />}
            {activeTab === "explore" && <ExploreSection />}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

