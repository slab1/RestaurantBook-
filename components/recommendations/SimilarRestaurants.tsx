'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Star, TrendingUp } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  priceRange: string;
  rating: number;
  totalReviews: number;
  city: string;
  images: string[];
  coverImage: string;
}

interface SimilarRestaurant {
  restaurantId: string;
  score: number;
  confidence: number;
  reasons: string[];
  algorithm: string;
  restaurant: Restaurant;
  similarityScore?: number;
}

interface SimilarRestaurantsProps {
  restaurantId: string;
  limit?: number;
  onRestaurantClick?: (restaurantId: string) => void;
}

export function SimilarRestaurants({
  restaurantId,
  limit = 4,
  onRestaurantClick,
}: SimilarRestaurantsProps) {
  const [similar, setSimilar] = useState<SimilarRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId) {
      fetchSimilarRestaurants();
    }
  }, [restaurantId, limit]);

  const fetchSimilarRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        restaurantId,
        limit: limit.toString(),
      });

      const response = await fetch(`/api/recommendations/similar?${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch similar restaurants');
      }

      setSimilar(data.data);
    } catch (err) {
      logger.error('Error fetching similar restaurants', { error: err });
      setError(err instanceof Error ? err.message : 'Failed to load similar restaurants');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || similar.length === 0) {
    return null; // Don't show error state, just hide the component
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold">Similar Restaurants</h3>
        <p className="text-sm text-muted-foreground">
          You might also like these restaurants
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {similar.map((item) => (
          <Card
            key={item.restaurantId}
            className="overflow-hidden cursor-pointer transition-all hover:shadow-lg group"
            onClick={() => onRestaurantClick?.(item.restaurantId)}
          >
            <div className="relative h-32 overflow-hidden">
              <img
                src={item.restaurant.coverImage || item.restaurant.images[0] || '/placeholder-restaurant.jpg'}
                alt={item.restaurant.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="backdrop-blur-sm bg-background/80 text-xs">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {item.restaurant.rating.toFixed(1)}
                </Badge>
              </div>
            </div>

            <CardHeader className="p-4">
              <CardTitle className="text-sm line-clamp-1">{item.restaurant.name}</CardTitle>
              <CardDescription className="space-y-1">
                <div className="flex items-center gap-1 text-xs">
                  {item.restaurant.cuisine.slice(0, 2).map((c) => (
                    <Badge key={c} variant="outline" className="text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Similarity</span>
                <span className="font-medium">
                  {Math.round((item.similarityScore || item.confidence) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
