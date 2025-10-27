'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Star, 
  Target, 
  Crown,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface LoyaltyAnalyticsWidgetProps {
  restaurantId?: string;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export default function LoyaltyAnalyticsWidget({ 
  restaurantId, 
  showDetails = false, 
  compact = false,
  className = "" 
}: LoyaltyAnalyticsWidgetProps) {
  // Mock data for demonstration - in real app, this would come from API
  const loyaltyData = {
    totalUsers: 15240,
    activeUsers: 12380,
    totalPoints: 19050000,
    redemptionRate: 44.2,
    avgEngagement: 72,
    topTier: 'Platinum',
    newSignups: 890,
    churnRate: 2.1,
    roi: 54.0,
    customerLTV: 157500,
    programHealth: 87.5,
    tierDistribution: {
      bronze: 55.8,
      silver: 27.6,
      gold: 13.8,
      platinum: 2.9
    },
    topPerformingStates: [
      { name: 'Lagos', users: 4200, growth: 15.2 },
      { name: 'Abuja', users: 2800, growth: 12.8 },
      { name: 'Kano', users: 1800, growth: 8.5 }
    ]
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num);
  };

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <ArrowUpRight className="h-3 w-3 text-green-500" />;
    if (value < 0) return <ArrowDownRight className="h-3 w-3 text-red-500" />;
    return null;
  };

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Loyalty Program</CardTitle>
          <Crown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{formatNumber(loyaltyData.totalUsers)}</span>
              <Badge variant="secondary">Users</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Active: {formatNumber(loyaltyData.activeUsers)}</span>
              <div className="flex items-center gap-1">
                <TrendIcon value={12.5} />
                <span className="text-green-500">+12.5%</span>
              </div>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(loyaltyData.activeUsers / loyaltyData.totalUsers) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {((loyaltyData.activeUsers / loyaltyData.totalUsers) * 100).toFixed(1)}% Active
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(loyaltyData.totalUsers)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendIcon value={12.5} />
              <span className="ml-1 text-green-500">+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(loyaltyData.activeUsers)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendIcon value={8.3} />
              <span className="ml-1 text-green-500">+8.3% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(loyaltyData.totalPoints)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendIcon value={15.2} />
              <span className="ml-1 text-green-500">+15.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyData.roi.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendIcon value={18.7} />
              <span className="ml-1 text-green-500">+18.7% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Health and Engagement */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Program Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Health Score</span>
                <span className="font-medium">{loyaltyData.programHealth.toFixed(1)}%</span>
              </div>
              <Progress value={loyaltyData.programHealth} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{formatCurrency(loyaltyData.customerLTV)}</div>
                <div className="text-xs text-muted-foreground">Customer LTV</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{loyaltyData.redemptionRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Redemption Rate</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{formatNumber(loyaltyData.newSignups)}</div>
                <div className="text-xs text-muted-foreground">New Signups</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{loyaltyData.churnRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Churn Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {Object.entries(loyaltyData.tierDistribution).map(([tier, percentage]) => (
                <div key={tier} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{tier}</span>
                    <span className="font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Top Tier</span>
                <Badge variant="outline" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                  {loyaltyData.topTier}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performing States</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loyaltyData.topPerformingStates.map((state, index) => (
                <div key={state.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{state.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(state.users)} users
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-medium">+{state.growth.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Growth</div>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <Button variant="outline" className="justify-start">
              <Crown className="h-4 w-4 mr-2" />
              View Full Analytics
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button variant="outline" className="justify-start">
              <Target className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export a simplified hook for getting loyalty stats
export function useLoyaltyStats(restaurantId?: string) {
  // In a real implementation, this would fetch from the API
  return {
    totalUsers: 15240,
    activeUsers: 12380,
    totalPoints: 19050000,
    redemptionRate: 44.2,
    programROI: 54.0,
    isLoading: false,
    error: null
  };
}