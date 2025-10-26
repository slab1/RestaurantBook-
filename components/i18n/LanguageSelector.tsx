'use client';

import React, { useState } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { i18nConfig, Locale, getLanguageMetadata } from '@/lib/i18n/config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function LanguageSelector() {
  const { locale, setLocale, isRTL } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = getLanguageMetadata(locale);

  const languageGroups = [
    {
      title: 'International',
      languages: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar'] as Locale[],
    },
    {
      title: 'Nigerian Languages',
      languages: ['ha', 'yo', 'ig', 'ee', 'ff', 'kr', 'ti', 'ib'] as Locale[],
    },
  ];

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <span className="sm:hidden text-xl">{currentLanguage.flag}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <Card className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 max-h-[500px] overflow-y-auto z-50 shadow-lg`}>
            <div className="p-2 space-y-1">
              {languageGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                    {group.title}
                  </div>
                  {group.languages.map((lang) => {
                    const metadata = getLanguageMetadata(lang);
                    const isActive = locale === lang;

                    return (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        } ${metadata.rtl ? 'text-right' : 'text-left'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{metadata.flag}</span>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{metadata.nativeName}</span>
                            {metadata.region && (
                              <span className="text-xs opacity-70">{metadata.region}</span>
                            )}
                            {metadata.speakers && (
                              <span className="text-xs opacity-70">{metadata.speakers} speakers</span>
                            )}
                          </div>
                        </div>
                        {isActive && <Check className="h-4 w-4" />}
                        {metadata.rtl && (
                          <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded">
                            RTL
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

/**
 * Compact language selector for mobile
 */
export function CompactLanguageSelector() {
  const { locale, setLocale } = useI18n();
  const currentLanguage = getLanguageMetadata(locale);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value as Locale;
    setLocale(newLocale);
  };

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={handleChange}
        className="appearance-none bg-muted border border-border rounded-lg px-8 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <optgroup label="International">
          {['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar'].map((lang) => {
            const metadata = getLanguageMetadata(lang as Locale);
            return (
              <option key={lang} value={lang}>
                {metadata.flag} {metadata.nativeName}
              </option>
            );
          })}
        </optgroup>
        <optgroup label="Nigerian Languages">
          {['ha', 'yo', 'ig', 'ee', 'ff', 'kr', 'ti', 'ib'].map((lang) => {
            const metadata = getLanguageMetadata(lang as Locale);
            return (
              <option key={lang} value={lang}>
                {metadata.flag} {metadata.nativeName}
              </option>
            );
          })}
        </optgroup>
      </select>
      <Globe className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
    </div>
  );
}

/**
 * Nigerian language suggestion banner
 */
export function NigerianLanguageSuggestion({ city, state }: { city?: string; state?: string }) {
  const { locale, setLocale } = useI18n();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already using Nigerian language or dismissed
  if (dismissed || i18nConfig.nigerianLanguages.includes(locale)) {
    return null;
  }

  // Get suggested language based on location
  let suggestedLocale: Locale | null = null;
  let locationName = '';

  if (city) {
    const normalized = city.toLowerCase().replace(/\s+/g, '-');
    const cityLang = i18nConfig.nigerianRegionLanguageMap[
      normalized as keyof typeof i18nConfig.nigerianRegionLanguageMap
    ];
    if (cityLang && cityLang !== 'en') {
      suggestedLocale = cityLang as Locale;
      locationName = city;
    }
  }

  if (!suggestedLocale && state) {
    const normalized = state.toLowerCase().replace(/\s+/g, '-');
    const stateLang = i18nConfig.nigerianRegionLanguageMap[
      normalized as keyof typeof i18nConfig.nigerianRegionLanguageMap
    ];
    if (stateLang && stateLang !== 'en') {
      suggestedLocale = stateLang as Locale;
      locationName = state;
    }
  }

  if (!suggestedLocale) return null;

  const suggestedLanguage = getLanguageMetadata(suggestedLocale);

  return (
    <div className="bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-950 dark:to-yellow-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-3xl">{suggestedLanguage.flag}</span>
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Switch to {suggestedLanguage.nativeName}?
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              You're in {locationName}. Would you like to view the site in {suggestedLanguage.name}?
            </p>
            <div className="flex space-x-2 mt-3">
              <Button
                size="sm"
                onClick={() => {
                  setLocale(suggestedLocale!);
                  setDismissed(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Switch to {suggestedLanguage.nativeName}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDismissed(true)}
              >
                Stay in English
              </Button>
            </div>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
        >
          <span className="sr-only">Dismiss</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
