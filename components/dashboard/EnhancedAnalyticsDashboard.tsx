'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar, 
  Table,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  Gift,
  Target,
  Zap,
  Eye,
  MousePointer,
  RefreshCw
} from 'lucide-react';
import { format, subDays } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface EnhancedAnalyticsData {
  // Core metrics
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
    completionRate: number;
    avgPartySize: number;
  };
  revenue: {
    total: number;
    avgOrderValue: number;
    dailyBreakdown: Record<string, number>;
    weeklyGrowth: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    retentionRate: number;
  };
  
  // Enhanced metrics
  socialSharing: {
    totalShares: number;
    platformBreakdown: Record<string, number>;
    shareConversionRate: number;
    sharesPerUser: number;
  };
  referrals: {
    totalReferrals: number;
    successfulReferrals: number;
    conversionRate: number;
    pointsAwarded: number;
    referralRevenue: number;
  };
  abTesting: {
    activeTests: number;
    completedTests: number;
    winningVariants: Record<string, string>;
    conversionImprovements: Record<string, number>;
  };
  userEngagement: {
    avgSessionDuration: number;
    pageViews: number;
    bounceRate: number;
    heatmapData: Array<{ x: number; y: number; value: number }>;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
    userSatisfaction: number;
  };
}

interface EnhancedAnalyticsProps {
  restaurantId?: string;
  className?: string;
}

export function EnhancedAnalyticsDashboard({ restaurantId, className }: EnhancedAnalyticsProps) {
  const [data, setData] = useState<EnhancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [period, restaurantId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        period,
        ...(restaurantId && { restaurantId }),
      });
      
      const response = await fetch(`/api/analytics/enhanced?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p>Unable to load analytics data</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your restaurant performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Bookings"
          value={data.bookings.total}
          change={data.bookings.completionRate}
          format={formatNumber}
          icon={Calendar}
          trend="positive"
        />
        <MetricCard
          title="Revenue"
          value={data.revenue.total}
          change={data.revenue.weeklyGrowth}
          format={formatCurrency}
          icon={DollarSign}
          trend={data.revenue.weeklyGrowth > 0 ? "positive" : "negative"}
        />
        <MetricCard
          title="Social Shares"
          value={data.socialSharing.totalShares}
          change={data.socialSharing.shareConversionRate}
          format={formatNumber}
          icon={Share2}
          trend="positive"
        />
        <MetricCard
          title="Referrals"
          value={data.referrals.successfulReferrals}
          change={data.referrals.conversionRate}
          format={formatNumber}
          icon={Gift}
          trend="positive"
        />
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="social">Social Analytics</TabsTrigger>
          <TabsTrigger value="referrals">Referral Analytics</TabsTrigger>
          <TabsTrigger value="testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
                <CardDescription>Daily booking volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Line
                  data={{
                    labels: Object.keys(data.revenue.dailyBreakdown),
                    datasets: [
                      {
                        label: 'Bookings',
                        data: Object.values(data.revenue.dailyBreakdown),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              </CardContent>
            </Card>

            {/* Customer Acquisition */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
                <CardDescription>New vs returning customers</CardDescription>
              </CardHeader>
              <CardContent>
                <Doughnut
                  data={{
                    labels: ['New Customers', 'Returning Customers'],
                    datasets: [
                      {
                        data: [data.customers.new, data.customers.returning],
                        backgroundColor: ['rgb(34, 197, 94)', 'rgb(59, 130, 246)'],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'bottom' },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold">{data.performance.avgResponseTime}ms</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      12% improvement
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Uptime</p>
                    <p className="text-2xl font-bold">{formatPercentage(data.performance.uptime)}</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Excellent
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">User Satisfaction</p>
                    <p className="text-2xl font-bold">{formatPercentage(data.performance.userSatisfaction)}</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +5% this month
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Sharing by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar
                  data={{
                    labels: Object.keys(data.socialSharing.platformBreakdown),
                    datasets: [
                      {
                        label: 'Shares',
                        data: Object.values(data.socialSharing.platformBreakdown),
                        backgroundColor: [
                          'rgba(59, 89, 152, 0.8)', // Facebook
                          'rgba(29, 161, 242, 0.8)', // Twitter
                          'rgba(37, 211, 102, 0.8)', // WhatsApp
                          'rgba(225, 48, 108, 0.8)', // Instagram
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Metrics Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Shares</span>
                  <Badge variant="secondary">{formatNumber(data.socialSharing.totalShares)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Share Conversion Rate</span>
                  <Badge variant="default">{formatPercentage(data.socialSharing.shareConversionRate)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Shares per User</span>
                  <Badge variant="outline">{data.socialSharing.sharesPerUser.toFixed(1)}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Referrals</span>
                  <Badge variant="secondary">{formatNumber(data.referrals.totalReferrals)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Successful Referrals</span>
                  <Badge variant="default">{formatNumber(data.referrals.successfulReferrals)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Conversion Rate</span>
                  <Badge variant="default">{formatPercentage(data.referrals.conversionRate)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Points Awarded</span>
                  <Badge variant="secondary">{formatNumber(data.referrals.pointsAwarded)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Referral Revenue</span>
                  <Badge variant="default">{formatCurrency(data.referrals.referralRevenue)}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Referral Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">Successful Referrals</h4>
                    <p className="text-green-700 text-2xl font-bold">{data.referrals.successfulReferrals}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Revenue Generated</h4>
                    <p className="text-blue-700 text-2xl font-bold">{formatCurrency(data.referrals.referralRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>A/B Testing Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Active Tests</span>
                  <Badge variant="default">{data.abTesting.activeTests}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Completed Tests</span>
                  <Badge variant="secondary">{data.abTesting.completedTests}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Winning Variants</span>
                  <Badge variant="outline">{Object.keys(data.abTesting.winningVariants).length}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Performing Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.abTesting.winningVariants).map(([test, variant]) => (
                    <div key={test} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{test}</span>
                      <Badge variant="default">{variant}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Error Rate</p>
                    <p className="text-2xl font-bold">{formatPercentage(data.performance.errorRate)}</p>
                  </div>
                  <Target className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Page Views</p>
                    <p className="text-2xl font-bold">{formatNumber(data.userEngagement.pageViews)}</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                    <p className="text-2xl font-bold">{formatPercentage(data.userEngagement.bounceRate)}</p>
                  </div>
                  <MousePointer className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  change, 
  format, 
  icon: Icon, 
  trend 
}: {
  title: string;
  value: number;
  change: number;
  format: (value: number) => string;
  icon: any;
  trend: 'positive' | 'negative' | 'neutral';
}) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{format(value)}</p>
            <div className="flex items-center mt-2">
              {trend === 'positive' && isPositive && (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              )}
              {trend === 'negative' && isNegative && (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-xs font-medium ${
                (trend === 'positive' && isPositive) || (trend === 'negative' && isNegative) 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {change > 0 ? '+' : ''}{(change * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last period</span>
            </div>
          </div>
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
}
