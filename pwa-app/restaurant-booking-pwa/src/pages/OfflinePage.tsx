import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useI18n } from '../contexts/I18nContext'
import { WifiOff, RefreshCw } from 'lucide-react'

export function OfflinePage() {
  const { t } = useI18n()

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
          <WifiOff className="h-12 w-12 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('offline.title')}</h1>
          <p className="text-muted-foreground">
            {t('offline.description')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('offline.features.title')}</CardTitle>
            <CardDescription>{t('offline.features.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm">{t('offline.features.cache')}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm">{t('offline.features.localData')}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm">{t('offline.features.sync')}</span>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleRefresh} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('offline.tryAgain')}
        </Button>
      </div>
    </div>
  )
}
