"use client"

import { useState } from "react"
import { CircularProgress } from "@/components/circular-progress"
import { Button } from "@/components/ui/button"

export default function ProgressDemo() {
  const [progress, setProgress] = useState(0)

  // Simple controls
  const incrementProgress = () => {
    setProgress((prev) => Math.min(prev + 10, 100))
  }

  const decrementProgress = () => {
    setProgress((prev) => Math.max(prev - 10, 0))
  }

  const resetProgress = () => {
    setProgress(0)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-8">Circular Progress Demo</h1>

      <div className="w-full max-w-md aspect-square mb-8 flex items-center justify-center">
        <CircularProgress progress={progress} />
      </div>

      <div className="text-xl font-semibold mb-6">Progress: {progress}%</div>

      <div className="flex gap-4">
        <Button onClick={decrementProgress} variant="outline">
          Decrease
        </Button>

        <Button onClick={incrementProgress} variant="outline">
          Increase
        </Button>

        <Button onClick={resetProgress} variant="outline">
          Reset
        </Button>
      </div>
    </div>
  )
}

