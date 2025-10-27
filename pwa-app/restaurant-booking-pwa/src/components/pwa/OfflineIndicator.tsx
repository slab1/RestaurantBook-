import React, { useState, useEffect } from 'react'
import { useUIStore } from '../../store'
import { Badge } from '../ui/badge'
import { Wifi, WifiOff } from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'

export function OfflineIndicator() {
  const { isOffline, setOfflineStatus } = useUIStore()
  const { t } = useI18n()

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setOfflineStatus(!online)
    }

    // Set initial status
    updateOnlineStatus()

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [setOfflineStatus])

  if (!isOffline) {
    return null
  }

  return (
    <div className="sticky top-16 z-40 bg-orange-100 border-b border-orange-200 px-4 py-2">
      <div className="flex items-center justify-center space-x-2 text-orange-800">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">{t('pwa.offline')}</span>
        <Badge variant="outline" className="text-xs">
          {t('pwa.offlineMode')}
        </Badge>
      </div>
    </div>
  )
}
