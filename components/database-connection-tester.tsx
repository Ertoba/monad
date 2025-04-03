"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCircle, XCircle, RefreshCw, Database } from "lucide-react"

export function DatabaseConnectionTester() {
  const [isTestingHealth, setIsTestingHealth] = useState(false)
  const [isTestingDetails, setIsTestingDetails] = useState(false)
  const [healthResult, setHealthResult] = useState<any>(null)
  const [detailsResult, setDetailsResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("health")

  // Test basic health check
  const testHealthEndpoint = async () => {
    setIsTestingHealth(true)
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setHealthResult({
        success: response.ok,
        status: response.status,
        data,
      })
    } catch (error) {
      setHealthResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsTestingHealth(false)
    }
  }

  // Test detailed database information
  const testDetailsEndpoint = async () => {
    setIsTestingDetails(true)
    try {
      const response = await fetch("/api/db-test")
      const data = await response.json()
      setDetailsResult({
        success: response.ok,
        status: response.status,
        data,
      })
    } catch (error) {
      setDetailsResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsTestingDetails(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection Tester
        </CardTitle>
        <CardDescription>Test your NeonDB connection</CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mx-4">
          <TabsTrigger value="health">Health Check</TabsTrigger>
          <TabsTrigger value="details">Detailed Info</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="p-4">
          <Button onClick={testHealthEndpoint} disabled={isTestingHealth} className="w-full mb-4">
            {isTestingHealth ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Health Endpoint"
            )}
          </Button>

          {healthResult && (
            <CardContent className="p-0">
              <div className="rounded-md border p-4 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  {healthResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">Status: {healthResult.success ? "Connected" : "Failed"}</span>
                </div>
                <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs">
                  {JSON.stringify(healthResult.data, null, 2)}
                </pre>
              </div>
            </CardContent>
          )}
        </TabsContent>

        <TabsContent value="details" className="p-4">
          <Button onClick={testDetailsEndpoint} disabled={isTestingDetails} className="w-full mb-4">
            {isTestingDetails ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Get Database Details"
            )}
          </Button>

          {detailsResult && (
            <CardContent className="p-0">
              <div className="rounded-md border p-4 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  {detailsResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">Status: {detailsResult.success ? "Connected" : "Failed"}</span>
                </div>
                <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs">
                  {JSON.stringify(detailsResult.data, null, 2)}
                </pre>
              </div>
            </CardContent>
          )}
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-between bg-gray-50 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setHealthResult(null)
            setDetailsResult(null)
          }}
        >
          Clear Results
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={() => {
            if (activeTab === "health") testHealthEndpoint()
            else testDetailsEndpoint()
          }}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  )
}

