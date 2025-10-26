# i18n Quick Start Guide

This guide will help you quickly integrate the i18n system into your application.

## 🚀 Quick Setup (5 Minutes)

### Step 1: Run Database Migration

```bash
cd /workspace
npx prisma migrate dev --name add_i18n_models
npx prisma generate
```

### Step 2: Import RTL CSS

Add to `app/globals.css`:

```css
/* Add at the end of the file */
@import '../styles/rtl.css';
```

### Step 3: Wrap Your App with I18n Provider

Update `app/layout.tsx`:

```tsx
import { I18nProvider } from '@/lib/i18n/i18n-context';
import { Navbar } from '@/components/layout/Navbar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <I18nProvider>
          <Navbar />
          <main>{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
```

### Step 4: Use i18n in Your Pages

```tsx
'use client';

import { useI18n } from '@/lib/i18n/i18n-context';

export default function HomePage() {
  const { t, locale, currency, direction } = useI18n();
  
  return (
    <div dir={direction}>
      <h1>{t('common.welcome')}</h1>
      <p>Current language: {locale}</p>
      <p>Current currency: {currency}</p>
    </div>
  );
}
```

That's it! Your app now has full i18n support. 🎉

---

## 📖 Common Usage Patterns

### Pattern 1: Display Translated Text

```tsx
import { useI18n } from '@/lib/i18n/i18n-context';

function MyComponent() {
  const { t } = useI18n();
  
  return (
    <div>
      <h1>{t('navigation.home')}</h1>
      <p>{t('common.welcome')}</p>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### Pattern 2: Format Currency

```tsx
import { useI18n } from '@/lib/i18n/i18n-context';
import { CurrencyService } from '@/lib/i18n/currency-service';

function PriceDisplay({ amount }: { amount: number }) {
  const { currency, locale } = useI18n();
  const currencyService = CurrencyService.getInstance();
  
  const formatted = currencyService.formatCurrency(amount, currency, locale);
  
  return <span className="price">{formatted}</span>;
}
```

### Pattern 3: Get Cultural Context

```tsx
import { getCulturalContext } from '@/lib/i18n/cultural-adaptations';
import { useI18n } from '@/lib/i18n/i18n-context';

function RestaurantInfo() {
  const { locale } = useI18n();
  const cultural = getCulturalContext(locale);
  
  return (
    <div>
      <h3>Dining Times</h3>
      <p>Breakfast: {cultural.diningTimes.breakfast}</p>
      <p>Lunch: {cultural.diningTimes.lunch}</p>
      <p>Dinner: {cultural.diningTimes.dinner}</p>
    </div>
  );
}
```

For full documentation, see [I18N_IMPLEMENTATION_COMPLETE.md](./I18N_IMPLEMENTATION_COMPLETE.md)
