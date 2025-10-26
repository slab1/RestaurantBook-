# i18n Quick Start Guide

## Setup (3 Steps)

### 1. Wrap Your App

```tsx
// app/layout.tsx
import { I18nProvider } from '@/lib/i18n/i18n-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <I18nProvider initialLocale="en">
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

### 2. Add Selectors to Navbar

```tsx
// components/layout/navbar.tsx
import { LanguageSelector } from '@/components/i18n/LanguageSelector';
import { CurrencySelector } from '@/components/i18n/CurrencySelector';

<nav>
  <LanguageSelector />
  <CurrencySelector />
</nav>
```

### 3. Use in Components

```tsx
import { useTranslation } from '@/lib/i18n/i18n-context';

export function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('common.welcome')}</h1>;
}
```

## Common Tasks

### Display Translated Text

```tsx
const { t } = useTranslation();

<h1>{t('common.welcome')}</h1>
<p>{t('restaurant.findRestaurants')}</p>
<button>{t('booking.confirmBooking')}</button>
```

### Format Prices

```tsx
import { PriceDisplay } from '@/components/i18n/CurrencySelector';

<PriceDisplay amount={5000} showComparison />
// Shows: ₦5,000 (if locale is Nigerian)
// Shows: $50.00 (if locale is en and currency is USD)
```

### Switch Language Programmatically

```tsx
const [locale, setLocale] = useLocale();

<button onClick={() => setLocale('ha')}>
  Switch to Hausa
</button>
```

### Show Nigerian Language Suggestion

```tsx
import { NigerianLanguageSuggestion } from '@/components/i18n/LanguageSelector';

<NigerianLanguageSuggestion city="Lagos" state="Lagos State" />
// Auto-suggests Yoruba for Lagos users
```

### Use Cultural Context

```tsx
const { culturalContext } = useI18n();
const { locale } = useI18n();
const popularDishes = getPopularDishes(locale);

<div>
  <h3>Dining Hours</h3>
  <p>Breakfast ends: {culturalContext.diningTimes.breakfastEnd}</p>
  
  <h3>Popular Dishes</h3>
  {popularDishes.map(dish => <span key={dish}>{dish}</span>)}
</div>
```

### Check if RTL

```tsx
const { isRTL } = useI18n();

<div className={isRTL ? 'text-right' : 'text-left'}>
  Content
</div>
```

## Supported Languages

### International
- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇨🇳 Chinese (zh)
- 🇯🇵 Japanese (ja)
- 🇸🇦 Arabic (ar) - RTL

### Nigerian
- 🇳🇬 Hausa (ha) - 80M+ speakers
- 🇳🇬 Yoruba (yo) - 40M+ speakers
- 🇳🇬 Igbo (ig) - 40M+ speakers
- 🇳🇬 Edo (ee) - 10M+ speakers
- 🇳🇬 Fulfulde (ff) - 25M+ speakers
- 🇳🇬 Kanuri (kr) - 15M+ speakers
- 🇳🇬 Tiv (ti) - 7M+ speakers
- 🇳🇬 Ibibio (ib) - 5M+ speakers

## Translation Keys Reference

```json
{
  "common.welcome": "Welcome",
  "common.search": "Search",
  "common.login": "Login",
  "common.signup": "Sign Up",
  
  "navigation.home": "Home",
  "navigation.restaurants": "Restaurants",
  "navigation.bookings": "Bookings",
  
  "restaurant.findRestaurants": "Find Restaurants",
  "restaurant.viewMenu": "View Menu",
  "restaurant.makeBooking": "Make a Booking",
  "restaurant.trending": "Trending",
  
  "booking.title": "Book a Table",
  "booking.date": "Date",
  "booking.time": "Time",
  "booking.guests": "Number of Guests",
  
  "search.searchPlaceholder": "Search restaurants...",
  "search.filterBy": "Filter By",
  "search.noResults": "No results found"
}
```

## Nigerian-Specific Features

### Auto-Detect Nigerian Language

```tsx
import { LanguageDetector } from '@/lib/i18n/language-detector';

// Detect language by city
const language = LanguageDetector.getNigerianLanguageByRegion("Lagos");
// Returns: 'yo' (Yoruba)
```

### Popular Nigerian Dishes

```tsx
import { getPopularDishes } from '@/lib/i18n/cultural-adaptations';

const hausaDishes = getPopularDishes('ha');
// ['tuwo masara', 'suya', 'kunun gyada', ...]

const yorubaDishes = getPopularDishes('yo');
// ['amala', 'efo riro', 'eba', 'pounded yam', ...]
```

### Nigerian Payment Methods

```tsx
import { getPaymentMethods } from '@/lib/i18n/cultural-adaptations';

const methods = getPaymentMethods('ha');
// ['cash', 'bank_transfer', 'mobile_money', 'ussd']
```

### Nigerian Naira Formatting

```tsx
import { CurrencyService } from '@/lib/i18n/currency-service';

CurrencyService.formatNaira(1500000, true);  // "₦1.5M"
CurrencyService.formatNaira(75000, true);    // "₦75K"
CurrencyService.formatNaira(500, false);     // "₦500"
```

## Troubleshooting

### Translations Not Showing

1. Check I18nProvider wraps your app
2. Verify translation key exists in JSON file
3. Check console for errors

### Language Not Changing

1. Clear browser cache and cookies
2. Check locale value in component
3. Verify setLocale is being called

### RTL Not Working

1. Check if HTML dir attribute is set
2. Verify isRTL flag in component
3. Add RTL-specific CSS if needed

### Price Format Wrong

1. Verify currency is set correctly
2. Check locale matches expected currency
3. Ensure CurrencyService has exchange rates

## Adding New Translations

1. Open `locales/[lang]/common.json`
2. Add new key-value pairs
3. Keep same structure across all languages
4. Use professional translator for quality

Example:
```json
{
  "myFeature": {
    "title": "My Feature",
    "description": "Feature description"
  }
}
```

Then use:
```tsx
{t('myFeature.title')}
{t('myFeature.description')}
```

## Performance Tips

1. **Preload Common Languages**
   ```tsx
   import { preloadTranslations } from '@/lib/i18n/translations';
   
   useEffect(() => {
     preloadTranslations(['en', 'ha', 'yo', 'ig']);
   }, []);
   ```

2. **Use Translation Caching** - Already built-in

3. **Lazy Load Translations** - Already built-in

## Full API Reference

See `I18N_IMPLEMENTATION_SUMMARY.md` for complete documentation.
