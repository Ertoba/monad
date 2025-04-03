"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Gift, User } from "lucide-react"

const navItems = [
  { id: "home", label: "", icon: Home, href: "/" },
  { id: "reward", label: "", icon: Gift, href: "/reward", isMain: true },
  { id: "profile", label: "", icon: User, href: "/profile" },
]

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111111]/90 backdrop-blur-sm border-t border-white/10 px-4 py-2 z-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center gap-1 ${item.isMain ? "relative -mt-6" : ""}`}
              >
                <div
                  className={`
                    ${item.isMain ? "p-4 bg-[#1A1A1A] rounded-full shadow-lg" : "p-2"}
                    ${active ? "text-white" : "text-gray-500"}
                    transition-colors duration-200
                  `}
                >
                  <Icon className={`h-6 w-6 ${item.isMain ? "h-7 w-7" : ""}`} />
                </div>
                {item.label && (
                  <span
                    className={`
                      text-xs font-medium
                      ${active ? "text-white" : "text-gray-500"}
                    `}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

