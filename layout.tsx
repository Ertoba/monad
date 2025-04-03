import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WalletProvider } from "@/contexts/wallet-context"
import { Toaster } from "@/components/ui/toaster"
import { TopNav } from "@/components/top-nav"
// Add this import at the top with other imports
import { initializeDatabase } from "@/lib/db"

// Add this code right after the imports, before the metadata definition
// Initialize database on server startup
initializeDatabase().then((success) => {
  console.log("Database initialization:", success ? "successful" : "failed")
})

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AncientMonad",
  description: "Bridge assets between Sepolia, Base Sepolia, and Monad",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gradient-dark text-white min-h-screen`}>
        <WalletProvider>
          <TopNav />
          <div className="pt-14">
            {" "}
            {/* Add padding to account for fixed top nav */}
            {children}
          </div>
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  )
}



import './globals.css'