"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle, AlertTriangle, Database, Loader2 } from "lucide-react"

export function DeploymentHelper() {
  const [copied, setCopied] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [initResult, setInitResult] = useState<any>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  const initializeDatabase = async () => {
    setIsInitializing(true)
    setInitResult(null)

    try {
      const response = await fetch(`/api/db-init?t=${Date.now()}`)
      const data = await response.json()
      setInitResult(data)
    } catch (err) {
      setInitResult({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-[#1A1A1A] rounded-xl p-6 shadow-lg mt-8">
      <h2 className="text-xl font-bold mb-4 text-white">Deployment Helper</h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-white mb-2">Vercel Environment Variables</h3>
          <p className="text-sm text-gray-400 mb-4">
            Make sure to add these environment variables to your Vercel project settings.
          </p>

          <div className="space-y-3">
            <div className="bg-gray-800 rounded-md p-3">
              <div className="flex justify-between items-center">
                <code className="text-sm text-gray-300">POSTGRES_URL</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("POSTGRES_URL")}
                  className="h-8 px-2 text-gray-400 hover:text-white"
                >
                  {copied === "POSTGRES_URL" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Your Neon database connection string</p>
            </div>

            <div className="bg-gray-800 rounded-md p-3">
              <div className="flex justify-between items-center">
                <code className="text-sm text-gray-300">POSTGRES_URL_NON_POOLING</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("POSTGRES_URL_NON_POOLING")}
                  className="h-8 px-2 text-gray-400 hover:text-white"
                >
                  {copied === "POSTGRES_URL_NON_POOLING" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Use the same value as POSTGRES_URL</p>
            </div>

            <div className="bg-gray-800 rounded-md p-3">
              <div className="flex justify-between items-center">
                <code className="text-sm text-gray-300">NEXTAUTH_URL</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("NEXTAUTH_URL")}
                  className="h-8 px-2 text-gray-400 hover:text-white"
                >
                  {copied === "NEXTAUTH_URL" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Your deployment URL (e.g., https://your-app.vercel.app)</p>
            </div>

            <div className="bg-gray-800 rounded-md p-3">
              <div className="flex justify-between items-center">
                <code className="text-sm text-gray-300">NEXTAUTH_SECRET</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("NEXTAUTH_SECRET")}
                  className="h-8 px-2 text-gray-400 hover:text-white"
                >
                  {copied === "NEXTAUTH_SECRET" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                A random string for NextAuth.js (generate with `openssl rand -base64 32`)
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="font-medium text-white mb-2">Database Initialization</h3>
          <p className="text-sm text-gray-400 mb-4">Initialize your database schema with required tables.</p>

          <Button
            onClick={initializeDatabase}
            disabled={isInitializing}
            className="w-full mb-4 bg-[#6266E4] flex items-center justify-center"
          >
            {isInitializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Initialize Database Schema
              </>
            )}
          </Button>

          {initResult && (
            <div className={`rounded-md ${initResult.success ? "bg-green-500/10" : "bg-red-500/10"} p-3 mb-4`}>
              <div className="flex">
                {initResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                )}
                <div className="ml-3">
                  <p className={`text-sm ${initResult.success ? "text-green-400" : "text-red-400"}`}>
                    {initResult.success ? "Database initialized successfully!" : "Failed to initialize database"}
                  </p>
                  {!initResult.success && initResult.error && (
                    <p className="text-xs text-red-400/80 mt-1">{initResult.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="font-medium text-white mb-2">Neon Serverless Connection</h3>
          <div className="bg-amber-500/10 rounded-md p-3 mb-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-amber-400">Neon Database in Serverless Environments:</p>
                <ul className="list-disc pl-5 mt-2 text-xs text-amber-400/80 space-y-1">
                  <li>We're using the Neon serverless driver for WebSocket connections</li>
                  <li>Make sure your database is not in sleep mode</li>
                  <li>Check that your Neon project allows connections from Vercel</li>
                  <li>The first connection may take longer as the database wakes up</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

