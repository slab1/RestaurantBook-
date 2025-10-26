'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface OfflineProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOffline, setShowOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOffline(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOffline(true)
    }

    // Set initial state
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showOffline) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 text-center text-sm md:hidden">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span>You're offline. Some features may be limited.</span>
      </div>
    </div>
  )
}

export function OfflineContent({ children, fallback }: OfflineProps) {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOnline) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center min-h-96 p-6 text-center">
          <WifiOff className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            You're Offline
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
            Check your internet connection and try again. Some features may be available offline.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )
    )
  }

  return <>{children}</>
}

export function OfflineQueue() {
  const [queue, setQueue] = useState<Array<{ id: string; url: string; data: any }>>([])

  useEffect(() => {
    // Load queue from localStorage on mount
    const savedQueue = localStorage.getItem('offline-queue')
    if (savedQueue) {
      setQueue(JSON.parse(savedQueue))
    }
  }, [])

  const addToQueue = (url: string, data: any) => {
    const item = { id: Date.now().toString(), url, data }
    const newQueue = [...queue, item]
    setQueue(newQueue)
    localStorage.setItem('offline-queue', JSON.stringify(newQueue))
  }

  const processQueue = async () => {
    for (const item of queue) {
      try {
        await fetch(item.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        })
      } catch (error) {
        console.error('Failed to process queued item:', error)
        return false
      }
    }
    
    // Clear queue on success
    setQueue([])
    localStorage.removeItem('offline-queue')
    return true
  }

  useEffect(() => {
    const handleOnline = () => {
      if (queue.length > 0) {
        processQueue()
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [queue])

  return queue.length > 0 ? (
    <Card className="fixed top-0 left-0 right-0 z-50 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-800 dark:text-blue-200">
            {queue.length} action{queue.length > 1 ? 's' : ''} queued for sync
          </span>
        </div>
        <Button
          size="sm"
          onClick={processQueue}
          disabled={!navigator.onLine}
          variant="outline"
          className="text-xs"
        >
          Sync Now
        </Button>
      </div>
    </Card>
  ) : null
}