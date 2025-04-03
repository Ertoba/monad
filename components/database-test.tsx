"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export function DatabaseTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [altResult, setAltResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Test with Vercel client
      const response = await fetch(`/api/db-test?t=${Date.now()}`)
      const data = await response.json()
      setResult(data)

      // Also test with pg client
      try {
        const altResponse = await fetch(`/api/db-test-alt?t=${Date.now()}`)
        const altData = await altResponse.json()
        setAltResult(altData)
      } catch (altErr) {
        console.error("Alternative test failed:", altErr)
        setAltResult({
          success: false,
          error: altErr instanceof Error ? altErr.message : "Unknown error",
        })
      }
    } catch (err) {
      setError("Failed to execute test: " + (err instanceof Error ? err.message : "Unknown error"))
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Run test on initial load
  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="w-full max-w-md mx-auto bg-[#1A1A1A] rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Database Connection Test</h2>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#6266E4]" />
            <p className="mt-4 text-sm text-gray-400">Testing database connection...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 border-b border-gray-700 pb-4 mb-4">
              <h3 className="font-medium text-white">Vercel Client Test:</h3>
              {result ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Connection Status:</span>
                    {result.success ? (
                      <div className="flex items-center text-green-400">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        <span>Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-400">
                        <XCircle className="mr-1 h-4 w-4" />
                        <span>Failed</span>
                      </div>
                    )}
                  </div>

                  {result.success && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">Server Time:</span>
                        <span className="text-sm text-gray-300">{result.data?.time || "N/A"}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">Response Time:</span>
                        <span className="text-sm text-gray-300">{result.data?.responseTime || "N/A"}</span>
                      </div>
                    </>
                  )}

                  {!result.success && (
                    <div className="mt-4 rounded-md bg-red-500/10 p-3">
                      <div className="flex">
                        <XCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-400">Connection Error</h3>
                          <div className="mt-2 text-sm text-red-400/80 break-words">
                            {result.error || "Unknown error occurred"}
                          </div>
                          {result.troubleshooting && (
                            <div className="mt-2 text-sm text-amber-400/80">{result.troubleshooting}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : error ? (
                <div className="rounded-md bg-red-500/10 p-3">
                  <div className="flex">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-400">Test Error</h3>
                      <div className="mt-2 text-sm text-red-400/80">{error}</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-white">Alternative Client Test (pg):</h3>
              {altResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Connection Status:</span>
                    {altResult.success ? (
                      <div className="flex items-center text-green-400">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        <span>Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-400">
                        <XCircle className="mr-1 h-4 w-4" />
                        <span>Failed</span>
                      </div>
                    )}
                  </div>

                  {altResult.success && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">Server Time:</span>
                        <span className="text-sm text-gray-300">{altResult.data?.time || "N/A"}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">Response Time:</span>
                        <span className="text-sm text-gray-300">{altResult.data?.responseTime || "N/A"}</span>
                      </div>
                    </>
                  )}

                  {!altResult.success && (
                    <div className="mt-4 rounded-md bg-red-500/10 p-3">
                      <div className="flex">
                        <XCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-400">Connection Error</h3>
                          <div className="mt-2 text-sm text-red-400/80 break-words">
                            {altResult.error || "Unknown error occurred"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>

      <Button onClick={testConnection} disabled={isLoading} className="w-full mt-6 bg-[#6266E4]">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Test Connection Again
          </>
        )}
      </Button>

      <div className="mt-6 text-sm text-gray-400">
        <h3 className="font-medium text-white mb-2">Troubleshooting Tips:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Check that your Neon database is active and not in sleep mode</li>
          <li>Verify the connection string format in your .env.local file</li>
          <li>Make sure the database user has the correct permissions</li>
          <li>Check if your IP is allowed in Neon's connection settings</li>
          <li>Try using a connection pooling URL instead of a direct connection URL</li>
        </ul>
      </div>
    </div>
  )
}

