import { ProfileSection } from "@/components/profile-section"
import { BottomNav } from "@/components/bottom-nav"

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E2E2E] to-black text-white overflow-x-hidden relative pb-20">
      <div className="relative z-10 pt-10">
        <div className="container mx-auto px-4 pt-8 pb-8">
          <ProfileSection />
        </div>
        <BottomNav />
      </div>
    </main>
  )
}

