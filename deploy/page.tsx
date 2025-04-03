import DeployInterface from "@/components/deploy-interface"
import { Navbar } from "@/components/navbar"
import { BottomNav } from "@/components/bottom-nav"
import { BoostTXpButton } from "@/components/boost-txp-button"
import { NewTxpButton } from "@/components/new-txp-button"

export default function DeployPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E2E2E] to-black text-white overflow-x-hidden relative pb-20">
      <div className="relative z-10">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-8 bg-[#E4E3E8]">
          {/* Add the new test button above the original */}
          <NewTxpButton />
          <div className="h-6"></div>
          <BoostTXpButton />
          <DeployInterface />
        </div>
        <BottomNav />
      </div>
    </main>
  )
}

