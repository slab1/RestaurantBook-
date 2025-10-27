# Loyalty Dashboard Component

A comprehensive, mobile-optimized loyalty program interface designed specifically for Nigerian users, built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 🎯 Core Functionality
- **VIP Tier System**: 5-tier loyalty system (Bronze → Silver → Gold → Platinum → Diamond)
- **Points Balance**: Real-time tracking with Naira currency display
- **Points History**: Detailed transaction history with categories
- **Achievement Gallery**: Unlockable achievements with rarity levels
- **Streak Counter**: Track consecutive days of activity
- **Leaderboard**: Compete with other users
- **Redemption Store**: Exchange points for rewards
- **Partner Offers**: Exclusive deals with Nigerian businesses

### 🎨 User Experience
- **Mobile-First Design**: Optimized for touch interfaces
- **Haptic Feedback**: Native vibration feedback on supported devices
- **Interactive Animations**: Smooth transitions and hover effects
- **Responsive Layout**: Works seamlessly across all device sizes
- **Gradient Themes**: Modern, visually appealing design
- **PWA Integration**: Works offline and can be installed

### 🇳🇬 Nigerian Localization
- **Naira Currency**: Full support for Nigerian Naira (₦)
- **Multi-language Support**: Compatible with Yoruba, Igbo, and Hausa
- **Local Partners**: GTBank, MTN, Access Bank offers
- **Cultural Events**: Nigerian holiday celebrations
- **Timezone Aware**: Local time and date formatting

### 📊 Data Visualization
- **Progress Bars**: Visual tier progression
- **Achievement Badges**: Rarity-based achievement system
- **Interactive Cards**: Tap to expand and interact
- **Real-time Updates**: Live data updates
- **Toast Notifications**: User feedback system

## Component Structure

```
components/loyalty/
├── LoyaltyDashboard.tsx     # Main component (1153 lines)
├── index.ts                 # Export file
└── README.md               # Documentation
```

## Usage

### Basic Implementation

```tsx
import { LoyaltyDashboard } from '@/components/loyalty';

export default function LoyaltyPage() {
  return <LoyaltyDashboard />;
}
```

### With Custom Data

The component accepts user data through props (can be extended):

```tsx
const userData = {
  currentTier: 'Gold',
  pointsBalance: 8750,
  streakCount: 23,
  // ... more properties
};

return <LoyaltyDashboard user={userData} />;
```

## Component Features in Detail

### 1. Overview Tab
- **Quick Stats**: 4-card overview of key metrics
- **VIP Progress**: Current tier and progress to next tier
- **Birthday Countdown**: Special birthday rewards (within 30 days)
- **Active Events**: Running promotions with point multipliers
- **Recent Achievements**: Latest unlocked achievements with sharing

### 2. Rewards Tab
- **Redemption Store**: Grid of available rewards
- **Point Costs**: Clear pricing in points
- **Categories**: Discount, Free Item, Experience, Partner
- **Limited Offers**: Stock counter for scarce items
- **Redeem Flow**: One-tap redemption with confirmation

### 3. History Tab
- **Transaction List**: Chronological point activities
- **Icons**: Visual indicators for transaction types
  - Green: Earned points
  - Purple: Bonus points
  - Red: Redeemed points
  - Gray: Expired points
- **Details**: Restaurant, date, and order information

### 4. Leaderboard Tab
- **Top Members**: Ranked user list
- **Tier Badges**: Visual tier indicators
- **Rank Icons**: Special icons for top 3 positions
- **User Position**: Highlighted user ranking

### 5. Offers Tab
- **Partner Deals**: Local business partnerships
- **Valid Until**: Expiration dates
- **Terms**: Clear offer conditions
- **Categories**: Banking, Telecom, etc.

## Technical Implementation

### State Management
```typescript
const [user, setUser] = useState<LoyaltyUser | null>(null);
const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
const [achievements, setAchievements] = useState<Achievement[]>([]);
// ... more state
```

### Currency Formatting
```typescript
const formatCurrency = useCallback((amount: number, compact = false) => {
  return CurrencyService.formatNaira(amount, compact);
}, []);
```

### Haptic Feedback
```typescript
const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = { light: [10], medium: [20], heavy: [30] };
    navigator.vibrate(patterns[type]);
  }
}, []);
```

### Tier System
```typescript
const tiers: Record<string, TierInfo> = {
  Bronze: { minPoints: 0, maxPoints: 999, /* ... */ },
  Silver: { minPoints: 1000, maxPoints: 4999, /* ... */ },
  // ... more tiers
};
```

## Customization

### Adding New Achievements
```typescript
{
  id: 'new',
  title: 'New Achievement',
  description: 'Complete this action',
  icon: <YourIcon className="w-6 h-6" />,
  progress: 0,
  maxProgress: 10,
  unlocked: false,
  reward: { points: 500 },
  rarity: 'epic'
}
```

### Modifying Tier Benefits
Edit the `tiers` object in the component:

```typescript
Gold: {
  name: 'Gold',
  minPoints: 5000,
  maxPoints: 14999,
  benefits: [
    '15% points on orders',
    'Free main course monthly',
    'VIP support'
  ],
  // ... more properties
}
```

### Adding Partner Offers
```typescript
{
  id: 'partner-id',
  partnerName: 'Partner Name',
  offerTitle: 'Offer Title',
  description: 'Offer description',
  validUntil: new Date('2025-12-31'),
  // ... more properties
}
```

## Dependencies

- React 18+
- Next.js 14+
- TypeScript 5+
- Tailwind CSS 3+
- Lucide React (icons)
- class-variance-authority
- @/lib/i18n (internal i18n system)
- @/components/ui/* (shadcn/ui components)

## Performance Optimizations

1. **useCallback**: Memoized functions to prevent re-renders
2. **useEffect**: Efficient state initialization
3. **Conditional Rendering**: Only render active tab content
4. **Image Optimization**: Lazy loading for reward images
5. **Virtual Scrolling**: Can be added for long lists

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast mode compatibility
- Screen reader friendly
- Touch target sizes (44px minimum)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- [ ] Gamification features (badges, levels)
- [ ] Referral program integration
- [ ] Social sharing of achievements
- [ ] Offline mode support
- [ ] Push notifications for special events
- [ ] AR features for restaurant check-ins
- [ ] AI-powered personalized recommendations
- [ ] Multi-currency support beyond Naira
- [ ] Loyalty tier prediction ML model
- [ ] Social leaderboard with friends

## Contributing

When contributing to this component:

1. Follow the existing code style
2. Maintain TypeScript type safety
3. Test on mobile devices
4. Ensure haptic feedback works correctly
5. Update this README for new features
6. Add appropriate translations

## License

Proprietary - All rights reserved

---

**Built with ❤️ for Nigerian restaurant-goers**
