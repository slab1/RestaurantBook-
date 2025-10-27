import React, { useEffect, useState } from 'react'
import { useUIStore } from '../../store'
import { Button } from '../ui/button'
import { useI18n } from '../../contexts/I18nContext'
import { Download, X } from 'lucide-react'

export function PWAInstaller() {
  const { showInstallPrompt, setInstallPrompt } = useUIStore()
  const { t } = useI18n()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    setIsInstalled(isStandalone || isInWebAppiOS)

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show install prompt after a delay
      setTimeout(() => {
        setInstallPrompt(true)
      }, 10000) // Show after 10 seconds
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setInstallPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [setInstallPrompt])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setInstallPrompt(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed or dismissed
  if (isInstalled || !showInstallPrompt || sessionStorage.getItem('pwa-install-dismissed')) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-background border rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Download className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold mb-1">
              {t('pwa.installApp')}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {t('pwa.installDescription')}
            </p>
            
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleInstall}>
                {t('pwa.install')}
              </Button>
              <Button size="sm" variant="outline" onClick={handleDismiss}>
                {t('pwa.notNow')}
              </Button>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
