"use client"

import { useState, useEffect } from "react"

export default function DbDebugPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [initResult, setInitResult] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [initLoading, setInitLoading] = useState<boolean>(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/db-test")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        message: "Error testing connection",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const initializeDb = async () => {
    setInitLoading(true)
    try {
      const response = await fetch("/api/db-init")
      const data = await response.json()
      setInitResult(data)
    } catch (error) {
      setInitResult({
        success: false,
        message: "Error initializing database",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setInitLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E2E2E] to-black text-white overflow-x-hidden relative pb-20">
      <div className="container mx-auto px-4 pt-20">
        <h1 className="text-2xl font-bold text-center mb-8">Database Connection Debug</h1>

        <div className="max-w-md mx-auto bg-[#1A1A1A] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Connection Test</h2>
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-3 py-1 bg-[#6266E4] text-white rounded hover:bg-[#4F52B8] disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Again"}
            </button>
          </div>

          {testResult && (
            <div className={`p-4 rounded ${testResult.success ? "bg-[#1E3A2F]" : "bg-[#3A1E1E]"}`}>
              <p className="font-semibold">{testResult.message}</p>
              {testResult.error && <p className="text-red-400 mt-2">{testResult.error}</p>}
              {testResult.data && (
                <div className="mt-2 p-2 bg-[#252525] rounded overflow-auto">
                  <p>
                    <strong>Time:</strong> {testResult.data.time}
                  </p>
                  <p>
                    <strong>Response Time:</strong> {testResult.data.responseTime}
                  </p>
                  <p>
                    <strong>Connection String:</strong> {testResult.data.connectionString}
                  </p>
                  <p>
                    <strong>Environment:</strong> {testResult.data.environment}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="max-w-md mx-auto bg-[#1A1A1A] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Database Initialization</h2>
            <button
              onClick={initializeDb}
              disabled={initLoading}
              className="px-3 py-1 bg-[#6266E4] text-white rounded hover:bg-[#4F52B8] disabled:opacity-50"
            >
              {initLoading ? "Initializing..." : "Initialize Database"}
            </button>
          </div>

          {initResult && (
            <div className={`p-4 rounded ${initResult.success ? "bg-[#1E3A2F]" : "bg-[#3A1E1E]"}`}>
              <p className="font-semibold">{initResult.message}</p>
              {initResult.error && <p className="text-red-400 mt-2">{initResult.error}</p>}
              {initResult.tables && (
                <div className="mt-2">
                  <p className="font-medium">Tables created:</p>
                  <ul className="list-disc pl-5 mt-1">
                    {initResult.tables.map((table: string) => (
                      <li key={table}>{table}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 max-w-md mx-auto p-4 bg-[#1A1A1A] rounded-lg">
          <h2 className="text-lg font-medium mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>Ensure your .env.local file has a valid POSTGRES_URL</li>
            <li>Check that your NeonDB instance is running</li>
            <li>Verify connection credentials are correct</li>
            <li>Examine detailed error messages from the API</li>
            <li>Check server logs for additional information</li>
          </ol>
        </div>
      </div>
    </main>
  )
}

