"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, CheckCircle, Bug, FileSearch, Send } from "lucide-react"
import { checkForInterceptors, checkForGlobalHooks, testDirectTransaction } from "@/lib/transaction-debugger"

// Test recipient address
const TEST_RECIPIENT = "0xc7d2a5f7ebfccbc5f08d33f3e5475fa9f1a85fa8"

export function TransactionDebugPanel() {
  const [isChecking, setIsChecking] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [interceptorResults, setInterceptorResults] = useState<any>(null)
  const [transactionResults, setTransactionResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("check")

  // Run checks when component mounts
  useEffect(() => {
    runChecks()
  }, [])

  // Function to run all checks
  async function runChecks() {
    setIsChecking(true)
    try {
      const interceptors = await checkForInterceptors()
      setInterceptorResults(interceptors)

      await checkForGlobalHooks()
    } catch (error) {
      console.error("Error running checks:", error)
    } finally {
      setIsChecking(false)
    }
  }

  // Function to test a direct transaction
  async function runTransactionTest() {
    setIsTesting(true)
    setTransactionResults(null)

    try {
      const result = await testDirectTransaction(TEST_RECIPIENT)
      setTransactionResults(result)

      // Switch to results tab
      setActiveTab("results")
    } catch (error) {
      console.error("Error running transaction test:", error)
      setTransactionResults({ success: false, error: error.message })
    } finally {
      setIsTesting(false)
    }
  }

  // Function to open the standalone test page
  function openStandalonePage() {
    window.open("/direct-transaction.html", "_blank")
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white border-red-200">
      <CardHeader className="bg-red-50 border-b border-red-100">
        <CardTitle className="text-red-800 flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Transaction Debugger
        </CardTitle>
        <CardDescription className="text-red-700">Diagnose transaction recipient issues</CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="check">System Check</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="check" className="p-4">
          <div className="space-y-4">
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Transaction Recipient Issue</AlertTitle>
              <AlertDescription>
                This tool helps diagnose why transactions are being sent to unexpected addresses.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">System Information</h3>
              {isChecking ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking system...
                </div>
              ) : interceptorResults ? (
                <div className="space-y-1 text-sm">
                  <div>MetaMask Installed: {interceptorResults.isMetaMask ? "Yes ✅" : "No ❌"}</div>
                  <div>Ethereum Object: {interceptorResults.hasEthereum ? "Available ✅" : "Missing ❌"}</div>
                  <div className="text-xs text-gray-500 break-all">User Agent: {interceptorResults.userAgent}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No check results available</div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Test Transaction</h3>
              <div className="text-xs text-gray-600">
                Target recipient: <span className="font-mono">{TEST_RECIPIENT}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={runTransactionTest}
                  disabled={isTesting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-3 w-3" />
                      Run Test
                    </>
                  )}
                </Button>

                <Button
                  onClick={openStandalonePage}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <FileSearch className="mr-2 h-3 w-3" />
                  Standalone Test
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results" className="p-4">
          {transactionResults ? (
            <div className="space-y-4">
              {transactionResults.success ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Success</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Transaction sent to the correct recipient!
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Transaction Failed</AlertTitle>
                  <AlertDescription>
                    {transactionResults.error}
                    {transactionResults.expected && (
                      <div className="mt-2 text-xs">
                        <div>Expected: {transactionResults.expected}</div>
                        <div>Actual: {transactionResults.actual}</div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {transactionResults.hash && (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Transaction Hash</h3>
                  <div className="text-xs font-mono break-all bg-gray-50 p-2 rounded border">
                    {transactionResults.hash}
                  </div>
                  <div className="text-xs text-blue-600">
                    <a
                      href={`https://explorer.testnet.monad.xyz/tx/${transactionResults.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      View on Explorer
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileSearch className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No test results yet</p>
              <p className="text-sm">Run a test transaction to see results</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-between">
        <Button onClick={runChecks} variant="outline" size="sm" disabled={isChecking}>
          {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bug className="h-4 w-4" />}
          <span className="ml-2">Refresh Checks</span>
        </Button>

        <div className="text-xs text-gray-500">v1.0.0</div>
      </CardFooter>
    </Card>
  )
}

