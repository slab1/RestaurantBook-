'use client'

import { useState, useEffect } from 'react'
import { usePullToRefresh } from '../../hooks/useMobileGestures'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: React.ReactNode
  className?: string
}

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
      setPullDistance(0)
    }
  }

  const { onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(handleRefresh)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return
    onTouchStart(e)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return
    
    onTouchMove(e)
    
    // Calculate pull distance
    const touch = e.touches[0]
    const startY = parseFloat((touch as any).startY) || 0
    const currentY = touch.clientY
    const distance = Math.max(0, currentY - startY)
    setPullDistance(Math.min(distance, 100))
  }

  const handleTouchEnd = () => {
    onTouchEnd()
    setTimeout(() => setPullDistance(0), 300)
  }

  // Disable pull-to-refresh on desktop
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={className}>
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {pullDistance > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center h-16 bg-white dark:bg-gray-950 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  rotate: isRefreshing ? 360 : pullDistance > 50 ? 180 : 0 
                }}
                transition={{ 
                  duration: isRefreshing ? 1 : 0.3,
                  repeat: isRefreshing ? Infinity : 0,
                  ease: isRefreshing ? "linear" : "easeOut"
                }}
                className={`w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full ${isRefreshing ? 'animate-spin' : ''}`}
              >
                {pullDistance > 50 && !isRefreshing && (
                  <RotateCcw className="w-4 h-4 text-blue-500 absolute top-1 left-1" />
                )}
              </motion.div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isRefreshing 
                  ? 'Refreshing...' 
                  : pullDistance > 50 
                    ? 'Release to refresh' 
                    : 'Pull to refresh'
                }
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content with touch handlers */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: pullDistance > 0 ? `translateY(${Math.min(pullDistance * 0.5, 30)}px)` : 'translateY(0)',
          transition: pullDistance > 50 ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  )
}