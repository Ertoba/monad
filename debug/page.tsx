import { TransactionDebugPanel } from "@/components/transaction-debug-panel"

export default function DebugPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-center mb-8 text-red-800">Transaction Debugging Tools</h1>
        <TransactionDebugPanel />

        <div className="mt-8 max-w-md mx-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>Try using the standalone test page (opens in a new tab)</li>
            <li>Check your MetaMask settings for any custom configurations</li>
            <li>Try using a different browser or incognito mode</li>
            <li>Check if you have any browser extensions that might interfere with transactions</li>
            <li>Try resetting your MetaMask account (Settings &gt; Advanced &gt; Reset Account)</li>
          </ol>
        </div>
      </div>
    </main>
  )
}

