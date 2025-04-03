import { ProgressCircle } from "@/components/progress-circle"
import { ExploreMonad } from "@/components/explore-monad"
import { BottomNav } from "@/components/bottom-nav"

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden relative pb-20 bg-gradient-to-b from-[#2E2E2E] to-black">
      {/* Main Content - Rearranged to move ProgressCircle higher */}
      <div className="container mx-auto px-4 pt-4">
        {" "}
        {/* Reduced top padding */}
        <div className="space-y-12 flex flex-col">
          <div className="order-1 mt-4">
            <ProgressCircle />
          </div>
          <div className="order-2 mt-8">
            <ExploreMonad />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </main>
  )
}

