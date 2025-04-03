"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ActionCardProps {
  title: string
  subtitle: string
  reward: string
  onClick: () => void
  icon?: string
  className?: string
  link?: string
  hideInReferral?: boolean
}

type ButtonState = "initial" | "loading" | "disabled" | "claimable" | "claimed"

export function ActionCard({
  title,
  subtitle,
  reward,
  onClick,
  icon = "/placeholder.svg?height=48&width=48",
  className,
  link = "https://testnet.monad.xyz/",
  hideInReferral = false,
}: ActionCardProps) {
  const [buttonState, setButtonState] = useState<ButtonState>("initial")

  useEffect(() => {
    if (buttonState === "loading") {
      // After animation (0.5s), set to disabled and open link
      const animationTimer = setTimeout(() => {
        window.open(link, "_blank")
        setButtonState("disabled")
      }, 500)

      // After 30 seconds, set to claimable
      const claimableTimer = setTimeout(() => {
        setButtonState("claimable")
      }, 30000)

      return () => {
        clearTimeout(animationTimer)
        clearTimeout(claimableTimer)
      }
    }
  }, [buttonState, link])

  const handleClick = () => {
    if (buttonState === "initial") {
      setButtonState("loading")
      // Removed the onClick() call to prevent notifications
    } else if (buttonState === "claimable") {
      setButtonState("claimed")
      // Still call onClick for claim action if needed
      onClick()
    }
  }

  // Return null if hideInReferral is true
  if (hideInReferral) {
    return null
  }

  return (
    <div
      className={cn(
        "bg-[#2A2A2A] rounded-2xl p-3 flex items-center justify-end",
        "border border-[#3A3A3A]",
        "w-full max-w-[360px] h-[50px] mx-auto mt-3",
        className,
      )}
    >
      <button
        onClick={handleClick}
        disabled={buttonState === "disabled" || buttonState === "claimed"}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-medium border transition-colors mr-2",
          "w-[60px]", // Fixed width to prevent resizing
          buttonState === "initial" && "bg-[#6266E4]/20 text-[#6266E4] border-[#6266E4]/30 hover:bg-[#6266E4]/30",
          buttonState === "loading" && "bg-[#6266E4]/20 text-[#6266E4] border-[#6266E4]/30",
          buttonState === "disabled" && "bg-gray-700/20 text-gray-500 border-gray-700/30 cursor-not-allowed",
          buttonState === "claimable" && "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30",
          buttonState === "claimed" && "bg-gray-700/20 text-gray-500 border-gray-700/30 cursor-not-allowed",
        )}
      >
        <div className="flex justify-center items-center w-full">
          {buttonState === "loading" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              {buttonState === "initial" && "START"}
              {buttonState === "disabled" && "START"}
              {buttonState === "claimable" && "CLAIM"}
              {buttonState === "claimed" && "CLAIMED"}
            </>
          )}
        </div>
      </button>
    </div>
  )
}

