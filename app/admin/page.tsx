'use client'

import {
  Users,
  Store,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Star,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import Link from 'next/link'

// Mock data for demonstration
const stats = {
  totalUsers: 12847,
  userGrowth: 12.5,
  activeRestaurants: 342,
  restaurantGrowth: 8.3,
  dailyBookings: 1567,
  bookingGrowth: -3.2,
  monthlyRevenue: 145690,
  revenueGrowth: 15.7,
}

const quickActions = [
  {
    title: 'Approve Pending Restaurants',
    count: 5,
    href: '/admin/restaurants?filter=pending',
    icon: Store,
    color: 'bg-blue-500',
  },
  {
    title: 'Handle Support Tickets',
    count: 12,
    href: '/admin/support',
    icon: MessageSquare,
    color: 'bg-green-500',
  },
  {
    title: 'Review Flagged Content',
    count: 3,
    href: '/admin/content',
    icon: AlertCircle,
    color: 'bg-yellow-500',
  },
  {
    title: 'Booking Disputes',
    count: 2,
    href: '/admin/bookings?filter=disputed',
    icon: Calendar,
    color: 'bg-red-500',
  },
]

const recentActivity = [
  {
    id: 1,
    type: 'user',
    message: 'New user registration: john.doe@example.com',
    time: '2 minutes ago',
    icon: Users,
    iconColor: 'text-blue-500',
  },
  {
    id: 2,
    type: 'restaurant',
    message: 'Restaurant "Bella Italia" submitted for approval',
    time: '15 minutes ago',
    icon: Store,
    iconColor: 'text-green-500',
  },
  {
    id: 3,
    type: 'booking',
    message: 'Large party booking (15 guests) at The Golden Spoon',
    time: '32 minutes ago',
    icon: Calendar,
    iconColor: 'text-purple-500',
  },
  {
    id: 4,
    type: 'review',
    message: 'New 5-star review posted for Sakura Sushi',
    time: '1 hour ago',
    icon: Star,
    iconColor: 'text-yellow-500',
  },
  {
    id: 5,
    type: 'support',
    message: 'Support ticket #1234 opened: Payment issue',
    time: '2 hours ago',
    icon: MessageSquare,
    iconColor: 'text-red-500',
  },
]

const systemHealth = [
  { name: 'API Response Time', value: '245ms', status: 'good', percentage: 85 },
  { name: 'Database Performance', value: '98%', status: 'good', percentage: 98 },
  { name: 'Server Uptime', value: '99.9%', status: 'good', percentage: 99 },
  { name: 'Error Rate', value: '0.02%', status: 'good', percentage: 99.98 },
]

const topRestaurants = [
  {
    id: 1,
    name: 'The Golden Spoon',
    bookings: 234,
    revenue: 12450,
    rating: 4.8,
    trend: 'up',
  },
  {
    id: 2,
    name: 'Bella Vista',
    bookings: 198,
    revenue: 10290,
    rating: 4.7,
    trend: 'up',
  },
  {
    id: 3,
    name: 'Sakura Sushi',
    bookings: 187,
    revenue: 9870,
    rating: 4.9,
    trend: 'down',
  },
  {
    id: 4,
    name: 'The Cozy Corner',
    bookings: 156,
    revenue: 7890,
    rating: 4.6,
    trend: 'up',
  },
  {
    id: 5,
    name: 'Spice Route',
    bookings: 145,
    revenue: 7230,
    rating: 4.8,
    trend: 'up',
  },
]

function StatCard({ title, value, change, icon: Icon, trend }: any) {
  const isPositive = change >= 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {Math.abs(change)}%
        </span>
        <span className="text-sm text-gray-500 ml-2">vs last month</span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={stats.userGrowth}
          icon={Users}
        />
        <StatCard
          title="Active Restaurants"
          value={stats.activeRestaurants}
          change={stats.restaurantGrowth}
          icon={Store}
        />
        <StatCard
          title="Daily Bookings"
          value={stats.dailyBookings}
          change={stats.bookingGrowth}
          icon={Calendar}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats.monthlyRevenue / 1000).toFixed(1)}k`}
          change={stats.revenueGrowth}
          icon={DollarSign}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{action.count}</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 text-center">
              <Link href="/admin/activity" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all activity
              </Link>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
            </div>
            <div className="p-6 space-y-4">
              {systemHealth.map((metric) => (
                <div key={metric.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{metric.name}</span>
                    <span className="text-sm font-medium text-gray-900">{metric.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric.status === 'good'
                          ? 'bg-green-500'
                          : metric.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${metric.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 bg-green-50">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Restaurants */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Top Performing Restaurants</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topRestaurants.map((restaurant, index) => (
                <tr key={restaurant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {restaurant.bookings.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${restaurant.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-gray-900">{restaurant.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {restaurant.trend === 'up' ? (
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="text-sm">Up</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        <span className="text-sm">Down</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 text-center">
          <Link href="/admin/restaurants" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all restaurants
          </Link>
        </div>
      </div>
    </div>
  )
}
