"use client"
import { RewardContainer } from "@/components/reward-container"
import { BottomNav } from "@/components/bottom-nav"
import { ConnectionStatus } from "@/components/connection-status"
import { useDatabaseStatus } from "@/hooks/useDatabaseStatus"

export default function RewardPage() {
  const { isConnected, checkConnection, retryCount } = useDatabaseStatus()

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E2E2E] to-black text-white overflow-x-hidden relative pb-20">
      <div className="relative z-10 pt-4">
        {" "}
        {/* Reduced top padding */}
        <div className="container mx-auto px-4 pt-4 pb-8">
          {" "}
          {/* Reduced top padding */}
          {/* Connection status banner */}
          <div className="mb-4 px-4">
            <ConnectionStatus
              isConnected={isConnected}
              onRetry={checkConnection}
              retryCount={retryCount}
              className="max-w-md mx-auto"
            />
          </div>
          <RewardContainer />
        </div>
        <BottomNav />
      </div>
    </main>
  )
}

