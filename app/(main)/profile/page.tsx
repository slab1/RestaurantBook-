'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, MapPin, Calendar, Settings, LogOut, Shield, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UserStats {
  totalBookings: number
  totalReviews: number
  memberSince: string
  favoriteRestaurants: number
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats>({
    totalBookings: 0,
    totalReviews: 0,
    memberSince: new Date().toLocaleDateString(),
    favoriteRestaurants: 0
  })

  useEffect(() => {
    // Fetch user statistics from localStorage or API
    if (user) {
      const savedStats = localStorage.getItem(`user_stats_${user.id}`)
      if (savedStats) {
        setStats(JSON.parse(savedStats))
      } else {
        // Initialize stats for new users
        const newStats = {
          totalBookings: 0,
          totalReviews: 0,
          memberSince: new Date().toLocaleDateString(),
          favoriteRestaurants: 0
        }
        setStats(newStats)
        localStorage.setItem(`user_stats_${user.id}`, JSON.stringify(newStats))
      }
    }
  }, [user])

  const handleLogout = () => {
    console.log('[Profile] User logging out')
    logout()
    router.push('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Sign in to view your profile</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Access your bookings, reviews, and preferences
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push('/login')}>
                Log In
              </Button>
              <Button variant="outline" onClick={() => router.push('/register')}>
                Register
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-semibold">
                      {user.firstName} {user.lastName}
                    </h2>
                    {user.emailVerified && (
                      <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    {user.role === 'ADMIN' ? (
                      <>
                        <Shield className="h-4 w-4 text-red-500" />
                        Administrator
                      </>
                    ) : (
                      'Customer'
                    )}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <Mail className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                {user.emailVerified && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <Phone className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Phone</p>
                  <p className="text-gray-500">Not provided</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => router.push('/settings')}>
                  Add
                </Button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Address</p>
                  <p className="text-gray-500">Not provided</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => router.push('/settings')}>
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.totalBookings}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Bookings</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats.totalReviews}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Reviews</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.favoriteRestaurants}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Favorites</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg">
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {stats.memberSince}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Member Since</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-950"
                onClick={() => router.push('/bookings')}
              >
                <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                View My Bookings
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-purple-50 dark:hover:bg-purple-950"
                onClick={() => router.push('/restaurants')}
              >
                <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                Browse Restaurants
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => router.push('/settings')}
              >
                <Settings className="h-4 w-4 mr-2 text-gray-600" />
                Account Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
