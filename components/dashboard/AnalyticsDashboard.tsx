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
  ArrowDownRight
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

interface AnalyticsData {
  current: {
    bookings: {
      total: number;
      statusBreakdown: Record<string, number>;
      avgPartySize: number;
      completionRate: number;
    };
    revenue: {
      total: number;
      avgOrderValue: number;
      revenuePerGuest: number;
      dailyBreakdown: Record<string, number>;
      transactionCount: number;
    };
    customers: {
      unique: number;
      new: number;
      returning: number;
      retentionRate: number;
    };
    tables: {
      overall: number;
      byTable: Array<{
        tableId: string;
        tableNumber: string;
        capacity: number;
        bookingCount: number;
        avgOccupancy: number;
      }>;
    };
    popularTimes: {
      hourly: Record<string, number>;
      dayOfWeek: Record<string, number>;
    };
  };
  comparison?: {
    bookings: {
      total: number;
      completionRate: number;
    };
    revenue: {
      total: number;
      avgOrderValue: number;
    };
    customers: {
      unique: number;
      new: number;
      retentionRate: number;
    };
  };
  period: string;
  dateRange: {
    start: Date;
    end: Date;
  };
}

interface AnalyticsDashboardProps {
  restaurantId?: string;
  className?: string;
}

export default function AnalyticsDashboard({ restaurantId, className }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [comparison, setComparison] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period, comparison, restaurantId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        period,
        comparison: comparison.toString(),
        ...(restaurantId && { restaurantId }),
      });
      
      const response = await fetch(`/api/analytics/dashboard?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (value < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon, 
    formatter = (v: any) => v.toString() 
  }: {
    title: string;
    value: number;
    change?: number;
    icon: React.ReactNode;
    formatter?: (value: any) => string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatter(value)}</div>
        {change !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendIcon value={change} />
            <span className={`ml-1 ${change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : ''}`}>
              {formatPercentage(change)} from last period
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
          {[...Array(4)].map((_, i) => (
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
        <p className="text-red-500 mb-4">Error loading analytics: {error}</p>
        <Button onClick={fetchAnalytics}>Retry</Button>
      </div>
    );
  }

  if (!data) {
    return <div className={className}>No data available</div>;
  }

  // Prepare chart data
  const revenueChartData = {
    labels: Object.keys(data.current.revenue.dailyBreakdown).slice(-7),
    datasets: [
      {
        label: 'Revenue',
        data: Object.values(data.current.revenue.dailyBreakdown).slice(-7),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const bookingStatusData = {
    labels: Object.keys(data.current.bookings.statusBreakdown),
    datasets: [
      {
        data: Object.values(data.current.bookings.statusBreakdown),
        backgroundColor: [
          '#10B981', // CONFIRMED - green
          '#F59E0B', // PENDING - yellow
          '#EF4444', // CANCELLED - red
          '#6366F1', // COMPLETED - indigo
          '#8B5CF6', // NO_SHOW - purple
        ],
      },
    ],
  };

  const popularHoursData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Bookings',
        data: Array.from({ length: 24 }, (_, i) => data.current.popularTimes.hourly[i] || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            {format(new Date(data.dateRange.start), 'PPP')} - {format(new Date(data.dateRange.end), 'PPP')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">This Week</SelectItem>
              <SelectItem value="30d">This Month</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={comparison ? "default" : "outline"}
            onClick={() => setComparison(!comparison)}
          >
            Compare
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={data.current.revenue.total}
          change={data.comparison?.revenue.total}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          formatter={formatCurrency}
        />
        
        <MetricCard
          title="Total Bookings"
          value={data.current.bookings.total}
          change={data.comparison?.bookings.total}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />
        
        <MetricCard
          title="Unique Customers"
          value={data.current.customers.unique}
          change={data.comparison?.customers.unique}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        
        <MetricCard
          title="Completion Rate"
          value={data.current.bookings.completionRate}
          change={data.comparison?.bookings.completionRate}
          icon={<Star className="h-4 w-4 text-muted-foreground" />}
          formatter={(v) => `${v.toFixed(1)}%`}
        />
      </div>

      {/* Charts and Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <Line data={revenueChartData} options={{ responsive: true }} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
                <CardDescription>Distribution of booking statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <Doughnut data={bookingStatusData} options={{ responsive: true }} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="bookings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Popular Hours</CardTitle>
                <CardDescription>Booking distribution by hour</CardDescription>
              </CardHeader>
              <CardContent>
                <Bar data={popularHoursData} options={{ responsive: true }} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Booking Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Average Party Size</span>
                  <Badge variant="secondary">{data.current.bookings.avgPartySize}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Completion Rate</span>
                  <Badge variant="secondary">{data.current.bookings.completionRate.toFixed(1)}%</Badge>
                </div>
                {Object.entries(data.current.bookings.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span className="capitalize">{status.toLowerCase()}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.current.revenue.total)}</div>
                <p className="text-xs text-muted-foreground">From {data.current.revenue.transactionCount} transactions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.current.revenue.avgOrderValue)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue per Guest</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.current.revenue.revenuePerGuest)}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Unique Customers</span>
                  <Badge variant="secondary">{data.current.customers.unique}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>New Customers</span>
                  <Badge variant="secondary">{data.current.customers.new}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Returning Customers</span>
                  <Badge variant="secondary">{data.current.customers.returning}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Retention Rate</span>
                  <Badge variant="secondary">{data.current.customers.retentionRate.toFixed(1)}%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Table Utilization</CardTitle>
              <CardDescription>Performance by table</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.current.tables.byTable.map((table) => (
                  <div key={table.tableId} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium">Table {table.tableNumber}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        (Capacity: {table.capacity})
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{table.bookingCount} bookings</Badge>
                      <Badge variant="secondary">{table.avgOccupancy}% avg occupancy</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
