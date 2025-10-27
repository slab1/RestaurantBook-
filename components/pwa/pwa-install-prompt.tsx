'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { Card } from '@/components/ui/card'
import { Download, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function PWAInstallPrompt() {
  const { isInstallable, installApp } = usePWAInstall()
  const [isVisible, setIsVisible] = useState(true)

  if (!isInstallable || !isVisible) return null

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setIsVisible(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-4 md:max-w-sm md:bottom-4 safe-area-bottom"
      >
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Download className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Install RestaurantBook
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Get the app experience with offline access and push notifications
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleInstall} className="text-xs">
                  Install
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsVisible(false)}
                  className="text-xs"
                >
                  Not now
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}