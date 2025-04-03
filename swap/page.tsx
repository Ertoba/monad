import SwapInterface from "@/components/swap-interface"
import { Navbar } from "@/components/navbar"
import { BottomNav } from "@/components/bottom-nav"

export default function SwapPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E2E2E] to-black text-white overflow-x-hidden relative pb-20">
      <div className="relative z-10">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-8 bg-[#E4E3E8]">
          <SwapInterface />
        </div>
        <BottomNav />
      </div>
    </main>
  )
}

