'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale,
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Star, 
  Award,
  Target,
  DollarSign,
  MapPin,
  Globe,
  Zap,
  Crown,
  Trophy,
  ShoppingBag,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Map
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { createLoyaltyAnalytics, getLoyaltyAnalyticsSummary, type ComprehensiveLoyaltyAnalytics } from '@/lib/loyalty-analytics';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

interface LoyaltyAnalyticsDashboardProps {
  restaurantId?: string;
  className?: string;
}

export default function LoyaltyAnalyticsDashboard({ restaurantId, className }: LoyaltyAnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<ComprehensiveLoyaltyAnalytics | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [period, selectedState, restaurantId]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endDate = new Date();
      const startDate = subDays(endDate, period === '7d' ? 7 : period === '30d' ? 30 : 90);
      
      // Get summary data
      const summary = await getLoyaltyAnalyticsSummary(
        { start: startDate, end: endDate },
        restaurantId
      );
      setSummaryData(summary);
      
      // For demo purposes, we'll simulate the full analytics data
      // In a real implementation, this would come from the API
      setAnalyticsData(generateMockAnalyticsData());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return null;
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon, 
    formatter = (v: any) => v.toString(),
    trend = 0
  }: {
    title: string;
    value: number;
    change?: number;
    icon: React.ReactNode;
    formatter?: (value: any) => string;
    trend?: number;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatter(value)}</div>
        {(change !== undefined || trend !== 0) && (
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendIcon value={change || trend} />
            <span className={`ml-1 ${(change || trend) > 0 ? 'text-green-500' : (change || trend) < 0 ? 'text-red-500' : ''}`}>
              {formatPercentage(change || trend)} from last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-500 mb-4">Error loading loyalty analytics: {error}</p>
        <Button onClick={fetchAnalyticsData}>Retry</Button>
      </div>
    );
  }

  if (!analyticsData || !summaryData) {
    return <div className={className}>No data available</div>;
  }

  // Prepare chart data
  const pointsFlowData = {
    labels: ['Earned', 'Redeemed', 'Bonus', 'Expired'],
    datasets: [
      {
        label: 'Points Flow',
        data: [
          analyticsData.points.issuedPoints.total,
          analyticsData.points.redeemedPoints.total,
          analyticsData.points.issuedPoints.byTransaction.BONUS || 0,
          analyticsData.points.expiredPoints.total
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
      },
    ],
  };

  const tierDistributionData = {
    labels: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    datasets: [
      {
        data: [
          analyticsData.tiers.distribution.BRONZE,
          analyticsData.tiers.distribution.SILVER,
          analyticsData.tiers.distribution.GOLD,
          analyticsData.tiers.distribution.PLATINUM,
        ],
        backgroundColor: [
          '#CD7F32',
          '#C0C0C0',
          '#FFD700',
          '#E5E4E2',
        ],
      },
    ],
  };

  const regionalData = {
    labels: Object.keys(analyticsData.nigerianMarket.regionalDistribution).slice(0, 10),
    datasets: [
      {
        label: 'Users by State',
        data: Object.values(analyticsData.nigerianMarket.regionalDistribution)
          .slice(0, 10)
          .map(region => region.userCount),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const engagementRadarData = {
    labels: ['Daily Active', 'Social Shares', 'Reviews', 'Referrals', 'App Usage', 'Retention'],
    datasets: [
      {
        label: 'Current Period',
        data: [75, 65, 80, 45, 70, 85],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
      },
      {
        label: 'Previous Period',
        data: [70, 60, 75, 40, 65, 80],
        backgroundColor: 'rgba(156, 163, 175, 0.2)',
        borderColor: 'rgba(156, 163, 175, 1)',
      },
    ],
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Loyalty Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive loyalty program performance and insights
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              <SelectItem value="Lagos">Lagos</SelectItem>
              <SelectItem value="Abuja">Abuja</SelectItem>
              <SelectItem value="Kano">Kano</SelectItem>
              <SelectItem value="Ibadan">Ibadan</SelectItem>
              <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Loyalty Users"
          value={analyticsData.program.totalUsers}
          change={12.5}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          formatter={formatNumber}
        />
        
        <MetricCard
          title="Active Users"
          value={analyticsData.program.activeUsers}
          change={8.3}
          icon={<Zap className="h-4 w-4 text-muted-foreground" />}
          formatter={formatNumber}
        />
        
        <MetricCard
          title="Total Points Issued"
          value={analyticsData.points.issuedPoints.total}
          change={15.2}
          icon={<Star className="h-4 w-4 text-muted-foreground" />}
          formatter={formatNumber}
        />
        
        <MetricCard
          title="Redemption Rate"
          value={analyticsData.points.redeemedPoints.redemptionRate}
          change={-2.1}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          formatter={(v) => `${v.toFixed(1)}%`}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Program ROI"
          value={analyticsData.roi.netROI}
          change={18.7}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          formatter={(v) => `${v.toFixed(1)}%`}
        />
        
        <MetricCard
          title="Customer LTV"
          value={analyticsData.roi.customerLifetimeValue}
          change={22.4}
          icon={<Crown className="h-4 w-4 text-muted-foreground" />}
          formatter={formatCurrency}
        />
        
        <MetricCard
          title="Top States"
          value={summaryData.topStates?.length || 0}
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        />
        
        <MetricCard
          title="Avg Engagement"
          value={analyticsData.engagement.engagementScore.average}
          change={5.6}
          icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
          formatter={(v) => `${v.toFixed(0)}`}
        />
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="program">Program Performance</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="tiers">Tier Analysis</TabsTrigger>
          <TabsTrigger value="points">Points Flow</TabsTrigger>
          <TabsTrigger value="regional">Regional Insights</TabsTrigger>
          <TabsTrigger value="nigerian">Nigerian Market</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Points Flow Analysis</CardTitle>
                <CardDescription>Distribution of points issued vs redeemed</CardDescription>
              </CardHeader>
              <CardContent>
                <Doughnut data={pointsFlowData} options={{ responsive: true }} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tier Distribution</CardTitle>
                <CardDescription>User distribution across loyalty tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <Doughnut data={tierDistributionData} options={{ responsive: true }} />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Radar</CardTitle>
                <CardDescription>Multi-dimensional engagement analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Radar data={engagementRadarData} options={{ responsive: true }} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Performing States</CardTitle>
                <CardDescription>User distribution across Nigerian states</CardDescription>
              </CardHeader>
              <CardContent>
                <Bar data={regionalData} options={{ responsive: true }} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="program" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Program Participation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Users</span>
                  <Badge variant="secondary">{formatNumber(analyticsData.program.totalUsers)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Active Users</span>
                  <Badge variant="secondary">{formatNumber(analyticsData.program.activeUsers)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Participation Rate</span>
                  <Badge variant="secondary">{analyticsData.program.programParticipationRate.toFixed(1)}%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Retention Rate</span>
                  <Badge variant="secondary">{analyticsData.program.retentionRate.toFixed(1)}%</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Avg Order Value</span>
                  <Badge variant="secondary">{formatCurrency(analyticsData.program.averageOrderValue)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Customer LTV</span>
                  <Badge variant="secondary">{formatCurrency(analyticsData.roi.customerLifetimeValue)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Frequency</span>
                  <Badge variant="secondary">{analyticsData.program.frequency.toFixed(1)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Conversion Rate</span>
                  <Badge variant="secondary">{analyticsData.program.conversionRate.toFixed(1)}%</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>RFM Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Avg Frequency</span>
                  <Badge variant="secondary">{analyticsData.program.frequency.toFixed(1)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Avg Recency</span>
                  <Badge variant="secondary">{analyticsData.program.recency.toFixed(0)} days</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Avg Monetary</span>
                  <Badge variant="secondary">{formatCurrency(analyticsData.program.monetaryValue)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>RFM Score</span>
                  <Badge variant="secondary">{analyticsData.program.rfmScore.average.toFixed(0)}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Interactions</span>
                  <Badge variant="secondary">{formatNumber(analyticsData.engagement.userInteractions.total)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>App Sessions</span>
                  <Badge variant="secondary">{formatNumber(analyticsData.engagement.appUsage.sessions)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Bounce Rate</span>
                  <Badge variant="secondary">{analyticsData.engagement.appUsage.bounceRate}%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Engagement Score</span>
                  <Badge variant="secondary">{analyticsData.engagement.engagementScore.average.toFixed(0)}</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Social Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Social Shares</span>
                  <Badge variant="secondary">{formatNumber(analyticsData.engagement.socialEngagement.shares)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Reviews</span>
                  <Badge variant="secondary">{formatNumber(analyticsData.engagement.socialEngagement.reviews)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Check-ins</span>
                  <Badge variant="secondary">{formatNumber(analyticsData.engagement.socialEngagement.checkIns)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Referrals</span>
                  <Badge variant="secondary">{formatNumber(analyticsData.engagement.socialEngagement.referrals)}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tier Distribution Analysis</CardTitle>
              <CardDescription>Detailed breakdown of loyalty tier performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.tiers.tierMetrics).map(([tier, metrics]) => (
                  <div key={tier} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold capitalize">{tier}</h3>
                      <p className="text-sm text-muted-foreground">{formatNumber(metrics.count)} users</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{formatNumber(metrics.avgPoints)}</p>
                        <p className="text-muted-foreground">Avg Points</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{formatCurrency(metrics.avgSpending)}</p>
                        <p className="text-muted-foreground">Avg Spending</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{metrics.avgOrders.toFixed(1)}</p>
                        <p className="text-muted-foreground">Avg Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{metrics.retentionRate.toFixed(1)}%</p>
                        <p className="text-muted-foreground">Retention</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="points" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Points Economy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Points Issued</span>
                  <Badge variant="secondary">{formatNumber(analyticsData.points.issuedPoints.total)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Points Redeemed</span>
                  <Badge variant="secondary">{formatNumber(analyticsData.points.redeemedPoints.total)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Points Expired</span>
                  <Badge variant="secondary">{formatNumber(analyticsData.points.expiredPoints.total)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Redemption Rate</span>
                  <Badge variant="secondary">{analyticsData.points.redeemedPoints.redemptionRate.toFixed(1)}%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Avg Redemption Value</span>
                  <Badge variant="secondary">{formatCurrency(analyticsData.points.redeemedPoints.averageRedemptionValue)}</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Points Economics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Cost per Point</span>
                  <Badge variant="secondary">₦{analyticsData.points.pointsEconomics.costPerPoint.toFixed(3)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Revenue per Point</span>
                  <Badge variant="secondary">₦{analyticsData.points.pointsEconomics.revenuePerPoint.toFixed(3)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Points Velocity</span>
                  <Badge variant="secondary">{analyticsData.points.pointsVelocity.average.toFixed(1)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Expiration Rate</span>
                  <Badge variant="secondary">{analyticsData.points.expiredPoints.expirationRate.toFixed(1)}%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nigerian Regional Distribution</CardTitle>
              <CardDescription>User distribution and preferences by state</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.nigerianMarket.regionalDistribution)
                  .sort(([,a], [,b]) => b.userCount - a.userCount)
                  .slice(0, 10)
                  .map(([state, data]) => (
                    <div key={state} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Map className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{state}</h4>
                          <p className="text-sm text-muted-foreground">Language: {data.preferredLanguage.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{formatNumber(data.userCount)}</p>
                          <p className="text-muted-foreground">Users</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{data.penetrationRate.toFixed(1)}%</p>
                          <p className="text-muted-foreground">Penetration</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{formatCurrency(data.avgSpending)}</p>
                          <p className="text-muted-foreground">Avg Spending</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="nigerian" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Language Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analyticsData.nigerianMarket.languagePreferences).map(([lang, data]) => (
                    <div key={lang} className="flex justify-between items-center">
                      <span className="capitalize">{lang}</span>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{formatNumber(data.userCount)} users</Badge>
                        <Badge variant="secondary">{data.avgEngagement.toFixed(0)}% engaged</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cultural Events Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.nigerianMarket.culturalEvents.map((event, index) => (
                    <div key={index} className="p-3 border rounded">
                      <h4 className="font-medium">{event.event}</h4>
                      <p className="text-sm text-muted-foreground">{event.period}</p>
                      <div className="flex justify-between mt-2 text-sm">
                        <span>Engagement: {event.engagement}%</span>
                        <span>Revenue: {formatCurrency(event.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Local Business Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{analyticsData.localBusiness.merchantGrowth.newMerchants}</p>
                  <p className="text-sm text-muted-foreground">New Merchants</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{analyticsData.localBusiness.merchantGrowth.activeMerchants}</p>
                  <p className="text-sm text-muted-foreground">Active Merchants</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{formatCurrency(analyticsData.localBusiness.economicImpact.totalRevenueGenerated)}</p>
                  <p className="text-sm text-muted-foreground">Revenue Generated</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{analyticsData.localBusiness.jobCreation.estimatedImpact}</p>
                  <p className="text-sm text-muted-foreground">Jobs Created</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Short-term Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analyticsData.recommendations.shortTerm.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Long-term Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analyticsData.recommendations.longTerm.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">Strategic Initiatives</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analyticsData.recommendations.strategic.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Market Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Accelerating</h4>
                  <ul className="space-y-1">
                    {analyticsData.trends.accelerating.map((trend, index) => (
                      <li key={index} className="text-sm">• {trend}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Declining</h4>
                  <ul className="space-y-1">
                    {analyticsData.trends.declining.map((trend, index) => (
                      <li key={index} className="text-sm">• {trend}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-600 mb-2">Emerging</h4>
                  <ul className="space-y-1">
                    {analyticsData.trends.emerging.map((trend, index) => (
                      <li key={index} className="text-sm">• {trend}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Mock data generator for demonstration
function generateMockAnalyticsData(): ComprehensiveLoyaltyAnalytics {
  return {
    program: {
      totalUsers: 15240,
      activeUsers: 12380,
      inactiveUsers: 2860,
      newUsers: 890,
      churnedUsers: 150,
      retentionRate: 87.5,
      avgPointsPerUser: 1250,
      totalPointsIssued: 19050000,
      totalPointsRedeemed: 8420000,
      pointsRedemptionRate: 44.2,
      programParticipationRate: 78.3,
      conversionRate: 12.8,
      customerLifetimeValue: 157500,
      averageOrderValue: 8750,
      frequency: 8.5,
      recency: 18,
      monetaryValue: 74250,
      rfmScore: {
        average: 78.5,
        distribution: { R1: 15, R2: 25, R3: 35, R4: 20, R5: 5 }
      }
    },
    engagement: {
      dailyActiveUsers: {},
      weeklyActiveUsers: {},
      monthlyActiveUsers: {},
      userInteractions: {
        total: 45680,
        byType: { booking: 25000, review: 8500, referral: 3200, share: 8980 },
        byChannel: { app: 27408, web: 11420, sms: 4568, email: 2284 }
      },
      socialEngagement: {
        shares: 8980,
        reviews: 8500,
        checkIns: 15600,
        referrals: 3200
      },
      appUsage: {
        sessions: 32500,
        sessionDuration: 15,
        bounceRate: 25,
        pageViews: 125000
      },
      engagementScore: {
        average: 72,
        distribution: { low: 20, medium: 55, high: 25 }
      }
    },
    tiers: {
      totalUsers: 15240,
      distribution: {
        BRONZE: 8500,
        SILVER: 4200,
        GOLD: 2100,
        PLATINUM: 440
      },
      distributionPercentage: {
        BRONZE: 55.8,
        SILVER: 27.6,
        GOLD: 13.8,
        PLATINUM: 2.9
      },
      tierProgression: {
        upgrades: 320,
        downgrades: 45,
        avgTimeToUpgrade: 67,
        churnRateByTier: { BRONZE: 15, SILVER: 8, GOLD: 4, PLATINUM: 2 }
      },
      tierMetrics: {
        BRONZE: { count: 8500, avgPoints: 650, avgSpending: 25000, avgOrders: 3.2, retentionRate: 85 },
        SILVER: { count: 4200, avgPoints: 1850, avgSpending: 65000, avgOrders: 7.8, retentionRate: 92 },
        GOLD: { count: 2100, avgPoints: 4200, avgSpending: 125000, avgOrders: 15.2, retentionRate: 96 },
        PLATINUM: { count: 440, avgPoints: 8500, avgSpending: 280000, avgOrders: 32.1, retentionRate: 98 }
      },
      tierRecommendations: {
        strategy: "Focus on converting Bronze to Silver through targeted engagement",
        improvements: ["Implement automated tier progression campaigns", "Add exclusive Platinum benefits"]
      }
    },
    points: {
      issuedPoints: {
        total: 19050000,
        byTransaction: { EARNED: 15240000, BONUS: 2286000, TRANSFERRED: 152400 },
        bySource: { booking_reward: 11430000, referral_bonus: 3810000, review_incentive: 1905000, social_share: 952500, milestone_bonus: 952500 },
        daily: {},
        weekly: {}
      },
      redeemedPoints: {
        total: 8420000,
        byReward: { discount_voucher: 3368000, free_meal: 2526000, upgrade_bonus: 1263000, cashback: 842000, merchandise: 421000 },
        redemptionRate: 44.2,
        averageRedemptionValue: 2500
      },
      expiredPoints: {
        total: 950000,
        expirationRate: 5.0,
        byUserTier: { BRONZE: 380000, SILVER: 285000, GOLD: 190000, PLATINUM: 95000 }
      },
      pointsVelocity: {
        average: 2.8,
        distribution: { slow: 35, moderate: 45, fast: 20 }
      },
      pointsEconomics: {
        costPerPoint: 0.005,
        revenuePerPoint: 0.015,
        breakEvenPoint: 0.333
      }
    },
    achievements: {
      totalAchievements: 15,
      completedAchievements: 12,
      completionRate: 80,
      completionByCategory: {
        BOOKING_STREAK: { total: 4, completed: 3, completionRate: 75, avgTimeToComplete: 25 },
        SPENDING_MILESTONE: { total: 3, completed: 2, completionRate: 67, avgTimeToComplete: 60 },
        REFERRALS: { total: 4, completed: 3, completionRate: 75, avgTimeToComplete: 45 },
        SOCIAL_SHARING: { total: 4, completed: 4, completionRate: 100, avgTimeToComplete: 15 }
      } as any,
      completionByType: {
        BADGE: { total: 8, completed: 7, completionRate: 88 },
        MILESTONE: { total: 5, completed: 3, completionRate: 60 },
        CHALLENGE: { total: 2, completed: 2, completionRate: 100 }
      } as any,
      achievements: [
        {
          id: '1',
          name: 'First Booking Achievement',
          category: 'BOOKING_STREAK' as any,
          type: 'MILESTONE' as any,
          totalTargets: 100,
          completedTargets: 75,
          completionRate: 75,
          avgTimeToComplete: 15,
          pointsAwarded: 500
        }
      ],
      milestoneAchievements: {
        significant: [
          { achievement: 'First 1000 Customers', completionRate: 95, businessImpact: 'Strong brand recognition' },
          { achievement: '₦1M Total Revenue', completionRate: 88, businessImpact: 'Revenue milestone achieved' }
        ]
      }
    },
    partners: {
      totalPartners: 180,
      activePartners: 156,
      partnerMetrics: {},
      topPerformers: [
        { partnerId: '1', name: 'Lagos Restaurant A', revenue: 2500000, userGrowth: 25, engagementScore: 85 },
        { partnerId: '2', name: 'Abuja Bistro B', revenue: 1850000, userGrowth: 18, engagementScore: 78 },
        { partnerId: '3', name: 'Kano Cuisine C', revenue: 1420000, userGrowth: 22, engagementScore: 82 }
      ],
      partnerROI: {}
    },
    roi: {
      totalInvestment: 2500000,
      totalReturns: 3850000,
      netROI: 54,
      roiBreakdown: {
        byChannel: { app: 25, web: 15, sms: 10, email: 8 },
        byCampaign: { welcome_bonus: 20, referral_program: 18, tier_bonuses: 15, seasonal_promos: 12 },
        bySegment: { bronze: 10, silver: 15, gold: 20, platinum: 25 }
      },
      customerAcquisitionCost: 4500,
      customerLifetimeValue: 157500,
      paybackPeriod: 4.2,
      profitMarginImprovement: 5.2,
      revenueAttribution: { direct: 70, indirect: 20, incremental: 10 },
      costAnalysis: { pointsCost: 95250, operationalCost: 500000, technologyCost: 200000, marketingCost: 300000 }
    },
    nigerianMarket: {
      regionalDistribution: {
        'Lagos': { userCount: 4200, penetrationRate: 12.5, avgSpending: 95000, topRestaurants: ['Restaurant A', 'Bistro B'], preferredLanguage: 'en' as any, culturalPreferences: ['international', 'fine_dining'] },
        'Abuja': { userCount: 2800, penetrationRate: 8.2, avgSpending: 87500, topRestaurants: ['Federal Place', 'Capital Grill'], preferredLanguage: 'en' as any, culturalPreferences: ['business', 'international'] },
        'Kano': { userCount: 1800, penetrationRate: 6.8, avgSpending: 45000, topRestaurants: ['Northern Palace', 'Traditional Court'], preferredLanguage: 'ha' as any, culturalPreferences: ['traditional', 'halal'] },
        'Ibadan': { userCount: 1400, penetrationRate: 5.2, avgSpending: 38000, topRestaurants: ['Yoruba Heritage', 'Ibadan Delights'], preferredLanguage: 'yo' as any, culturalPreferences: ['traditional', 'local'] },
        'Port Harcourt': { userCount: 1200, penetrationRate: 4.8, avgSpending: 72000, topRestaurants: ['Riverside', 'Port Court'], preferredLanguage: 'ig' as any, culturalPreferences: ['seafood', 'international'] }
      } as any,
      languagePreferences: {
        'en': { userCount: 8500, avgEngagement: 75, conversionRate: 12.5 },
        'ha': { userCount: 2100, avgEngagement: 68, conversionRate: 10.2 },
        'yo': { userCount: 1800, avgEngagement: 72, conversionRate: 11.8 },
        'ig': { userCount: 1200, avgEngagement: 70, conversionRate: 10.5 }
      } as any,
      culturalEvents: [
        { event: 'Christmas Celebration', period: 'December', engagement: 85, revenue: 2500000, topParticipatingRegions: ['Lagos', 'Abuja', 'Port Harcourt'] },
        { event: 'Eid celebrations', period: 'Variable', engagement: 78, revenue: 1800000, topParticipatingRegions: ['Kano', 'Kaduna', 'Abuja'] },
        { event: 'New Year promotions', period: 'January', engagement: 82, revenue: 2200000, topParticipatingRegions: ['Lagos', 'Ibadan', 'Port Harcourt'] }
      ],
      economicIndicators: {
        purchasingPowerByState: { 'Lagos': 85, 'Abuja': 80, 'Kano': 60, 'Ibadan': 65, 'Port Harcourt': 70 } as any,
        priceSensitivity: 75,
        loyaltySpending: { BRONZE: 15000, SILVER: 35000, GOLD: 75000, PLATINUM: 150000 } as any
      },
      competitiveAnalysis: {
        marketShare: 15.5,
        competitiveAdvantages: ['Nigerian local language support', 'Cultural event integrations', 'Regional restaurant partnerships'],
        areasForImprovement: ['Expand to more states', 'Increase partner network', 'Improve tier benefits']
      }
    },
    localBusiness: {
      merchantGrowth: { newMerchants: 25, activeMerchants: 180, growthRate: 18.5, avgRevenuePerMerchant: 125000 },
      jobCreation: { directJobs: 450, indirectJobs: 1200, estimatedImpact: 1650 },
      economicImpact: { totalRevenueGenerated: 22500000, taxContribution: 2250000, multiplierEffect: 2.3 },
      digitalAdoption: { merchantsWithLoyalty: 156, digitalPaymentAdoption: 78, socialMediaEngagement: 65 },
      scalingMetrics: { citiesPresent: 12, geographicExpansion: 35, marketPenetration: 22.5 }
    },
    recommendations: {
      shortTerm: [
        'Implement targeted campaigns for inactive Bronze tier users',
        'Launch festive season promotions in high-engagement states',
        'Increase referral bonuses for Gold and Platinum tiers',
        'Optimize mobile app for Nigerian languages'
      ],
      longTerm: [
        'Expand loyalty program to Tier 2 and Tier 3 cities',
        'Develop strategic partnerships with major Nigerian retailers',
        'Create industry-specific loyalty solutions',
        'Implement AI-powered personalization'
      ],
      strategic: [
        'Focus on cultural event-driven campaigns',
        'Develop micro-financing options for small restaurant partners',
        'Create educational content about loyalty program benefits',
        'Build community features to increase engagement'
      ]
    },
    trends: {
      accelerating: ['Mobile app usage in Northern Nigeria', 'Social sharing and referral rates', 'Premium tier adoption'],
      declining: ['Traditional SMS engagement', 'Desktop web usage'],
      emerging: ['Voice ordering integration', 'AI-powered recommendations', 'Sustainability-focused programs']
    }
  };
}