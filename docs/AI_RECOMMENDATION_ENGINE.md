# AI Recommendation Engine Documentation

## Overview

The AI Recommendation Engine is a sophisticated machine learning-powered system that provides personalized restaurant suggestions to users based on their behavior, preferences, location, social data, and booking patterns.

## Architecture

### Core Components

1. **ML Recommendation Engine** (`lib/ml-recommendation-engine.ts`)
   - Collaborative filtering (user-based and item-based)
   - Content-based filtering
   - Contextual recommendations
   - Social recommendations
   - Hybrid recommendation approach
   - Cold start problem solutions

2. **Database Schema** (Prisma models)
   - `MLUserPreference`: Stores learned user preferences
   - `RecommendationLog`: Tracks all recommendation events
   - `RestaurantSimilarity`: Pre-computed restaurant similarities
   - `RecommendationFeedback`: User feedback on recommendations
   - `TrendingRestaurant`: Trending restaurant data
   - `UserRestaurantInteraction`: Interaction matrix for collaborative filtering

3. **API Endpoints**
   - `GET /api/recommendations/personalized`: Main personalized recommendations
   - `GET /api/recommendations/similar`: Similar restaurants
   - `POST /api/recommendations/feedback`: Track user feedback
   - `GET /api/recommendations/trending`: Trending restaurants

4. **Frontend Components**
   - `PersonalizedRecommendations`: Main recommendation display
   - `SimilarRestaurants`: Show similar restaurants
   - `TrendingRestaurants`: Display trending restaurants
   - `RecommendationInsights`: User preference insights

## Recommendation Algorithms

### 1. User-Based Collaborative Filtering

Finds users with similar booking patterns and recommends restaurants they liked.

**Algorithm:**
- Calculate user-user similarity using Jaccard index
- Find top N similar users (neighbors)
- Aggregate their restaurant preferences
- Weight by similarity score

**Use Case:** Best for users with established booking history

### 2. Item-Based Collaborative Filtering

Recommends restaurants similar to those the user has liked.

**Algorithm:**
- Pre-compute restaurant-restaurant similarity matrix
- Find restaurants similar to user's favorites
- Rank by similarity score and user interaction strength

**Use Case:** More scalable, works well with sparse data

### 3. Content-Based Filtering

Matches restaurant features to user preferences.

**Features Used:**
- Cuisine types
- Price range
- Location
- Restaurant features (outdoor seating, parking, etc.)
- Quality metrics (rating, reviews)

**Algorithm:**
- Build user preference profile from history
- Calculate feature matching scores
- Rank restaurants by profile similarity

**Use Case:** Good for new restaurants, explains recommendations well

### 4. Contextual Recommendations

Considers current context for recommendations.

**Context Factors:**
- Location (GPS coordinates, distance)
- Time of day (breakfast, lunch, dinner, late night)
- Day of week (weekday vs weekend patterns)
- Party size
- Occasion (date, business, celebration)

**Use Case:** Real-time personalization

### 5. Social Recommendations

Leverages social connections and sharing behavior.

**Data Sources:**
- Referral network
- Social shares
- Friend activity
- Community preferences

**Use Case:** Viral marketing, trust-based recommendations

### 6. Hybrid Approach

Combines all algorithms with weighted averaging:

```typescript
const weights = {
  collaborativeUser: 0.25,
  collaborativeItem: 0.30,
  contentBased: 0.25,
  contextual: 0.15,
  social: 0.05,
};
```

**Benefits:**
- Balances strengths of different approaches
- Mitigates weaknesses
- Adapts to data availability

## Cold Start Solutions

### New Users (< 3 interactions)

1. Popular restaurants in location
2. Trending restaurants
3. Quick preference learning through explicit input
4. Demographic-based suggestions

### New Restaurants

1. Content-based similarity to existing restaurants
2. Cuisine category analysis
3. Location-based promotion
4. Temporal boost for new listings

## Performance Optimization

### Caching Strategy

- Recommendation results cached for 30 minutes
- Similarity matrix pre-computed daily
- User preferences cached with Redis

### Database Optimization

- Indexed queries for similarity lookups
- Partitioned tables for large datasets
- Batch operations for similarity computation

### Real-Time Processing

- Incremental preference updates
- Asynchronous feedback processing
- Background jobs for heavy computation

## Machine Learning Pipeline

### 1. Data Collection

Automatically tracks:
- User interactions (views, clicks, bookings)
- Restaurant features
- Context data (location, time, device)
- Feedback signals (explicit and implicit)

### 2. Feature Engineering

**User Features:**
- Preferred cuisines (weighted by confidence)
- Price range preference
- Location patterns
- Time preferences
- Feature preferences

**Restaurant Features:**
- Cuisine vector
- Price range
- Quality metrics
- Location coordinates
- Features/amenities

### 3. Model Training

**Offline Training:**
- Restaurant similarity computation (daily)
- User preference aggregation (hourly)
- Trending score calculation (real-time)

**Online Learning:**
- Real-time preference updates from feedback
- Dynamic confidence score adjustment

### 4. Evaluation Metrics

**Accuracy Metrics:**
- Click-through rate (CTR)
- Conversion rate (booking completion)
- User satisfaction scores

**Quality Metrics:**
- Diversity (variety of recommendations)
- Novelty (new discoveries)
- Coverage (restaurant exposure)

**Business Metrics:**
- Booking revenue attribution
- User retention impact
- Restaurant partner satisfaction

## API Usage Examples

### Get Personalized Recommendations

```typescript
// For logged-in user with location
const response = await fetch('/api/recommendations/personalized?' + new URLSearchParams({
  userId: 'user123',
  latitude: '40.7128',
  longitude: '-74.0060',
  cuisine: 'Italian,Japanese',
  priceRange: '$$',
  timeOfDay: 'dinner',
  limit: '10'
}));

const data = await response.json();
// Returns: { success: true, data: [...recommendations], count: 10 }
```

### Get Similar Restaurants

```typescript
const response = await fetch('/api/recommendations/similar?' + new URLSearchParams({
  restaurantId: 'rest123',
  userId: 'user123',
  limit: '5'
}));

const data = await response.json();
// Returns: { success: true, data: [...similar], count: 5 }
```

### Track Recommendation Feedback

```typescript
await fetch('/api/recommendations/feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    restaurantId: 'rest456',
    feedbackType: 'positive',
    action: 'booked',
    rating: 5
  })
});
```

### Get Trending Restaurants

```typescript
const response = await fetch('/api/recommendations/trending?' + new URLSearchParams({
  location: 'New York',
  timeWindow: 'weekly',
  limit: '10'
}));

const data = await response.json();
// Returns: { success: true, data: [...trending], count: 10 }
```

## Component Usage

### PersonalizedRecommendations Component

```tsx
import { PersonalizedRecommendations } from '@/components/recommendations/PersonalizedRecommendations';

<PersonalizedRecommendations
  latitude={40.7128}
  longitude={-74.0060}
  cuisine={['Italian', 'Japanese']}
  priceRange="$$"
  limit={6}
  timeOfDay="dinner"
  onRestaurantClick={(id) => router.push(`/restaurants/${id}`)}
/>
```

### SimilarRestaurants Component

```tsx
import { SimilarRestaurants } from '@/components/recommendations/SimilarRestaurants';

<SimilarRestaurants
  restaurantId={restaurantId}
  limit={4}
  onRestaurantClick={(id) => router.push(`/restaurants/${id}`)}
/>
```

### TrendingRestaurants Component

```tsx
import { TrendingRestaurants } from '@/components/recommendations/TrendingRestaurants';

<TrendingRestaurants
  location="New York"
  limit={8}
  onRestaurantClick={(id) => router.push(`/restaurants/${id}`)}
/>
```

### RecommendationInsights Component

```tsx
import { RecommendationInsights } from '@/components/recommendations/RecommendationInsights';

<RecommendationInsights />
```

## Background Jobs

### Compute Restaurant Similarities

Run daily to update the similarity matrix:

```bash
npm run ml:compute-similarities
```

**What it does:**
- Computes collaborative filtering similarities
- Computes content-based similarities
- Generates hybrid similarity scores
- Updates `RestaurantSimilarity` table

**Schedule:** Daily at 2 AM (recommended)

### Update User Preferences

Run hourly to aggregate user preferences:

```bash
npm run ml:update-preferences
```

**What it does:**
- Analyzes recent user interactions
- Updates confidence scores
- Identifies new preference patterns
- Updates `MLUserPreference` table

**Schedule:** Hourly (recommended)

## Database Migration

To add the recommendation tables to your database:

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Or create a migration
npm run db:migrate
```

## A/B Testing Integration

The recommendation engine integrates with the existing A/B testing framework:

```typescript
// Test different algorithm weights
const testConfig = await getABTestVariant(userId, 'recommendation_weights');

// Use test-specific weights
const recommendations = await mlRecommendationEngine.getPersonalizedRecommendations({
  userId,
  // ... other params
}, testConfig.weights);
```

## Analytics Integration

All recommendations are logged for analysis:

```sql
-- Recommendation performance query
SELECT 
  algorithmUsed,
  COUNT(*) as total_recommendations,
  SUM(CASE WHEN userInteraction = 'booked' THEN 1 ELSE 0 END) as bookings,
  AVG(CASE WHEN userInteraction = 'clicked' THEN 1.0 ELSE 0.0 END) as ctr
FROM recommendation_logs
WHERE createdAt > NOW() - INTERVAL '7 days'
GROUP BY algorithmUsed;
```

## Best Practices

### 1. Feedback Collection

Always track user interactions:
- Clicks on recommendations
- Bookings made
- Dismissals
- Time spent viewing
- Reviews written

### 2. Privacy & Transparency

- Allow users to view their preference profile
- Provide recommendation explanations
- Allow opting out of personalization
- Clear data retention policies

### 3. Quality Assurance

- Monitor recommendation diversity
- Check for filter bubbles
- Ensure new restaurant exposure
- Regular algorithm audits

### 4. Performance Monitoring

- Track API response times
- Monitor cache hit rates
- Watch database query performance
- Alert on anomalies

## Troubleshooting

### Low Recommendation Quality

**Symptoms:** Users not engaging with recommendations

**Solutions:**
1. Check if similarity matrix is up-to-date
2. Verify sufficient user interaction data
3. Adjust algorithm weights
4. Increase diversity filter
5. Add more explicit preference inputs

### Slow API Response

**Symptoms:** Recommendation endpoint taking >2 seconds

**Solutions:**
1. Check cache hit rate
2. Verify database indexes
3. Reduce complexity of collaborative filtering
4. Increase cache TTL
5. Use pagination for large result sets

### Cold Start Issues

**Symptoms:** New users getting generic recommendations

**Solutions:**
1. Implement onboarding preference quiz
2. Use demographic data
3. Increase weight of content-based filtering
4. Promote trending restaurants
5. Geographic targeting

## Future Enhancements

1. **Deep Learning Models**
   - Neural collaborative filtering
   - Embedding-based recommendations
   - Sequence models for temporal patterns

2. **Advanced Features**
   - Multi-armed bandit for exploration/exploitation
   - Contextual bandits for personalization
   - Reinforcement learning for long-term optimization

3. **Rich Context**
   - Weather-based recommendations
   - Event-aware suggestions
   - Mood-based filtering
   - Dietary restriction handling

4. **Social Network Analysis**
   - Friend recommendation influence
   - Community detection
   - Influencer identification

## Support

For issues or questions:
- Check logs in `/var/log/recommendation-engine.log`
- Review Prisma Studio for data inspection
- Monitor Redis for cache issues
- Check analytics dashboard for performance metrics
