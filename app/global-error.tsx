'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Application Error
              </h2>
              
              <p className="text-gray-600 mb-6">
                A critical error occurred. Please try refreshing the page.
              </p>

              {process.env.NODE_ENV === 'development' && (
                <details className="mb-6 w-full text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Error Details
                  </summary>
                  <div className="bg-gray-100 rounded p-3 text-xs overflow-auto max-h-40">
                    <p className="font-semibold text-red-600 mb-1">
                      {error.message || error.toString()}
                    </p>
                    {error.digest && (
                      <p className="text-gray-600">Error ID: {error.digest}</p>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => reset()}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                
                <a
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
