'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Mail, Phone, MapPin, Calendar, Settings, LogOut, Shield, CheckCircle, Upload, Heart, ShoppingBag, Clock, DollarSign, Star, UtensilsCrossed } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { getUserProfile, getOrderHistory, getBookingHistory, uploadProfilePhoto, type UserProfile, type OrderHistory, type BookingHistory } from '@/lib/user-profile-service'
import { useCart } from '@/lib/cart-context'
import Image from 'next/image'

export function ProfileClient() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { items: cartItems } = useCart()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<OrderHistory[]>([])
  const [bookings, setBookings] = useState<BookingHistory[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user) {
      const userProfile = getUserProfile(user.id, user.email, user.firstName, user.lastName)
      setProfile(userProfile)
      setOrders(getOrderHistory())
      setBookings(getBookingHistory())
    }
  }, [user])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)
    try {
      const base64 = await uploadProfilePhoto(file)
      setProfile(prev => prev ? { ...prev, profilePhoto: base64 } : null)
      toast({
        title: 'Success',
        description: 'Profile photo updated successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload photo',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Sign in to view your profile</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Access your bookings, orders, and preferences
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

  if (!profile) return null

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile Photo */}
                <div className="relative mb-4">
                  {profile.profilePhoto ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
                      <Image 
                        src={profile.profilePhoto} 
                        alt="Profile" 
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <h2 className="text-2xl font-semibold mb-1">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  {user.emailVerified && (
                    <Badge variant="default" className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {user.role === 'ADMIN' && (
                    <Badge variant="default" className="bg-red-100 text-red-700">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {user.email}
                </p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 w-full mb-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {profile.statistics.totalOrders}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Orders</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {profile.statistics.totalBookings}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Bookings</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {profile.preferences.favoriteRestaurants.length}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Favorites</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <p className="text-lg font-bold text-orange-600">
                      ${profile.statistics.totalSpent.toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Spent</p>
                  </div>
                </div>

                {/* Member Since */}
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member since {new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Phone</p>
                        <p className="text-gray-500">{profile.phone || 'Not provided'}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => router.push('/settings')}>
                        {profile.phone ? 'Edit' : 'Add'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Cart */}
                {cartItems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Current Cart</span>
                        <Badge>{cartItems.length} items</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {cartItems.slice(0, 3).map(item => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        {cartItems.length > 3 && (
                          <p className="text-sm text-gray-500">+ {cartItems.length - 3} more items</p>
                        )}
                      </div>
                      <Button onClick={() => router.push('/cart')} className="w-full mt-4">
                        View Cart
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/bookings')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      View My Bookings
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/restaurants')}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Browse Restaurants
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Log Out
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4">
                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Recent Orders ({orders.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No orders yet</p>
                        <Button variant="link" onClick={() => router.push('/restaurants')}>
                          Start ordering
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 5).map(order => (
                          <div key={order.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                            <div>
                              <p className="font-medium">{order.restaurantName}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(order.date).toLocaleDateString()} • {order.items.length} items
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${order.total.toFixed(2)}</p>
                              <Badge variant={order.status === 'completed' ? 'default' : order.status === 'pending' ? 'secondary' : 'destructive'}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Booking History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Booking History ({bookings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No bookings yet</p>
                        <Button variant="link" onClick={() => router.push('/bookings')}>
                          Make a reservation
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookings.slice(0, 5).map(booking => (
                          <div key={booking.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                            <div>
                              <p className="font-medium">{booking.restaurantName}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(booking.date).toLocaleDateString()} at {booking.time}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{booking.partySize} guests</p>
                              <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'completed' ? 'secondary' : 'destructive'}>
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UtensilsCrossed className="h-5 w-5" />
                      Cuisine Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.preferences.cuisinePreferences.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <p className="mb-3">No cuisine preferences set</p>
                        <Button variant="outline" onClick={() => router.push('/settings')}>
                          Set Preferences
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.preferences.cuisinePreferences.map(cuisine => (
                          <Badge key={cuisine} variant="secondary">{cuisine}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Favorite Restaurants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.preferences.favoriteRestaurants.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <Heart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No favorite restaurants yet</p>
                        <Button variant="link" onClick={() => router.push('/restaurants')}>
                          Explore restaurants
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {profile.preferences.favoriteRestaurants.map(id => (
                          <div key={id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                            Restaurant {id}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Settings
                    </Button>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Update your password, notification preferences, privacy settings, and more.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
