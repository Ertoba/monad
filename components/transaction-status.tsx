"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import type { Chain, Token } from "@/lib/data"

interface TransactionStatusProps {
  state: "pending" | "success" | "error" | null
  sourceChain: Chain
  destinationChain: Chain
  token: Token
  amount: string
  onClose: () => void
}

export function TransactionStatus({
  state,
  sourceChain,
  destinationChain,
  token,
  amount,
  onClose,
}: TransactionStatusProps) {
  const getStatusIcon = () => {
    switch (state) {
      case "pending":
        return <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "error":
        return <AlertCircle className="h-6 w-6 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (state) {
      case "pending":
        return "Transaction in progress"
      case "success":
        return "Transaction successful"
      case "error":
        return "Transaction failed"
      default:
        return ""
    }
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h3 className="font-medium">{getStatusText()}</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Amount</span>
            <span className="text-sm">
              {amount} {token.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">From</span>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                {sourceChain.icon}
              </div>
              <span className="text-sm">{sourceChain.name}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">To</span>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                {destinationChain.icon}
              </div>
              <span className="text-sm">{destinationChain.name}</span>
            </div>
          </div>

          {state === "success" && (
            <div className="pt-2">
              <Button variant="link" className="text-amber-400 hover:text-amber-300 p-0 h-auto">
                View on Explorer
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

