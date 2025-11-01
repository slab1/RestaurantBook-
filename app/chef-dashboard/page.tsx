'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, DollarSign, Star, Users, TrendingUp, Clock,
  CheckCircle, XCircle, AlertCircle, Settings, Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'

interface ChefStats {
  totalBookings: number
  pendingBookings: number
  completedBookings: number
  totalEarnings: number
  averageRating: number
  totalReviews: number
  acceptanceRate: number
}

export default function ChefDashboardPage() {
  const [stats, setStats] = useState<ChefStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
    acceptanceRate: 0,
  })
  const [chef, setChef] = useState<any>(null)
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    // TODO: Get current chef ID from session
    // For now, using mock data
    setLoading(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chef Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your bookings and profile</p>
            </div>
            <Link
              href="/chef-dashboard/settings"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Total Bookings</div>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalBookings}</div>
            <div className="text-sm text-gray-500 mt-1">All time</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Pending Requests</div>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.pendingBookings}</div>
            <div className="text-sm text-gray-500 mt-1">Awaiting response</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Total Earnings</div>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.totalEarnings)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Lifetime revenue</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Average Rating</div>
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-500 mt-1">{stats.totalReviews} reviews</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/chef-dashboard/bookings"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Bookings</h3>
                <p className="text-sm text-gray-600">View and respond to requests</p>
              </div>
            </div>
          </Link>

          <Link
            href="/chef-dashboard/availability"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Set Availability</h3>
                <p className="text-sm text-gray-600">Manage your schedule</p>
              </div>
            </div>
          </Link>

          <Link
            href="/chef-dashboard/profile"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Edit Profile</h3>
                <p className="text-sm text-gray-600">Update your information</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Booking Requests</h2>
          
          {recentBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No recent bookings</p>
              <p className="text-sm text-gray-400 mt-1">New booking requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{booking.eventType}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.partySize} guests • {new Date(booking.eventDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">{booking.eventCity}, {booking.eventState}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(booking.totalAmount)}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                          Accept
                        </button>
                        <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Acceptance Rate</span>
                  <span className="font-semibold">{(stats.acceptanceRate * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.acceptanceRate * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold">
                    {stats.totalBookings > 0 ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalBookings > 0 ? (stats.completedBookings / stats.totalBookings) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Tips</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Respond to bookings within 24 hours to maintain high ratings</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Keep your availability calendar up to date</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Upload high-quality photos to your portfolio</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
