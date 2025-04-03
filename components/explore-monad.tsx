"use client"

import { useState } from "react"
import { ChevronRight, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { BottomSheet } from "./ui/bottom-sheet"
import { BridgeSheet } from "./bridge-sheet"
import { SwapSheet } from "./swap-sheet"
import { DeploySheet } from "./deploy-sheet"

const exploreItems = [
  {
    id: "bridge",
    title: "Bridge to Monad",
    description: "Transfer tokens from Ethereum to Monad",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        <path
          d="M4 19h16M4 5h16M12 5v14M8 9l4-4 4 4M8 15l4 4 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "swap",
    title: "Swap Tokens",
    description: "Exchange one token for another",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        <path
          d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "deploy",
    title: "Deploy Contract",
    description: "Create your own token on Monad",
    icon: <FileText className="h-6 w-6 text-white" />,
  },
]

export function ExploreMonad() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null)

  const handleItemClick = (id: string) => {
    setActiveSheet(id)
  }

  const handleCloseSheet = () => {
    setActiveSheet(null)
  }

  const getSheetContent = () => {
    switch (activeSheet) {
      case "bridge":
        return <BridgeSheet />
      case "swap":
        return <SwapSheet />
      case "deploy":
        return <DeploySheet />
      default:
        return null
    }
  }

  const getSheetTitle = () => {
    const item = exploreItems.find((item) => item.id === activeSheet)
    return item ? item.title : ""
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#111111] rounded-xl overflow-hidden"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Explore Monad</h2>

          <div className="space-y-3">
            {exploreItems.map((item) => (
              <motion.div
                key={item.id}
                className="flex items-center p-3 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleItemClick(item.id)}
              >
                <div className="h-12 w-12 rounded-lg bg-[#252525] flex items-center justify-center mr-3">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-base text-white">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom Sheets */}
      <BottomSheet isOpen={activeSheet !== null} onClose={handleCloseSheet} title={getSheetTitle()}>
        {getSheetContent()}
      </BottomSheet>
    </div>
  )
}

