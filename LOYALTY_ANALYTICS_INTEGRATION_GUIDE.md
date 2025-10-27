# Loyalty Analytics System Integration Guide

## Overview

The loyalty analytics system provides comprehensive tracking and insights for loyalty programs with a specific focus on Nigerian market insights and local business growth. This system integrates seamlessly with the existing dashboard infrastructure.

## Features

### Core Analytics
- **Program Performance Metrics**: Track user participation, retention, and engagement
- **User Engagement Tracking**: Monitor daily/weekly/monthly active users and interactions
- **Tier Distribution Analytics**: Analyze user distribution across loyalty tiers
- **Points Flow Analysis**: Track points issuance, redemption, and expiration
- **Achievement Completion Rates**: Monitor achievement success and completion times
- **Partner Performance Tracking**: Evaluate restaurant partner performance
- **ROI Calculations**: Comprehensive return on investment analysis

### Nigerian Market Insights
- **Regional Distribution**: User analytics by Nigerian states
- **Language Preferences**: Support for English, Hausa, Yoruba, and Igbo
- **Cultural Events**: Integration with Nigerian cultural celebrations
- **Economic Indicators**: Purchasing power and price sensitivity analysis
- **Local Business Growth**: Impact on local merchants and job creation

## Components

### 1. Core Analytics Library (`lib/loyalty-analytics.ts`)
- Main analytics engine with 1700+ lines of comprehensive functionality
- TypeScript interfaces for all data structures
- Factory function for easy integration
- Helper functions for quick dashboard summaries

### 2. Dashboard Components

#### LoyaltyAnalyticsDashboard (`components/dashboard/LoyaltyAnalyticsDashboard.tsx`)
- Full-featured analytics dashboard with 8 tab sections
- Interactive charts using Chart.js
- Nigerian regional insights
- Real-time metric updates
- Comprehensive recommendations system

#### LoyaltyAnalyticsWidget (`components/dashboard/LoyaltyAnalyticsWidget.tsx`)
- Compact widget for dashboard integration
- Configurable display modes (compact/full)
- Quick action buttons
- Key performance indicators

### 3. API Integration (`app/api/analytics/loyalty/route.ts`)
- RESTful API endpoints for analytics data
- Support for custom date ranges and filters
- Multiple metric types (program, engagement, tiers, points, ROI)
- Nigerian market-specific queries

## Installation & Integration

### 1. Install Dependencies
```bash
# Ensure these dependencies are installed
npm install date-fns chart.js react-chartjs-2
```

### 2. Update Database Schema
The analytics system works with the existing Prisma schema:
- Users with `loyaltyPoints` and `totalSpent` fields
- `LoyaltyTransaction` model for points tracking
- Existing Nigerian language support in the schema

### 3. Import and Use Components

#### Full Dashboard Integration
```tsx
import LoyaltyAnalyticsDashboard from '@/components/dashboard/LoyaltyAnalyticsDashboard';

// In your dashboard page
export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <LoyaltyAnalyticsDashboard 
        restaurantId="optional-restaurant-id"
        className="w-full"
      />
    </div>
  );
}
```

#### Widget Integration
```tsx
import LoyaltyAnalyticsWidget from '@/components/dashboard/LoyaltyAnalyticsWidget';

// Compact widget for dashboard sidebar
<LoyaltyAnalyticsWidget 
  compact={true}
  restaurantId="restaurant-id"
/>

// Full widget with details
<LoyaltyAnalyticsWidget 
  showDetails={true}
  restaurantId="restaurant-id"
/>
```

#### API Integration
```typescript
// Fetch loyalty analytics data
const fetchLoyaltyAnalytics = async () => {
  const response = await fetch('/api/analytics/loyalty?period=30d&restaurantId=123');
  const data = await response.json();
  return data.data;
};

// Fetch specific metric
const fetchSpecificMetric = async (metric: string) => {
  const response = await fetch('/api/analytics/loyalty/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metric: 'program',
      dateRange: { start: '2024-01-01', end: '2024-01-31' }
    })
  });
  return await response.json();
};
```

## Configuration Options

### Analytics Configuration
```typescript
const analyticsConfig = {
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31')
  },
  restaurantId?: 'restaurant-id',
  state?: 'Lagos', // Nigerian state
  language?: 'en', // Nigerian language code
  includeComparison?: true
};
```

### Nigerian Market Specifics
- **Supported States**: All 36 Nigerian states + FCT
- **Languages**: English (en), Hausa (ha), Yoruba (yo), Igbo (ig)
- **Currency**: Nigerian Naira (NGN) formatting
- **Cultural Events**: Christmas, Eid, New Year celebrations
- **Economic Indicators**: State-wise purchasing power analysis

## API Endpoints

### GET /api/analytics/loyalty
Query parameters:
- `period`: Time period (7d, 30d, 90d)
- `restaurantId`: Specific restaurant filter
- `state`: Nigerian state filter
- `language`: Language preference filter

Response:
```json
{
  "success": true,
  "data": { /* comprehensive analytics object */ },
  "summary": { /* dashboard summary stats */ },
  "metadata": { /* query metadata */ }
}
```

### POST /api/analytics/loyalty/summary
Request body:
```json
{
  "dateRange": { "start": "2024-01-01", "end": "2024-01-31" },
  "restaurantId": "optional-restaurant-id",
  "metric": "program|engagement|tiers|points|roi|nigerian-market"
}
```

## Key Metrics Explained

### Program Performance
- **Participation Rate**: Percentage of users in loyalty program
- **Retention Rate**: Users still active after signup
- **Customer LTV**: Average lifetime value of loyalty users
- **RFM Score**: Recency, Frequency, Monetary analysis

### Engagement Metrics
- **Daily Active Users**: Users with daily interactions
- **Social Engagement**: Shares, reviews, referrals
- **App Usage**: Sessions, bounce rate, page views
- **Engagement Score**: Composite engagement metric

### Tier Analysis
- **Distribution**: User count by tier (Bronze, Silver, Gold, Platinum)
- **Progression**: Upgrades, downgrades, time to upgrade
- **Retention by Tier**: Churn rates per tier level

### Points Economy
- **Flow Analysis**: Issued vs redeemed points
- **Velocity**: Speed of points earning/redeeming
- **Expiration**: Points expired by tier
- **Economics**: Cost/revenue per point analysis

### Nigerian Market Insights
- **Regional Performance**: User distribution by state
- **Cultural Events**: Impact of Nigerian celebrations
- **Language Preferences**: Engagement by local language
- **Economic Impact**: Business growth and job creation

## Customization

### Adding New Metrics
1. Extend the `ComprehensiveLoyaltyAnalytics` interface
2. Implement calculation method in `LoyaltyAnalytics` class
3. Add to API response
4. Update dashboard components

### Nigerian Market Expansion
1. Add new states to `NIGERIAN_STATES` array
2. Update cultural preferences mapping
3. Extend regional analysis methods

### Custom Charts
The system uses Chart.js for visualization. To add new chart types:

```tsx
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

// Add to your component
const customChartData = {
  labels: ['Data1', 'Data2', 'Data3'],
  datasets: [{
    label: 'Custom Metric',
    data: [10, 20, 30],
    backgroundColor: 'rgba(59, 130, 246, 0.8)'
  }]
};

<Line data={customChartData} options={{ responsive: true }} />
```

## Performance Considerations

### Database Optimization
- Use database indexes on frequently queried fields
- Consider implementing data aggregation for large datasets
- Use connection pooling for high-traffic scenarios

### Caching Strategy
- Cache analytics results for 15-30 minutes
- Implement Redis for session-level caching
- Consider pre-computed daily summaries

### Real-time Updates
- Use WebSocket connections for live metric updates
- Implement incremental data loading for large datasets
- Consider using background jobs for heavy calculations

## Security & Privacy

### Data Protection
- Ensure user data anonymization for analytics
- Implement proper access controls for sensitive metrics
- Comply with Nigerian data protection regulations

### API Security
- Rate limiting on analytics endpoints
- Authentication required for sensitive data
- Input validation for all parameters

## Troubleshooting

### Common Issues

1. **Missing Data**: Check database connections and schema alignment
2. **Slow Performance**: Verify database indexes and consider caching
3. **Chart Rendering**: Ensure Chart.js dependencies are properly installed
4. **API Errors**: Check request parameters and server logs

### Debug Mode
Enable debug logging by setting environment variable:
```bash
LOYALTY_ANALYTICS_DEBUG=true
```

## Examples

### Complete Dashboard Integration Example
```tsx
import React, { useState } from 'react';
import LoyaltyAnalyticsDashboard from '@/components/dashboard/LoyaltyAnalyticsDashboard';
import LoyaltyAnalyticsWidget from '@/components/dashboard/LoyaltyAnalyticsWidget';

export default function RestaurantDashboard() {
  const [selectedRestaurant, setSelectedRestaurant] = useState('restaurant-123');
  
  return (
    <div className="space-y-6">
      {/* Widget in header */}
      <LoyaltyAnalyticsWidget 
        restaurantId={selectedRestaurant}
        compact={true}
        className="mb-6"
      />
      
      {/* Full analytics */}
      <LoyaltyAnalyticsDashboard 
        restaurantId={selectedRestaurant}
      />
    </div>
  );
}
```

### API Usage Example
```typescript
// Get overall loyalty analytics
const analytics = await fetch('/api/analytics/loyalty?period=30d');

// Get specific Nigerian market insights
const nigerianData = await fetch('/api/analytics/loyalty/summary', {
  method: 'POST',
  body: JSON.stringify({
    metric: 'nigerian-market',
    state: 'Lagos',
    dateRange: { start: '2024-01-01', end: '2024-01-31' }
  })
});
```

## Support

For technical support or feature requests:
1. Check the troubleshooting section
2. Review the API documentation
3. Test with the provided examples
4. Ensure all dependencies are properly installed

The loyalty analytics system is designed to be comprehensive, performant, and specifically tailored for the Nigerian market while providing global-standard analytics capabilities.