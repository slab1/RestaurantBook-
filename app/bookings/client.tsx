'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, MapPin, Star, Gift, Bell, CreditCard, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Mock restaurant data
const restaurants = {
  1: { name: "The Golden Spoon", image: "/placeholder.svg", cuisine: "Fine Dining", location: "Downtown" },
  2: { name: "Coastal Breeze", image: "/placeholder.svg", cuisine: "Seafood", location: "Waterfront" },
  3: { name: "Urban Bistro", image: "/placeholder.svg", cuisine: "Modern American", location: "City Center" },
  4: { name: "Sakura Garden", image: "/placeholder.svg", cuisine: "Japanese", location: "Arts District" },
  5: { name: "Mediterranean Delight", image: "/placeholder.svg", cuisine: "Mediterranean", location: "Old Town" },
  6: { name: "The Harvest Table", image: "/placeholder.svg", cuisine: "Farm-to-Table", location: "Suburbs" }
}

// Mock user booking data
const mockBookings = [
  {
    id: 'bk_001',
    restaurantId: 1,
    date: '2025-10-28',
    time: '19:00',
    partySize: 4,
    status: 'confirmed',
    tablePreference: 'window',
    specialOccasion: 'anniversary',
    depositPaid: 50,
    totalAmount: 150,
    bookingDate: '2025-10-25',
    guestName: 'John Smith',
    guestEmail: 'john@example.com',
    guestPhone: '+1-555-0123',
    specialRequests: 'Quiet table please',
    confirmationNumber: 'RS-001-251025'
  },
  {
    id: 'bk_002',
    restaurantId: 3,
    date: '2025-11-02',
    time: '18:30',
    partySize: 2,
    status: 'confirmed',
    tablePreference: 'outdoor',
    specialOccasion: 'date',
    depositPaid: 0,
    totalAmount: 80,
    bookingDate: '2025-10-26',
    guestName: 'John Smith',
    guestEmail: 'john@example.com',
    guestPhone: '+1-555-0123',
    specialRequests: '',
    confirmationNumber: 'UB-002-261025'
  },
  {
    id: 'bk_003',
    restaurantId: 2,
    date: '2025-10-20',
    time: '20:00',
    partySize: 6,
    status: 'completed',
    tablePreference: 'indoor',
    specialOccasion: 'birthday',
    depositPaid: 100,
    totalAmount: 320,
    bookingDate: '2025-10-18',
    guestName: 'John Smith',
    guestEmail: 'john@example.com',
    guestPhone: '+1-555-0123',
    specialRequests: 'Birthday dessert',
    confirmationNumber: 'CB-003-181025',
    hasReview: false,
    pointsEarned: 32
  },
  {
    id: 'bk_004',
    restaurantId: 4,
    date: '2025-10-15',
    time: '19:30',
    partySize: 4,
    status: 'completed',
    tablePreference: 'bar',
    specialOccasion: '',
    depositPaid: 0,
    totalAmount: 200,
    bookingDate: '2025-10-13',
    guestName: 'John Smith',
    guestEmail: 'john@example.com',
    guestPhone: '+1-555-0123',
    specialRequests: '',
    confirmationNumber: 'SG-004-131025',
    hasReview: true,
    pointsEarned: 20
  },
  {
    id: 'bk_005',
    restaurantId: 5,
    date: '2025-10-10',
    time: '18:00',
    partySize: 8,
    status: 'completed',
    tablePreference: 'quiet',
    specialOccasion: 'business',
    depositPaid: 200,
    totalAmount: 450,
    bookingDate: '2025-10-08',
    guestName: 'John Smith',
    guestEmail: 'john@example.com',
    guestPhone: '+1-555-0123',
    specialRequests: 'Corporate dinner',
    confirmationNumber: 'MD-005-081025',
    hasReview: false,
    pointsEarned: 45
  }
]

// Mock user profile data
const mockUserProfile = {
  name: 'John Smith',
  email: 'john@example.com',
  loyaltyPoints: 147,
  membershipTier: 'Gold',
  totalBookings: 23,
  favoriteRestaurants: [1, 4, 5],
  preferences: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    reminderTime: '2_hours' // 2 hours before booking
  }
}

export default function BookingsClient() {
  const [bookings, setBookings] = useState(mockBookings)
  const [userProfile, setUserProfile] = useState(mockUserProfile)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [showCancelDialog, setShowCancelDialog] = useState(null)
  const [showModifyDialog, setShowModifyDialog] = useState(null)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const { toast } = useToast()

  // Separate upcoming and past bookings
  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date + 'T' + booking.time)
    return bookingDate > new Date() && booking.status === 'confirmed'
  })

  const pastBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date + 'T' + booking.time)
    return bookingDate <= new Date() || booking.status === 'completed'
  })

  const pendingReviews = pastBookings.filter(booking => !booking.hasReview)

  // Policy check for modifications (24 hours before)
  const canModifyBooking = (booking) => {
    const bookingDateTime = new Date(booking.date + 'T' + booking.time)
    const now = new Date()
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60)
    return hoursUntilBooking > 24
  }

  const handleCancelBooking = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (!booking) return

    const canCancel = canModifyBooking(booking)
    if (!canCancel) {
      toast({
        title: "Cannot Cancel",
        description: "Bookings can only be cancelled more than 24 hours in advance.",
        variant: "destructive"
      })
      return
    }

    // Update booking status
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' } : b
    ))

    toast({
      title: "Booking Cancelled",
      description: `Your reservation at ${restaurants[booking.restaurantId].name} has been cancelled. ${booking.depositPaid > 0 ? `Your deposit of $${booking.depositPaid} will be refunded within 3-5 business days.` : ''}`,
      variant: "default"
    })

    setShowCancelDialog(null)
  }

  const handleRebook = (booking) => {
    // Navigate to restaurant with booking form open
    window.location.href = `/restaurants/${booking.restaurantId}?open_booking=true`
  }

  const handleLeaveReview = (booking) => {
    // Navigate to restaurant page to leave review
    window.location.href = `/restaurants/${booking.restaurantId}?open_review=true`
  }

  const handleNotificationToggle = (type, enabled) => {
    setUserProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: enabled
      }
    }))

    toast({
      title: "Preferences Updated",
      description: `${type.replace(/([A-Z])/g, ' $1').toLowerCase()} ${enabled ? 'enabled' : 'disabled'}.`,
    })
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const BookingCard = ({ booking, isUpcoming = true }) => {
    const restaurant = restaurants[booking.restaurantId]
    const canModify = canModifyBooking(booking)

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Restaurant Image */}
          <div className="flex-shrink-0">
            <Image
              src={restaurant.image}
              alt={restaurant.name}
              width={120}
              height={80}
              className="rounded-lg object-cover w-full md:w-30 h-20"
            />
          </div>

          {/* Booking Details */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {restaurant.name}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {restaurant.location} • {restaurant.cuisine}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(booking.date)}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(booking.time)}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    {booking.partySize} guests
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Badge variant="outline" className="text-xs">
                      {booking.tablePreference || 'No preference'}
                    </Badge>
                  </div>
                </div>

                {booking.specialOccasion && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <Gift className="w-3 h-3 mr-1" />
                      {booking.specialOccasion}
                    </Badge>
                  </div>
                )}

                {booking.confirmationNumber && (
                  <div className="mt-2 text-xs text-gray-500">
                    Confirmation: {booking.confirmationNumber}
                  </div>
                )}
              </div>

              {/* Status and Actions */}
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2">
                  {booking.status === 'confirmed' && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Confirmed
                    </Badge>
                  )}
                  {booking.status === 'completed' && (
                    <Badge variant="secondary">
                      Completed
                    </Badge>
                  )}
                  {booking.status === 'cancelled' && (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      Cancelled
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  {isUpcoming && booking.status === 'confirmed' && (
                    <>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={canModify ? "outline" : "outline"}
                          onClick={() => setShowModifyDialog(booking)}
                          disabled={!canModify}
                          className="text-xs"
                        >
                          Modify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowCancelDialog(booking)}
                          disabled={!canModify}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </Button>
                      </div>
                      {!canModify && (
                        <div className="text-xs text-gray-500 text-center">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          24h policy applies
                        </div>
                      )}
                    </>
                  )}

                  {!isUpcoming && booking.status === 'completed' && (
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRebook(booking)}
                        className="text-xs"
                      >
                        Book Again
                      </Button>
                      {!booking.hasReview && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLeaveReview(booking)}
                          className="text-xs"
                        >
                          Leave Review
                        </Button>
                      )}
                      {booking.pointsEarned && (
                        <div className="text-xs text-green-600 text-center">
                          <Gift className="w-3 h-3 inline mr-1" />
                          +{booking.pointsEarned} points
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">Manage your restaurant reservations and dining history</p>
            </div>
            
            {/* Loyalty Points Card */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-4 min-w-[200px]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90">Loyalty Points</div>
                  <div className="text-2xl font-bold">{userProfile.loyaltyPoints}</div>
                  <div className="text-xs opacity-75">{userProfile.membershipTier} Member</div>
                </div>
                <Gift className="w-8 h-8 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{pastBookings.length}</div>
                <div className="text-sm text-gray-600">Past Bookings</div>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{pendingReviews.length}</div>
                <div className="text-sm text-gray-600">Pending Reviews</div>
              </div>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNotificationSettings(!showNotificationSettings)}
                  className="text-xs"
                >
                  <Bell className="w-4 h-4 mr-1" />
                  Notifications
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings Panel */}
        {showNotificationSettings && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Email Notifications</div>
                  <div className="text-sm text-gray-600">Receive booking confirmations and reminders via email</div>
                </div>
                <button
                  onClick={() => handleNotificationToggle('emailNotifications', !userProfile.preferences.emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    userProfile.preferences.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    userProfile.preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">SMS Notifications</div>
                  <div className="text-sm text-gray-600">Receive booking reminders via text message</div>
                </div>
                <button
                  onClick={() => handleNotificationToggle('smsNotifications', !userProfile.preferences.smsNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    userProfile.preferences.smsNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    userProfile.preferences.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Push Notifications</div>
                  <div className="text-sm text-gray-600">Receive push notifications on your device</div>
                </div>
                <button
                  onClick={() => handleNotificationToggle('pushNotifications', !userProfile.preferences.pushNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    userProfile.preferences.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    userProfile.preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Reminders */}
        {pendingReviews.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-800">Pending Reviews</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              You have {pendingReviews.length} recent dining experience{pendingReviews.length > 1 ? 's' : ''} waiting for your review.
            </p>
            <div className="flex flex-wrap gap-2">
              {pendingReviews.slice(0, 3).map(booking => (
                <Button
                  key={booking.id}
                  size="sm"
                  onClick={() => handleLeaveReview(booking)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Review {restaurants[booking.restaurantId].name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            History ({pastBookings.length})
          </button>
        </div>

        {/* Bookings Content */}
        <div className="space-y-6">
          {activeTab === 'upcoming' && (
            <>
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                  <p className="text-gray-600 mb-4">Ready to make your next reservation?</p>
                  <Link href="/">
                    <Button>Browse Restaurants</Button>
                  </Link>
                </div>
              ) : (
                upcomingBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} isUpcoming={true} />
                ))
              )}
            </>
          )}

          {activeTab === 'history' && (
            <>
              {pastBookings.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No booking history</h3>
                  <p className="text-gray-600 mb-4">Start dining and build your history!</p>
                  <Link href="/">
                    <Button>Browse Restaurants</Button>
                  </Link>
                </div>
              ) : (
                pastBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} isUpcoming={false} />
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Cancel Booking Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Booking</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel your reservation at {restaurants[showCancelDialog.restaurantId].name} 
              on {formatDate(showCancelDialog.date)} at {formatTime(showCancelDialog.time)}?
            </p>
            
            {showCancelDialog.depositPaid > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Refund Information</span>
                </div>
                <p className="text-sm text-blue-700">
                  Your deposit of ${showCancelDialog.depositPaid} will be refunded to your original payment method within 3-5 business days.
                </p>
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(null)}
              >
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleCancelBooking(showCancelDialog.id)}
              >
                Cancel Booking
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Booking Dialog */}
      {showModifyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Modify Booking</h3>
            <p className="text-gray-600 mb-4">
              To modify your reservation at {restaurants[showModifyDialog.restaurantId].name}, 
              you'll be redirected to the booking form with your current details pre-filled.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Modification Policy</span>
              </div>
              <p className="text-sm text-yellow-700">
                Changes can only be made more than 24 hours before your reservation time. 
                Subject to availability.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowModifyDialog(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleRebook(showModifyDialog)
                  setShowModifyDialog(null)
                }}
              >
                Modify Booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}