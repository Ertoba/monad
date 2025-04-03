"use client"

import { useState, useEffect } from "react"

interface CircularProgressProps {
  progress?: number // პროცენტის მნიშვნელობა (0-100)
  size?: number // SVG ზომა
  strokeWidth?: number // ხაზის სისქე
  className?: string
  transactionActive?: boolean // უნდა დაიწყოს თუ არა პროგრესი
}

export function CircularProgress({
  progress = 0,
  size = 200,
  strokeWidth = 12,
  className = "",
  transactionActive = false, // ტრანზაქცია აქტიურია თუ არა
}: CircularProgressProps) {
  const [currentProgress, setCurrentProgress] = useState(0) // ახლა იწყება ნამდვილი 0-დან

  const safeSize = size ?? 200
  const safeStrokeWidth = strokeWidth ?? 12
  const radius = (safeSize - safeStrokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // ნორმალიზებული progress (0-100 ფარგლებში)
  const normalizedProgress = Math.max(0, Math.min(100, currentProgress))
  const offset = circumference * (1 - normalizedProgress / 100)

  // ტრანზაქციის დაწყებისას პროგრესის გაშვება
  useEffect(() => {
    if (transactionActive) {
      setCurrentProgress(0) // **წრიული პროგრესი იწყება ნულიდან!**

      const interval = setInterval(() => {
        setCurrentProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100 // **100%-ზე გაჩერდება**
          }
          return prev + 1 // **1%-ით ზრდა ყოველ 50ms**
        })
      }, 50)

      return () => clearInterval(interval)
    }
  }, [transactionActive]) // **ამოწმებს მხოლოდ, როცა ტრანზაქცია იწყება**

  return (
    <svg width={safeSize} height={safeSize} className={className}>
      {/* Background Circle */}
      <circle
        cx={safeSize / 2}
        cy={safeSize / 2}
        r={radius}
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth={safeStrokeWidth}
        fill="none"
      />

      {/* Progress Circle */}
      <circle
        cx={safeSize / 2}
        cy={safeSize / 2}
        r={radius}
        stroke="white"
        strokeWidth={safeStrokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        fill="none"
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 0.05s linear",
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
        }}
      />
    </svg>
  )
}

