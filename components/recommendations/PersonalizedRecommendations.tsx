'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Star, TrendingUp, Users, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string[];
  priceRange: string;
  rating: number;
  totalReviews: number;
  address: string;
  city: string;
  images: string[];
  coverImage: string;
  features: string[];
  latitude?: number;
  longitude?: number;
}

interface Recommendation {
  restaurantId: string;
  score: number;
  confidence: number;
  reasons: string[];
  algorithm: string;
  restaurant: Restaurant;
}

interface PersonalizedRecommendationsProps {
  latitude?: number;
  longitude?: number;
  cuisine?: string[];
  priceRange?: string;
  limit?: number;
  timeOfDay?: 'breakfast' | 'lunch' | 'dinner' | 'late_night';
  onRestaurantClick?: (restaurantId: string) => void;
}

export function PersonalizedRecommendations({
  latitude,
  longitude,
  cuisine,
  priceRange,
  limit = 6,
  timeOfDay,
  onRestaurantClick,
}: PersonalizedRecommendationsProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [user?.id, latitude, longitude, cuisine, priceRange, timeOfDay]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        ...(user?.id && { userId: user.id }),
        ...(latitude && { latitude: latitude.toString() }),
        ...(longitude && { longitude: longitude.toString() }),
        ...(cuisine && { cuisine: cuisine.join(',') }),
        ...(priceRange && { priceRange }),
        ...(timeOfDay && { timeOfDay }),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/recommendations/personalized?${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }

      setRecommendations(data.data);
    } catch (err) {
      logger.error('Error fetching recommendations', { error: err });
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const trackFeedback = async (restaurantId: string, action: string) => {
    if (!user?.id) return;

    try {
      await fetch('/api/recommendations/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          restaurantId,
          feedbackType: action === 'clicked' ? 'positive' : 'neutral',
          action,
        }),
      });
    } catch (err) {
      logger.error('Error tracking feedback', { error: err });
    }
  };

  const handleRestaurantClick = (restaurantId: string) => {
    trackFeedback(restaurantId, 'clicked');
    if (onRestaurantClick) {
      onRestaurantClick(restaurantId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Finding perfect restaurants for you...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Error: {error}</p>
          <Button onClick={fetchRecommendations} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No recommendations available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {user ? 'Recommended For You' : 'Popular Restaurants'}
          </h2>
          <p className="text-muted-foreground">
            {user
              ? 'Personalized recommendations based on your preferences'
              : 'Top-rated restaurants in your area'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.restaurantId}
            recommendation={rec}
            onClick={() => handleRestaurantClick(rec.restaurantId)}
          />
        ))}
      </div>
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onClick: () => void;
}

function RecommendationCard({ recommendation, onClick }: RecommendationCardProps) {
  const { restaurant, score, confidence, reasons, algorithm } = recommendation;

  return (
    <Card
      className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.coverImage || restaurant.images[0] || '/placeholder-restaurant.jpg'}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
            {restaurant.rating.toFixed(1)}
          </Badge>
        </div>
        {confidence >= 0.8 && (
          <div className="absolute top-2 left-2">
            <Badge variant="default" className="backdrop-blur-sm bg-primary/90">
              <TrendingUp className="h-3 w-3 mr-1" />
              Top Match
            </Badge>
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="line-clamp-1">{restaurant.name}</CardTitle>
        <CardDescription className="space-y-1">
          <div className="flex items-center text-sm">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="line-clamp-1">{restaurant.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {restaurant.priceRange}
            </Badge>
            {restaurant.cuisine.slice(0, 2).map((c) => (
              <Badge key={c} variant="outline" className="text-xs">
                {c}
              </Badge>
            ))}
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {restaurant.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Match Score</span>
            <span className="font-medium">{Math.round(confidence * 100)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>

        {reasons.length > 0 && (
          <div className="space-y-1">
            {reasons.slice(0, 2).map((reason, index) => (
              <div key={index} className="flex items-start text-xs text-muted-foreground">
                <span className="mr-1">•</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Button className="flex-1" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
