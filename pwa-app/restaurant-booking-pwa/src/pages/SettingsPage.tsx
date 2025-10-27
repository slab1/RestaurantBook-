import React from 'react'
import { useI18n } from '../contexts/I18nContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useUIStore } from '../store'
import { 
  Bell, 
  Moon, 
  Sun, 
  Smartphone, 
  Shield, 
  HelpCircle, 
  CreditCard,
  Globe,
  Volume2,
  Eye,
  Download
} from 'lucide-react'

export function SettingsPage() {
  const uiStore = useUIStore()
  const { theme, setTheme } = uiStore
  const { t } = useI18n()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t('settings.title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="mr-2 h-5 w-5" />
            {t('settings.appearance')}
          </CardTitle>
          <CardDescription>
            {t('settings.appearanceDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-3">{t('settings.theme')}</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: t('settings.light'), icon: Sun },
                { value: 'dark', label: t('settings.dark'), icon: Moon },
                { value: 'system', label: t('settings.system'), icon: Smartphone },
              ].map((themeOption) => {
                const Icon = themeOption.icon
                return (
                  <Button
                    key={themeOption.value}
                    variant={theme === themeOption.value ? 'default' : 'outline'}
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => setTheme(themeOption.value)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{themeOption.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            {t('settings.notifications')}
          </CardTitle>
          <CardDescription>
            {t('settings.notificationsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'booking', label: t('settings.bookingNotifications'), description: t('settings.bookingNotificationsDesc') },
            { key: 'offers', label: t('settings.offerNotifications'), description: t('settings.offerNotificationsDesc') },
            { key: 'loyalty', label: t('settings.loyaltyNotifications'), description: t('settings.loyaltyNotificationsDesc') },
          ].map((notification) => (
            <div key={notification.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{notification.label}</p>
                <p className="text-sm text-muted-foreground">{notification.description}</p>
              </div>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sound & Haptics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Volume2 className="mr-2 h-5 w-5" />
            {t('settings.sound')}
          </CardTitle>
          <CardDescription>
            {t('settings.soundDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'sound', label: t('settings.soundEffects'), description: t('settings.soundEffectsDesc') },
            { key: 'haptic', label: t('settings.hapticFeedback'), description: t('settings.hapticFeedbackDesc') },
          ].map((sound) => (
            <div key={sound.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{sound.label}</p>
                <p className="text-sm text-muted-foreground">{sound.description}</p>
              </div>
              <Button variant="outline" size="sm">
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            {t('settings.privacy')}
          </CardTitle>
          <CardDescription>
            {t('settings.privacyDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'biometric', label: t('settings.biometric'), description: t('settings.biometricDesc') },
            { key: 'location', label: t('settings.location'), description: t('settings.locationDesc') },
            { key: 'analytics', label: t('settings.analytics'), description: t('settings.analyticsDesc') },
          ].map((privacy) => (
            <div key={privacy.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{privacy.label}</p>
                <p className="text-sm text-muted-foreground">{privacy.description}</p>
              </div>
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            {t('settings.payment')}
          </CardTitle>
          <CardDescription>
            {t('settings.paymentDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'default', label: t('settings.defaultMethod'), description: 'Visa ending in 4242' },
            { key: 'autopay', label: t('settings.autopay'), description: t('settings.autopayDesc') },
          ].map((payment) => (
            <div key={payment.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{payment.label}</p>
                <p className="text-sm text-muted-foreground">{payment.description}</p>
              </div>
              <Button variant="outline" size="sm">
                <CreditCard className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* PWA Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            {t('settings.pwa')}
          </CardTitle>
          <CardDescription>
            {t('settings.pwaDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('settings.offlineMode')}</p>
              <p className="text-sm text-muted-foreground">{t('settings.offlineModeDesc')}</p>
            </div>
            <Badge variant="secondary">{t('settings.enabled')}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('settings.autoUpdate')}</p>
              <p className="text-sm text-muted-foreground">{t('settings.autoUpdateDesc')}</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="mr-2 h-5 w-5" />
            {t('settings.support')}
          </CardTitle>
          <CardDescription>
            {t('settings.supportDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'help', label: t('settings.helpCenter'), description: t('settings.helpCenterDesc') },
            { key: 'contact', label: t('settings.contact'), description: t('settings.contactDesc') },
            { key: 'feedback', label: t('settings.feedback'), description: t('settings.feedbackDesc') },
            { key: 'about', label: t('settings.about'), description: t('settings.aboutDesc') },
          ].map((support) => (
            <div key={support.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{support.label}</p>
                <p className="text-sm text-muted-foreground">{support.description}</p>
              </div>
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
