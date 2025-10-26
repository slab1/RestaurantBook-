'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface PWASplashScreenProps {
  isLoading: boolean
  onLoadingComplete: () => void
}

export function PWASplashScreen({ isLoading, onLoadingComplete }: PWASplashScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isLoading) return

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15
        if (newProgress >= 100) {
          clearInterval(timer)
          setTimeout(onLoadingComplete, 500)
          return 100
        }
        return newProgress
      })
    }, 100)

    return () => clearInterval(timer)
  }, [isLoading, onLoadingComplete])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center">
      {/* App Icon */}
      <div className="relative w-24 h-24 mb-8 animate-pulse">
        <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm"></div>
        <div className="absolute inset-2 bg-white/30 rounded-xl backdrop-blur-sm"></div>
        <div className="absolute inset-4 bg-white rounded-xl flex items-center justify-center">
          <Image
            src="/icons/icon-192x192.png"
            alt="RestaurantBook"
            width={48}
            height={48}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* App Name */}
      <h1 className="text-3xl font-bold text-white mb-2">RestaurantBook</h1>
      <p className="text-blue-100 text-sm mb-8">Table Booking System</p>

      {/* Progress Bar */}
      <div className="w-64 bg-white/20 rounded-full h-2 mb-4">
        <div 
          className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-blue-100 text-xs">
        {progress < 100 ? 'Loading...' : 'Welcome!'}
      </p>

      {/* Loading Dots */}
      {progress >= 100 && (
        <div className="flex space-x-1 mt-4">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      )}
    </div>
  )
}

interface PWAUpdatePromptProps {
  hasUpdate: boolean
  onUpdate: () => void
  onDismiss: () => void
}

export function PWAUpdatePrompt({ hasUpdate, onUpdate, onDismiss }: PWAUpdatePromptProps) {
  if (!hasUpdate) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-blue-600 text-white p-3 text-center text-sm">
      <div className="flex items-center justify-center gap-2">
        <span>New version available!</span>
        <button
          onClick={onUpdate}
          className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-blue-50"
        >
          Update
        </button>
        <button
          onClick={onDismiss}
          className="text-blue-200 hover:text-white"
        >
          ×
        </button>
      </div>
    </div>
  )
}