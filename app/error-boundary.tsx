'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-800 mb-4">Something went wrong!</h2>
        <p className="text-red-700 mb-4">{error.message}</p>
        <details className="mb-4 p-3 bg-red-100 rounded text-sm text-red-600">
          <summary className="cursor-pointer font-semibold">Error Details</summary>
          <pre className="mt-2 overflow-auto text-xs whitespace-pre-wrap break-words">
            {error.stack}
          </pre>
        </details>
        <button
          onClick={reset}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
