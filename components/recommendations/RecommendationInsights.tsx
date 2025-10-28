'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, Heart, Sparkles, MapPin, DollarSign } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { logger } from '@/lib/logger';

interface UserPreference {
  id: string;
  preferenceType: string;
  preferenceValue: string;
  confidenceScore: number;
  source: string;
}

interface FeedbackStats {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  actions: {
    clicked: number;
    booked: number;
    reviewed: number;
    dismissed: number;
  };
}

export function RecommendationInsights() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchInsights();
    }
  }, [user?.id]);

  const fetchInsights = async () => {
    try {
      setLoading(true);

      // Fetch user preferences
      const prefsResponse = await fetch(`/api/users/${user?.id}/preferences`);
      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json();
        setPreferences(prefsData.data || []);
      }

      // Fetch feedback stats
      const feedbackResponse = await fetch(`/api/recommendations/feedback?userId=${user?.id}`);
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        setFeedbackStats(feedbackData.stats);
      }
    } catch (err) {
      logger.error('Error fetching insights', { error: err });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Group preferences by type
  const cuisinePreferences = preferences.filter(p => p.preferenceType === 'cuisine');
  const pricePreferences = preferences.filter(p => p.preferenceType === 'price_range');
  const locationPreferences = preferences.filter(p => p.preferenceType === 'location');

  // Sort by confidence score
  const topCuisines = cuisinePreferences.sort((a, b) => Number(b.confidenceScore) - Number(a.confidenceScore)).slice(0, 5);
  const topPriceRange = pricePreferences.sort((a, b) => Number(b.confidenceScore) - Number(a.confidenceScore))[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your Dining Profile</h2>
        <p className="text-muted-foreground">
          Insights based on your booking history and preferences
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Favorite Cuisines */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Favorite Cuisines</CardTitle>
            </div>
            <CardDescription>Your top cuisine preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCuisines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No preferences learned yet</p>
            ) : (
              topCuisines.map((pref) => (
                <div key={pref.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{pref.preferenceValue}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(Number(pref.confidenceScore) * 100)}%
                    </span>
                  </div>
                  <Progress value={Number(pref.confidenceScore) * 100} className="h-1.5" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Price Preference */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Price Range</CardTitle>
            </div>
            <CardDescription>Your preferred price point</CardDescription>
          </CardHeader>
          <CardContent>
            {topPriceRange ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {topPriceRange.preferenceValue}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(Number(topPriceRange.confidenceScore) * 100)}% confidence
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on your booking history
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No preference detected yet</p>
            )}
          </CardContent>
        </Card>

        {/* Engagement Stats */}
        {feedbackStats && feedbackStats.total > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Engagement</CardTitle>
              </div>
              <CardDescription>Your activity with recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-2xl font-bold">{feedbackStats.actions.booked}</div>
                  <div className="text-xs text-muted-foreground">Bookings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{feedbackStats.actions.clicked}</div>
                  <div className="text-xs text-muted-foreground">Clicks</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{feedbackStats.actions.reviewed}</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round((feedbackStats.positive / feedbackStats.total) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Satisfaction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Learning Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Recommendation Accuracy</CardTitle>
            </div>
            <Badge variant="secondary">Learning</Badge>
          </div>
          <CardDescription>
            The more you interact with recommendations, the better they become
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Profile Completeness</span>
              <span className="font-medium">
                {Math.min(100, (preferences.length / 10) * 100).toFixed(0)}%
              </span>
            </div>
            <Progress value={Math.min(100, (preferences.length / 10) * 100)} />
            <p className="text-xs text-muted-foreground">
              {preferences.length < 5
                ? 'Book more restaurants to improve recommendations'
                : preferences.length < 10
                ? 'Your recommendations are getting better!'
                : 'Your profile is well-established!'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
