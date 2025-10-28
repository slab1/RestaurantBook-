'use client';

/**
 * Example page demonstrating i18n features
 * This shows how to use all i18n capabilities in a real component
 */

import React from 'react';
import { useI18n, useTranslation, useLocale, useCurrency } from '@/lib/i18n/i18n-context';
import { LanguageSelector, NigerianLanguageSuggestion } from '@/components/i18n/LanguageSelector';
import { CurrencySelector, PriceDisplay } from '@/components/i18n/CurrencySelector';
import { getPopularDishes, getPaymentMethods, getCulturalContext } from '@/lib/i18n/cultural-adaptations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function I18nExamplePage() {
  const { t } = useTranslation();
  const { locale, isRTL, culturalContext } = useI18n();
  const [currentLocale] = useLocale();
  const { currency } = useCurrency();

  const popularDishes = getPopularDishes(currentLocale);
  const paymentMethods = getPaymentMethods(currentLocale);

  return (
    <div className={`min-h-screen p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Language & Currency Selectors */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">{t('common.welcome')}</h1>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <CurrencySelector />
          </div>
        </div>

        {/* Nigerian Language Suggestion */}
        <NigerianLanguageSuggestion city="Lagos" state="Lagos State" />

        {/* Current Locale Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">{t('common.language')}:</span>
              <span>{locale}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t('common.currency')}:</span>
              <span>{currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Text Direction:</span>
              <span>{isRTL ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Sample Translations */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Translations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Common</h3>
                <ul className="space-y-1 text-sm">
                  <li>{t('common.search')}</li>
                  <li>{t('common.login')}</li>
                  <li>{t('common.signup')}</li>
                  <li>{t('common.save')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Navigation</h3>
                <ul className="space-y-1 text-sm">
                  <li>{t('navigation.home')}</li>
                  <li>{t('navigation.restaurants')}</li>
                  <li>{t('navigation.bookings')}</li>
                  <li>{t('navigation.contact')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Restaurant</h3>
                <ul className="space-y-1 text-sm">
                  <li>{t('restaurant.findRestaurants')}</li>
                  <li>{t('restaurant.viewMenu')}</li>
                  <li>{t('restaurant.makeBooking')}</li>
                  <li>{t('restaurant.trending')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Booking</h3>
                <ul className="space-y-1 text-sm">
                  <li>{t('booking.title')}</li>
                  <li>{t('booking.date')}</li>
                  <li>{t('booking.time')}</li>
                  <li>{t('booking.guests')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Formatting Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Price Formatting Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Small Amount</h4>
                <PriceDisplay amount={5000} showComparison />
              </div>
              <div>
                <h4 className="font-medium mb-2">Medium Amount</h4>
                <PriceDisplay amount={50000} showComparison />
              </div>
              <div>
                <h4 className="font-medium mb-2">Large Amount</h4>
                <PriceDisplay amount={1500000} showComparison />
              </div>
              <div>
                <h4 className="font-medium mb-2">Very Large Amount</h4>
                <PriceDisplay amount={5000000} showComparison />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cultural Context */}
        <Card>
          <CardHeader>
            <CardTitle>Cultural Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Dining Times</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Breakfast ends: {culturalContext.diningTimes.breakfastEnd}</div>
                <div>Lunch: {culturalContext.diningTimes.lunchStart} - {culturalContext.diningTimes.lunchEnd}</div>
                <div>Dinner starts: {culturalContext.diningTimes.dinnerStart}</div>
                <div>Dinner ends: {culturalContext.diningTimes.dinnerEnd}</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Payment Methods</h4>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map(method => (
                  <Badge key={method} variant="secondary">
                    {method.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Tipping Culture</h4>
              <p className="text-sm">{culturalContext.tippingCulture}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Group Booking Style</h4>
              <p className="text-sm">{culturalContext.groupBookingStyle}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Date & Time Format</h4>
              <div className="text-sm">
                <div>Date: {culturalContext.dateFormat}</div>
                <div>Time: {culturalContext.timeFormat === '12h' ? '12-hour' : '24-hour'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Dishes (Nigerian Languages Only) */}
        {popularDishes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Popular Local Dishes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {popularDishes.map(dish => (
                  <Badge key={dish} variant="outline" className="text-base py-2 px-4">
                    {dish}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cultural Notes */}
        {culturalContext.culturalNotes && culturalContext.culturalNotes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Cultural Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {culturalContext.culturalNotes.map((note, index) => (
                  <li key={index} className="text-sm">{note}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Address Format */}
        <Card>
          <CardHeader>
            <CardTitle>Address Format</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Expected order for addresses in this locale:
            </p>
            <div className="flex flex-wrap gap-2">
              {culturalContext.addressFormat.map((field, index) => (
                <Badge key={index} variant="secondary">
                  {index + 1}. {field.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Developer Info */}
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>For Developers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm font-mono">
            <div>Current locale: <code className="bg-background px-2 py-1 rounded">{locale}</code></div>
            <div>Currency: <code className="bg-background px-2 py-1 rounded">{currency}</code></div>
            <div>Is RTL: <code className="bg-background px-2 py-1 rounded">{isRTL.toString()}</code></div>
            <div className="mt-4">
              <p className="font-sans text-xs text-muted-foreground">
                See docs/I18N_QUICK_START.md for implementation guide
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
