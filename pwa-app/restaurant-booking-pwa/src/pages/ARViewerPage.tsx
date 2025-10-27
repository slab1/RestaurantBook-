import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useI18n } from '../contexts/I18nContext'
import { Camera, Smartphone, RotateCcw, ArrowLeft } from 'lucide-react'

export function ARViewerPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>()
  const { t } = useI18n()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('ar.title')}</h1>
          <p className="text-muted-foreground">{t('ar.subtitle')}</p>
        </div>
      </div>

      {/* AR Scanner Interface */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="mr-2 h-5 w-5" />
            {t('ar.scanner')}
          </CardTitle>
          <CardDescription>
            {t('ar.scannerDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="aspect-video bg-black flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                <Camera className="h-16 w-16 text-white" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white text-sm">{t('ar.pointCamera')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AR Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="mr-2 h-5 w-5" />
              {t('ar.menuView')}
            </CardTitle>
            <CardDescription>
              {t('ar.menuViewDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t('ar.menuPreview')}</p>
              </div>
            </div>
            <Button className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              {t('ar.startMenuView')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <RotateCcw className="mr-2 h-5 w-5" />
              {t('ar.virtualTour')}
            </CardTitle>
            <CardDescription>
              {t('ar.virtualTourDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <RotateCcw className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t('ar.tourPreview')}</p>
              </div>
            </div>
            <Button className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              {t('ar.startVirtualTour')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('ar.instructions')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">{t('ar.howToUse')}</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>1. {t('ar.step1')}</p>
                <p>2. {t('ar.step2')}</p>
                <p>3. {t('ar.step3')}</p>
                <p>4. {t('ar.step4')}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">{t('ar.tips')}</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• {t('ar.tip1')}</p>
                <p>• {t('ar.tip2')}</p>
                <p>• {t('ar.tip3')}</p>
                <p>• {t('ar.tip4')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compatibility */}
      <Card>
        <CardHeader>
          <CardTitle>{t('ar.compatibility')}</CardTitle>
          <CardDescription>{t('ar.compatibilityDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">{t('ar.supported')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• iOS 11.0+ (Safari)</li>
                <li>• Android 7.0+ (Chrome)</li>
                <li>• Chrome 79+</li>
                <li>• Safari 14+</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">{t('ar.notes')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('ar.note1')}</li>
                <li>• {t('ar.note2')}</li>
                <li>• {t('ar.note3')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
