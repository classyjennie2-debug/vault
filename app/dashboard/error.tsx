'use client'

import { useState } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-xl w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Oops! Something went wrong</h1>
            <p className="text-sm text-gray-600">Error loading investments page</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm font-mono">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>

        {showDetails && (
          <details open className="mb-6 p-4 bg-gray-100 rounded-lg">
            <summary className="cursor-pointer font-semibold text-gray-700">Error Stack</summary>
            <pre className="mt-2 overflow-auto text-xs text-gray-600 whitespace-pre-wrap break-words max-h-64">
              {error.stack}
            </pre>
          </details>
        )}

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mb-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showDetails ? 'Hide' : 'Show'} technical details
        </button>

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium transition-colors text-center"
          >
            Go Back
          </a>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          If this problem persists, please contact support at support@vaultinvest.com
        </p>
      </div>
    </div>
  )
}
