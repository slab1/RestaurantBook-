'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, Star, MapPin, Flame } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  priceRange: string;
  rating: number;
  city: string;
  images: string[];
  coverImage: string;
}

interface TrendingRestaurant {
  restaurantId: string;
  score: number;
  confidence: number;
  reasons: string[];
  algorithm: string;
  restaurant: Restaurant;
  metrics: {
    bookingCount: number;
    reviewCount: number;
    rating: number;
    trendScore: number;
  };
}

interface TrendingRestaurantsProps {
  location?: string;
  limit?: number;
  onRestaurantClick?: (restaurantId: string) => void;
}

export function TrendingRestaurants({
  location = 'all',
  limit = 8,
  onRestaurantClick,
}: TrendingRestaurantsProps) {
  const [dailyTrending, setDailyTrending] = useState<TrendingRestaurant[]>([]);
  const [weeklyTrending, setWeeklyTrending] = useState<TrendingRestaurant[]>([]);
  const [monthlyTrending, setMonthlyTrending] = useState<TrendingRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly');

  useEffect(() => {
    fetchTrendingRestaurants();
  }, [location, limit]);

  const fetchTrendingRestaurants = async () => {
    try {
      setLoading(true);

      // Fetch all time windows in parallel
      const [daily, weekly, monthly] = await Promise.all([
        fetchTrending('daily'),
        fetchTrending('weekly'),
        fetchTrending('monthly'),
      ]);

      setDailyTrending(daily);
      setWeeklyTrending(weekly);
      setMonthlyTrending(monthly);
    } catch (err) {
      logger.error('Error fetching trending restaurants', { error: err });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async (timeWindow: string): Promise<TrendingRestaurant[]> => {
    try {
      const params = new URLSearchParams({
        location,
        timeWindow,
        limit: limit.toString(),
      });

      const response = await fetch(`/api/recommendations/trending?${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch trending restaurants');
      }

      return data.data;
    } catch (err) {
      logger.error(`Error fetching ${timeWindow} trending`, { error: err });
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading trending restaurants...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Flame className="h-6 w-6 text-orange-500" />
        <h2 className="text-2xl font-bold tracking-tight">Trending Now</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="daily">Today</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-6">
          <TrendingGrid
            restaurants={dailyTrending}
            onRestaurantClick={onRestaurantClick}
            emptyMessage="No trending restaurants today"
          />
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <TrendingGrid
            restaurants={weeklyTrending}
            onRestaurantClick={onRestaurantClick}
            emptyMessage="No trending restaurants this week"
          />
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <TrendingGrid
            restaurants={monthlyTrending}
            onRestaurantClick={onRestaurantClick}
            emptyMessage="No trending restaurants this month"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface TrendingGridProps {
  restaurants: TrendingRestaurant[];
  onRestaurantClick?: (restaurantId: string) => void;
  emptyMessage: string;
}

function TrendingGrid({ restaurants, onRestaurantClick, emptyMessage }: TrendingGridProps) {
  if (restaurants.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {restaurants.map((item, index) => (
        <Card
          key={item.restaurantId}
          className="overflow-hidden cursor-pointer transition-all hover:shadow-lg group"
          onClick={() => onRestaurantClick?.(item.restaurantId)}
        >
          <div className="relative h-40 overflow-hidden">
            <img
              src={item.restaurant.coverImage || item.restaurant.images[0] || '/placeholder-restaurant.jpg'}
              alt={item.restaurant.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            
            {/* Rank badge */}
            <div className="absolute top-2 left-2">
              <Badge
                variant="default"
                className="backdrop-blur-sm bg-orange-500 hover:bg-orange-600"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                #{index + 1}
              </Badge>
            </div>

            {/* Rating badge */}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                {item.restaurant.rating.toFixed(1)}
              </Badge>
            </div>
          </div>

          <CardHeader className="pb-3">
            <CardTitle className="text-base line-clamp-1">
              {item.restaurant.name}
            </CardTitle>
            <CardDescription className="space-y-2">
              <div className="flex items-center text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{item.restaurant.city}</span>
              </div>
              <div className="flex items-center gap-1">
                {item.restaurant.cuisine.slice(0, 2).map((c) => (
                  <Badge key={c} variant="outline" className="text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0 space-y-2">
            {/* Trending metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="font-semibold text-primary">
                  {item.metrics.bookingCount}
                </div>
                <div className="text-muted-foreground">Bookings</div>
              </div>
              <div>
                <div className="font-semibold text-primary">
                  {item.metrics.reviewCount}
                </div>
                <div className="text-muted-foreground">Reviews</div>
              </div>
            </div>

            {/* Reasons */}
            {item.reasons.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {item.reasons[0]}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
