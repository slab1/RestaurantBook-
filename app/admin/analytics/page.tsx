'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Line,
  Bar,
  Doughnut,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line as LineChart, Bar as BarChart, Doughnut as DoughnutChart } from 'react-chartjs-2';
import {
  PlatformMetrics,
  RevenueData,
  UserBehaviorMetrics,
  GrowthMetrics,
  GeographicData,
  PerformanceMetrics,
  CustomReport,
  Alert,
  getPlatformMetrics,
  getRevenueHistory,
  getRevenueComparison,
  getUserBehaviorMetrics,
  getGrowthMetrics,
  getGeographicData,
  getPerformanceMetrics,
  getCustomReports,
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
  exportData,
  refreshAnalytics,
  createCustomReport,
  deleteCustomReport,
} from '@/lib/admin-analytics-service';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'revenue' | 'users' | 'growth' | 'reports' | 'performance'
  >('overview');
  
  // State
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null);
  const [revenueHistory, setRevenueHistory] = useState<RevenueData[]>([]);
  const [userBehavior, setUserBehavior] = useState<UserBehaviorMetrics | null>(null);
  const [growth, setGrowth] = useState<GrowthMetrics | null>(null);
  const [geographic, setGeographic] = useState<GeographicData[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '3m' | '12m'>('30d');
  const [comparisonPeriod, setComparisonPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Load all data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        metricsData,
        revenueData,
        behaviorData,
        growthData,
        geoData,
        perfData,
        reportsData,
        alertsData,
      ] = await Promise.all([
        getPlatformMetrics(),
        getRevenueHistory(),
        getUserBehaviorMetrics(),
        getGrowthMetrics(),
        getGeographicData(),
        getPerformanceMetrics(),
        getCustomReports(),
        getAlerts(),
      ]);
      
      setPlatformMetrics(metricsData);
      setRevenueHistory(revenueData);
      setUserBehavior(behaviorData);
      setGrowth(growthData);
      setGeographic(geoData);
      setPerformance(perfData);
      setCustomReports(reportsData);
      setAlerts(alertsData);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    toast.loading('Refreshing analytics data...');
    await refreshAnalytics();
    await loadAllData();
    toast.dismiss();
    toast.success('Analytics refreshed');
  };

  const handleExport = async (type: 'revenue' | 'users' | 'bookings' | 'all', format: 'csv' | 'json') => {
    try {
      const data = await exportData(type, format);
      const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${type}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${type} data as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      toast.success('Alert acknowledged');
      loadAllData();
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
      toast.success('Alert resolved');
      loadAllData();
      setShowAlertModal(false);
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Chart data preparations
  const revenueChartData = {
    labels: revenueHistory.slice(-30).map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Revenue',
        data: revenueHistory.slice(-30).map(item => item.revenue),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Net Revenue',
        data: revenueHistory.slice(-30).map(item => item.netRevenue),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const bookingsChartData = {
    labels: revenueHistory.slice(-30).map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Bookings',
        data: revenueHistory.slice(-30).map(item => item.bookings),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  };

  const userGrowthChartData = growth ? {
    labels: growth.userGrowth.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short' })),
    datasets: [
      {
        label: 'Total Users',
        data: growth.userGrowth.map(item => item.totalUsers),
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'New Users',
        data: growth.userGrowth.map(item => item.newUsers),
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
      },
    ],
  } : null;

  const acquisitionSourcesData = growth ? {
    labels: growth.acquisitionSources.map(item => item.source),
    datasets: [
      {
        data: growth.acquisitionSources.map(item => item.users),
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
      },
    ],
  } : null;

  const featureUsageData = userBehavior ? {
    labels: userBehavior.featureUsage.map(item => item.feature),
    datasets: [
      {
        label: 'Usage Count',
        data: userBehavior.featureUsage.map(item => item.usageCount),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  } : null;

  const geoDistributionData = {
    labels: geographic.map(item => item.region),
    datasets: [
      {
        data: geographic.map(item => item.users),
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive platform insights and data-driven decision making
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Data
          </button>
        </div>
      </div>

      {/* Alerts Banner */}
      {alerts.filter(a => a.status === 'active').length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Active Alerts ({alerts.filter(a => a.status === 'active').length})</h3>
              <div className="mt-2 space-y-2">
                {alerts.filter(a => a.status === 'active').slice(0, 3).map(alert => (
                  <div key={alert.id} className="flex items-center justify-between bg-white px-3 py-2 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                      <p className="text-xs text-gray-600">{alert.message}</p>
                    </div>
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="ml-4 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Acknowledge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Platform Overview
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'revenue'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Revenue Analytics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Behavior
            </button>
            <button
              onClick={() => setActiveTab('growth')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'growth'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Growth Metrics
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Custom Reports
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'performance'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Performance
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && platformMetrics && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Revenue</p>
                      <p className="text-3xl font-bold mt-1">${platformMetrics.totalRevenue.toLocaleString()}</p>
                      <p className="text-xs mt-2 opacity-75">+15.7% from last month</p>
                    </div>
                    <svg className="w-12 h-12 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Active Users</p>
                      <p className="text-3xl font-bold mt-1">{platformMetrics.activeUsers.toLocaleString()}</p>
                      <p className="text-xs mt-2 opacity-75">+12.5% from last month</p>
                    </div>
                    <svg className="w-12 h-12 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Bookings</p>
                      <p className="text-3xl font-bold mt-1">{platformMetrics.totalBookings.toLocaleString()}</p>
                      <p className="text-xs mt-2 opacity-75">This month</p>
                    </div>
                    <svg className="w-12 h-12 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Conversion Rate</p>
                      <p className="text-3xl font-bold mt-1">{platformMetrics.conversionRate}%</p>
                      <p className="text-xs mt-2 opacity-75">+5.2% from last month</p>
                    </div>
                    <svg className="w-12 h-12 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Avg. Session Duration</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{platformMetrics.sessionDuration} min</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Page Views</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{platformMetrics.pageViews.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Bounce Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{platformMetrics.bounceRate}%</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends (30 Days)</h3>
                  <LineChart data={revenueChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Bookings (30 Days)</h3>
                  <BarChart data={bookingsChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                </div>
              </div>

              {/* Geographic Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <DoughnutChart data={geoDistributionData} options={{ responsive: true }} />
                  </div>
                  <div className="space-y-3">
                    {geographic.map((region, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-semibold text-gray-900">{region.region}</p>
                          <p className="text-sm text-gray-600">{region.users.toLocaleString()} users</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${region.revenue.toLocaleString()}</p>
                          <p className={`text-sm ${region.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {region.growthRate >= 0 ? '+' : ''}{region.growthRate}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Analytics Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Revenue Analytics & Financial Reporting</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('revenue', 'csv')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExport('revenue', 'json')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Export JSON
                  </button>
                </div>
              </div>

              {/* Revenue Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Revenue (30d)</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${revenueHistory.slice(-30).reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Commission</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${revenueHistory.slice(-30).reduce((sum, item) => sum + item.commission, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Refunds</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${revenueHistory.slice(-30).reduce((sum, item) => sum + item.refunds, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Net Revenue</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ${revenueHistory.slice(-30).reduce((sum, item) => sum + item.netRevenue, 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown (Last 30 Days)</h3>
                <LineChart data={revenueChartData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'top' } } }} />
              </div>

              {/* Revenue Table */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Refunds</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {revenueHistory.slice(-10).reverse().map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            ${item.revenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.bookings}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            ${item.commission.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            ${item.refunds.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            ${item.netRevenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* User Behavior Tab */}
          {activeTab === 'users' && userBehavior && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">User Behavior Insights & Engagement Analysis</h2>

              {/* Engagement Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Avg. Session Duration</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{userBehavior.averageSessionDuration} min</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Pages per Session</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{userBehavior.pagesPerSession}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Engagement Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{userBehavior.engagementRate}%</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Customer Lifetime Value</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">${userBehavior.customerLifetimeValue}</p>
                </div>
              </div>

              {/* Retention Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Retention Rate</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{userBehavior.retentionRate}%</p>
                  <p className="text-xs text-gray-500 mt-2">Excellent retention</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Churn Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{userBehavior.churnRate}%</p>
                  <p className="text-xs text-gray-500 mt-2">Below industry average</p>
                </div>
              </div>

              {/* Feature Usage */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Adoption & Usage</h3>
                <BarChart data={featureUsageData!} options={{ responsive: true, indexAxis: 'y' as const }} />
              </div>

              {/* Feature Usage Table */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Feature Usage</h3>
                <div className="space-y-3">
                  {userBehavior.featureUsage.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{feature.feature}</p>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 rounded-full h-2"
                            style={{ width: `${feature.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <p className="text-lg font-bold text-gray-900">{feature.usageCount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{feature.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Growth Metrics Tab */}
          {activeTab === 'growth' && growth && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Growth Metrics & Acquisition Tracking</h2>

              {/* User Growth Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth (12 Months)</h3>
                <LineChart data={userGrowthChartData!} options={{ responsive: true, maintainAspectRatio: true }} />
              </div>

              {/* Acquisition Sources */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Acquisition Sources</h3>
                  <DoughnutChart data={acquisitionSourcesData!} options={{ responsive: true }} />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Source Performance</h3>
                  <div className="space-y-3">
                    {growth.acquisitionSources.map((source, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">{source.source}</p>
                          <p className="text-sm text-gray-600">{source.percentage}%</p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{source.users.toLocaleString()} users</span>
                          <span className="text-green-600 font-semibold">{source.conversionRate}% CVR</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Growth Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Growth</h3>
                  <div className="space-y-2">
                    {growth.restaurantGrowth.slice(-6).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-gray-900">+{item.newRestaurants}</span>
                          <span className={`text-sm ${item.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.growthRate >= 0 ? '+' : ''}{item.growthRate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Growth</h3>
                  <div className="space-y-2">
                    {growth.bookingGrowth.slice(-6).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-gray-900">{item.bookings.toLocaleString()}</span>
                          <span className={`text-sm ${item.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.growthRate >= 0 ? '+' : ''}{item.growthRate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Custom Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Custom Reports & Scheduled Exports</h2>
                <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                  Create New Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {customReports.map((report) => (
                  <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Date Range:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(report.dateRange.start).toLocaleDateString()} - {new Date(report.dateRange.end).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Schedule:</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                          {report.schedule}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Last Generated:</span>
                        <span className="text-gray-900">
                          {report.lastGenerated ? new Date(report.lastGenerated).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Metrics: {report.metrics.join(', ')}</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                        Generate Now
                      </button>
                      <button className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Export Options */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Export Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleExport('revenue', 'csv')}
                    className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <p className="font-semibold text-gray-900">Revenue Data (CSV)</p>
                    <p className="text-sm text-gray-600 mt-1">Export all revenue history with commission and refunds</p>
                  </button>
                  <button
                    onClick={() => handleExport('users', 'csv')}
                    className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <p className="font-semibold text-gray-900">User Growth (CSV)</p>
                    <p className="text-sm text-gray-600 mt-1">Export user growth and acquisition data</p>
                  </button>
                  <button
                    onClick={() => handleExport('bookings', 'csv')}
                    className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <p className="font-semibold text-gray-900">Booking Analytics (CSV)</p>
                    <p className="text-sm text-gray-600 mt-1">Export booking trends and growth metrics</p>
                  </button>
                  <button
                    onClick={() => handleExport('all', 'json')}
                    className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <p className="font-semibold text-gray-900">Complete Dataset (JSON)</p>
                    <p className="text-sm text-gray-600 mt-1">Export all analytics data in JSON format</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && performance && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Real-time Performance Monitoring</h2>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Server Response Time</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{performance.serverResponseTime}ms</p>
                      <p className={`text-sm mt-2 ${performance.serverResponseTime < 200 ? 'text-green-600' : 'text-orange-600'}`}>
                        {performance.serverResponseTime < 200 ? 'Excellent' : 'Acceptable'}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">System Uptime</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{performance.uptime}%</p>
                      <p className="text-sm text-green-600 mt-2">Exceptional</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Error Rate</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{performance.errorRate}%</p>
                      <p className="text-sm text-green-600 mt-2">Very Low</p>
                    </div>
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Active Connections</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{performance.activeConnections.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">API Calls (Today)</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{performance.apiCalls.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Cache Hit Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{performance.cacheHitRate}%</p>
                </div>
              </div>

              {/* Active Alerts */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Performance Alerts</h3>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.severity === 'critical'
                          ? 'border-red-300 bg-red-50'
                          : alert.severity === 'high'
                          ? 'border-orange-300 bg-orange-50'
                          : alert.severity === 'medium'
                          ? 'border-yellow-300 bg-yellow-50'
                          : 'border-blue-300 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                alert.severity === 'critical'
                                  ? 'bg-red-200 text-red-800'
                                  : alert.severity === 'high'
                                  ? 'bg-orange-200 text-orange-800'
                                  : alert.severity === 'medium'
                                  ? 'bg-yellow-200 text-yellow-800'
                                  : 'bg-blue-200 text-blue-800'
                              }`}
                            >
                              {alert.severity}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800">
                              {alert.type}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                alert.status === 'active'
                                  ? 'bg-red-200 text-red-800'
                                  : alert.status === 'acknowledged'
                                  ? 'bg-yellow-200 text-yellow-800'
                                  : 'bg-green-200 text-green-800'
                              }`}
                            >
                              {alert.status}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mt-2">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                          <div className="mt-2 flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              Threshold: <strong>{alert.threshold}</strong>
                            </span>
                            <span className="text-gray-600">
                              Current: <strong>{alert.currentValue}</strong>
                            </span>
                            <span className="text-gray-500">
                              {new Date(alert.triggeredAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          {alert.status === 'active' && (
                            <button
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                              className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                            >
                              Acknowledge
                            </button>
                          )}
                          {alert.status === 'acknowledged' && (
                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
