import { useRef, useCallback } from 'react'

interface SwipeCallbacks {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface SwipeConfig {
  threshold?: number
  velocity?: number
  preventDefaultTouchmoveEvent?: boolean
}

export function useSwipe(
  callbacks: SwipeCallbacks,
  config: SwipeConfig = {}
) {
  const {
    threshold = 50,
    velocity = 0.3,
    preventDefaultTouchmoveEvent = false
  } = config

  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const touchEnd = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEnd.current = null
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault()
    }
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    }
  }, [preventDefaultTouchmoveEvent])

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return

    const deltaX = touchStart.current.x - touchEnd.current.x
    const deltaY = touchStart.current.y - touchEnd.current.y
    const velocityX = Math.abs(deltaX) / Math.abs(deltaX || 1)
    const velocityY = Math.abs(deltaY) / Math.abs(deltaY || 1)

    // Check if swipe meets velocity threshold
    if (Math.abs(velocityX) < velocity || Math.abs(velocityY) < velocity) {
      return
    }

    const isLeftSwipe = deltaX > threshold
    const isRightSwipe = deltaX < -threshold
    const isUpSwipe = deltaY > threshold
    const isDownSwipe = deltaY < -threshold

    if (isLeftSwipe && callbacks.onSwipeLeft) {
      callbacks.onSwipeLeft()
    } else if (isRightSwipe && callbacks.onSwipeRight) {
      callbacks.onSwipeRight()
    } else if (isUpSwipe && callbacks.onSwipeUp) {
      callbacks.onSwipeUp()
    } else if (isDownSwipe && callbacks.onSwipeDown) {
      callbacks.onSwipeDown()
    }
  }, [callbacks, threshold, velocity])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}

// Pull-to-refresh hook
export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)
  const isPulling = useRef<boolean>(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 0) return
    startY.current = e.touches[0].clientY
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 0) return
    
    currentY.current = e.touches[0].clientY
    const deltaY = currentY.current - startY.current

    if (deltaY > 0) {
      isPulling.current = true
      // Prevent the default scroll behavior when pulling down
      e.preventDefault()
    }
  }, [])

  const onTouchEnd = useCallback(async () => {
    if (isPulling.current && currentY.current - startY.current > 100) {
      await onRefresh()
    }
    isPulling.current = false
    startY.current = 0
    currentY.current = 0
  }, [onRefresh])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}

// Haptic feedback hook
export function useHaptic() {
  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  const lightImpact = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }, [])

  const mediumImpact = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20)
    }
  }, [])

  const heavyImpact = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }
  }, [])

  return {
    vibrate,
    lightImpact,
    mediumImpact,
    heavyImpact,
  }
}