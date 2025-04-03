import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#6266E4]" />
        <h2 className="mt-4 text-xl font-semibold text-white">Loading...</h2>
        <p className="mt-2 text-gray-400">Preparing Twitter authentication</p>
      </div>
    </div>
  )
}

