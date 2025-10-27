import React, { createContext, useContext, useState, useEffect } from 'react'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  rtl: boolean
}

interface Currency {
  code: string
  symbol: string
  name: string
  rate: number
}

interface I18nContextType {
  language: string
  currency: string
  languages: Language[]
  currencies: Currency[]
  translations: Record<string, any>
  t: (key: string, params?: Record<string, any>) => string
  setLanguage: (language: string) => void
  setCurrency: (currency: string) => void
  formatPrice: (amount: number) => string
  formatDate: (date: string | Date) => string
  formatTime: (time: string | Date) => string
  isRTL: boolean
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬', rtl: false },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬', rtl: false },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', rtl: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
]

const currencies: Currency[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.0012 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.0011 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.00095 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 0.0087 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 0.18 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 0.0044 },
]

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('en')
  const [currency, setCurrencyState] = useState('NGN')
  const [translations, setTranslations] = useState<Record<string, any>>({})

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // In a real app, this would load from files
        const response = await fetch(`/data/${language}/common.json`)
        if (response.ok) {
          const data = await response.json()
          setTranslations(data)
        }
      } catch (error) {
        console.error('Failed to load translations:', error)
      }
    }

    loadTranslations()
  }, [language])

  // Set language
  const setLanguage = (lang: string) => {
    setLanguageState(lang)
    localStorage.setItem('preferred-language', lang)
    
    // Set HTML lang attribute
    document.documentElement.lang = lang
    
    // Set RTL for Arabic
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl'
      document.body.classList.add('rtl')
    } else {
      document.documentElement.dir = 'ltr'
      document.body.classList.remove('rtl')
    }
  }

  // Set currency
  const setCurrency = (curr: string) => {
    setCurrencyState(curr)
    localStorage.setItem('preferred-currency', curr)
  }

  // Translation function
  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }

    if (typeof value === 'string') {
      // Replace parameters
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
          return params[paramKey] || match
        })
      }
      return value
    }

    // Fallback to key if translation not found
    return key
  }

  // Format price
  const formatPrice = (amount: number): string => {
    const curr = currencies.find(c => c.code === currency)
    if (!curr) return `₦${amount.toLocaleString()}`
    
    const convertedAmount = amount * curr.rate
    
    switch (currency) {
      case 'NGN':
        return `₦${amount.toLocaleString('en-NG')}`
      case 'USD':
        return `$${convertedAmount.toFixed(2)}`
      case 'EUR':
        return `€${convertedAmount.toFixed(2)}`
      case 'GBP':
        return `£${convertedAmount.toFixed(2)}`
      case 'CNY':
      case 'JPY':
        return `¥${Math.round(convertedAmount).toLocaleString()}`
      case 'AED':
        return `${convertedAmount.toFixed(2)} د.إ`
      default:
        return `${curr.symbol}${amount.toLocaleString()}`
    }
  }

  // Format date
  const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Format time
  const formatTime = (time: string | Date): string => {
    const t = typeof time === 'string' ? new Date(`1970-01-01T${time}`) : time
    return t.toLocaleTimeString(language, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const currentLanguage = languages.find(l => l.code === language) || languages[0]
  const isRTL = currentLanguage.rtl

  // Initialize language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 
                         navigator.language.split('-')[0] || 'en'
    const savedCurrency = localStorage.getItem('preferred-currency') || 'NGN'
    
    setLanguageState(savedLanguage)
    setCurrencyState(savedCurrency)
    
    // Set HTML attributes
    document.documentElement.lang = savedLanguage
    if (savedLanguage === 'ar') {
      document.documentElement.dir = 'rtl'
      document.body.classList.add('rtl')
    }
  }, [])

  return (
    <I18nContext.Provider
      value={{
        language,
        currency,
        languages,
        currencies,
        translations,
        t,
        setLanguage,
        setCurrency,
        formatPrice,
        formatDate,
        formatTime,
        isRTL,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
