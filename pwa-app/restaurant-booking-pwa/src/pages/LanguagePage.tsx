import React from 'react'
import { useI18n } from '../contexts/I18nContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useAuthStore } from '../store'
import { Globe, MapPin, DollarSign, Settings, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function LanguagePage() {
  const { language, currency, languages, currencies, setLanguage, setCurrency, t } = useI18n()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode)
    // In a real app, this would save to backend
    localStorage.setItem('preferred-language', langCode)
  }

  const handleCurrencyChange = (currCode: string) => {
    setCurrency(currCode)
    // In a real app, this would save to backend
    localStorage.setItem('preferred-currency', currCode)
  }

  const quickLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
    { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
    { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t('language.title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('language.subtitle')}
        </p>
      </div>

      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            {t('language.selectLanguage')}
          </CardTitle>
          <CardDescription>
            {t('language.languageDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Languages */}
          <div>
            <h4 className="font-semibold mb-3">{t('language.quickLanguages')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickLanguages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={language === lang.code ? 'default' : 'outline'}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-center">
                    <p className="font-medium">{lang.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {languages.find(l => l.code === lang.code)?.nativeName}
                    </p>
                  </div>
                  {language === lang.code && (
                    <Check className="h-4 w-4 absolute top-2 right-2" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* All Languages */}
          <div>
            <h4 className="font-semibold mb-3">{t('language.allLanguages')}</h4>
            <div className="grid md:grid-cols-2 gap-2">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={language === lang.code ? 'secondary' : 'ghost'}
                  className="justify-start h-auto p-3"
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span className="mr-3 text-lg">{lang.flag}</span>
                  <div className="text-left">
                    <p className="font-medium">{lang.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {lang.nativeName}
                    </p>
                  </div>
                  {language === lang.code && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            {t('language.selectCurrency')}
          </CardTitle>
          <CardDescription>
            {t('language.currencyDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {currencies.map((curr) => (
              <Button
                key={curr.code}
                variant={currency === curr.code ? 'secondary' : 'outline'}
                className="justify-start h-auto p-4"
                onClick={() => handleCurrencyChange(curr.code)}
              >
                <div className="text-left">
                  <p className="font-medium">{curr.symbol} {curr.code}</p>
                  <p className="text-sm text-muted-foreground">{curr.name}</p>
                </div>
                {currency === curr.code && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>{t('language.preview')}</CardTitle>
          <CardDescription>
            {t('language.previewDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">{t('language.sampleText')}</h4>
              <div className="space-y-2 text-sm">
                <p>{t('hero.title')}</p>
                <p>{t('hero.subtitle')}</p>
                <p>{t('features.title')}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">{t('language.samplePrices')}</h4>
              <div className="space-y-2 text-sm">
                <p>{t('language.restaurantPrice')}: {new Intl.NumberFormat(language, { style: 'currency', currency }).format(15000)}</p>
                <p>{t('language.deliveryFee')}: {new Intl.NumberFormat(language, { style: 'currency', currency }).format(1000)}</p>
                <p>{t('language.totalAmount')}: {new Intl.NumberFormat(language, { style: 'currency', currency }).format(16000)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">{t('language.location')}</h3>
                <p className="text-sm text-muted-foreground">{t('language.locationDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">{t('language.advanced')}</h3>
                <p className="text-sm text-muted-foreground">{t('language.advancedDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Globe className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">{t('language.help')}</h3>
                <p className="text-sm text-muted-foreground">{t('language.helpDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
