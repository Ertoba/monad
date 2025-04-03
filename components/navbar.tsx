"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { Menu } from "lucide-react"
import { motion } from "framer-motion"

const navigationItems = [
  { href: "/", label: "Bridge" },
  { href: "/swap", label: "Swap" },
  { href: "/deploy", label: "Deploy" },
  { href: "/reward", label: "Reward" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  return (
    <header className="border-b border-gray-200 bg-[#F5F5F5] fixed top-0 left-0 right-0 z-[100] shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold font-gothic tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[#6266E4] to-[#4A4FCF] hover:from-[#4A4FCF] hover:to-[#6266E4] transition-all duration-500">
                AncientMonad
              </span>
            </Link>
            <nav className="hidden md:flex">
              <ul className="flex items-center gap-8">
                {navigationItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`relative flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? "text-[#6266E4] bg-[#EBEBED]"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <span className={`${isActive(item.href) ? "font-semibold" : ""}`}>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <ConnectWalletButton />
            </div>
            <div className="md:hidden relative">
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>

              {isOpen && (
                <motion.div
                  className="absolute top-12 right-0 w-64 bg-[#E4E3E8]/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/20 p-4 z-[110]"
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <nav className="flex flex-col gap-3">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive(item.href)
                            ? "text-[#6266E4] bg-[#EBEBED] font-semibold"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="pt-2 border-t border-gray-200">
                      <ConnectWalletButton />
                    </div>
                  </nav>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

