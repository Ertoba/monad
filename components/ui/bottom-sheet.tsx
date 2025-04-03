"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { X } from "lucide-react"

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Only close if clicking outside AND not on any element with data-keep-open attribute
      if (
        sheetRef.current &&
        !sheetRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[data-keep-open="true"]')
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "auto"
    }
  }, [isOpen, onClose])

  // Handle drag to dismiss
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose()
    }
  }

  // Add a stopPropagation handler to prevent closing when clicking inside
  const handleSheetClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />

          {/* Bottom Sheet - Increased height and adjusted initial position */}
          <motion.div
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-gradient-to-b from-[#2E2E2E] to-black max-h-[90vh] h-[85vh] overflow-auto"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8,
              duration: 0.4,
            }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            onClick={handleSheetClick}
            data-keep-open="true"
          >
            {/* Drag handle - Made more subtle */}
            <div className="w-full flex justify-center pt-2 pb-1">
              <div className="w-12 h-1 bg-gray-500/40 rounded-full" />
            </div>

            {/* Header - Reduced size */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <h2 className="text-base font-bold text-white">{title}</h2>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="rounded-full p-1 bg-[#222222] hover:bg-[#333333] transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Content - Improved padding and spacing */}
            <div className="p-4 pb-10 relative">
              {/* Blur overlay with "Under Development" text and loading animation */}
              <div className="absolute inset-0 bg-black/15 backdrop-blur-md z-10 flex items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex items-center gap-3 px-5 py-3 bg-black/30 backdrop-blur-md rounded-full border border-white/10">
                  <div
                    className="animate-spin rounded-full border-2 border-gray-300 border-t-white h-4 w-4"
                    style={{ animationDuration: "0.6s" }}
                  ></div>
                  <span className="text-white font-semibold">Under Development</span>
                </div>
              </div>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

