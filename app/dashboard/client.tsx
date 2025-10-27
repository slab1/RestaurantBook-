'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Star, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Eye,
  Edit3,
  Plus,
  Check,
  X,
  MessageSquare,
  Settings,
  BarChart3,
  Gift,
  Menu as MenuIcon,
  Phone,
  Mail,
  Globe,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

// Mock restaurant data
const mockRestaurant = {
  id: 1,
  name: "The Golden Spoon",
  description: "An elegant fine dining establishment offering contemporary cuisine with a focus on locally sourced ingredients.",
  cuisine: "Fine Dining",
  location: "Downtown",
  address: "123 Main Street, Downtown, City 12345",
  phone: "+1-555-0123",
  email: "info@goldenspoon.com",
  website: "www.goldenspoon.com",
  image: "/placeholder.svg",
  rating: 4.6,
  totalReviews: 342,
  priceRange: "$$$",
  hours: {
    monday: "5:00 PM - 10:00 PM",
    tuesday: "5:00 PM - 10:00 PM", 
    wednesday: "5:00 PM - 10:00 PM",
    thursday: "5:00 PM - 10:00 PM",
    friday: "5:00 PM - 11:00 PM",
    saturday: "4:00 PM - 11:00 PM",
    sunday: "4:00 PM - 9:00 PM"
  },
  capacity: 120,
  tables: {
    twoPerson: 15,
    fourPerson: 20,
    sixPerson: 8,
    eightPerson: 4,
    private: 2
  }
}

// Mock booking data
const mockBookings = [
  {
    id: 'bk_001',
    guestName: 'John Smith',
    guestEmail: 'john@example.com',
    guestPhone: '+1-555-0123',
    date: '2025-10-28',
    time: '19:00',
    partySize: 4,
    status: 'pending',
    tablePreference: 'window',
    specialOccasion: 'anniversary',
    specialRequests: 'Quiet table please',
    confirmationNumber: 'RS-001-251025',
    bookingDate: '2025-10-25'
  },
  {
    id: 'bk_002',
    guestName: 'Sarah Johnson',
    guestEmail: 'sarah@example.com',
    guestPhone: '+1-555-0456',
    date: '2025-10-28',
    time: '18:30',
    partySize: 2,
    status: 'confirmed',
    tablePreference: 'outdoor',
    specialOccasion: 'date',
    specialRequests: '',
    confirmationNumber: 'RS-002-261025',
    bookingDate: '2025-10-26'
  },
  {
    id: 'bk_003',
    guestName: 'Mike Wilson',
    guestEmail: 'mike@example.com',
    guestPhone: '+1-555-0789',
    date: '2025-10-29',
    time: '20:00',
    partySize: 8,
    status: 'pending',
    tablePreference: 'private',
    specialOccasion: 'business',
    specialRequests: 'Corporate dinner for 8',
    confirmationNumber: 'RS-003-271025',
    bookingDate: '2025-10-27'
  }
]

// Mock menu data
const mockMenu = [
  {
    id: 'app_001',
    category: 'Appetizers',
    name: 'Truffle Arancini',
    description: 'Crispy risotto balls with black truffle and parmesan',
    price: 18,
    ingredients: ['Arborio rice', 'Black truffle', 'Parmesan', 'Herbs'],
    allergens: ['Dairy', 'Gluten'],
    available: true,
    popular: true
  },
  {
    id: 'main_001', 
    category: 'Main Courses',
    name: 'Pan-Seared Salmon',
    description: 'Atlantic salmon with seasonal vegetables and lemon herb butter',
    price: 32,
    ingredients: ['Atlantic salmon', 'Seasonal vegetables', 'Lemon', 'Herbs', 'Butter'],
    allergens: ['Fish', 'Dairy'],
    available: true,
    popular: false
  },
  {
    id: 'main_002',
    category: 'Main Courses', 
    name: 'Dry-Aged Ribeye',
    description: '16oz dry-aged ribeye steak with roasted potatoes and red wine jus',
    price: 58,
    ingredients: ['Dry-aged ribeye', 'Potatoes', 'Red wine', 'Herbs'],
    allergens: [],
    available: false,
    popular: true
  },
  {
    id: 'dess_001',
    category: 'Desserts',
    name: 'Chocolate Soufflé',
    description: 'Warm chocolate soufflé with vanilla ice cream',
    price: 14,
    ingredients: ['Dark chocolate', 'Eggs', 'Cream', 'Vanilla'],
    allergens: ['Dairy', 'Eggs'],
    available: true,
    popular: true
  }
]

// Mock reviews data
const mockReviews = [
  {
    id: 'rev_001',
    guestName: 'Emily Davis',
    rating: 5,
    date: '2025-10-25',
    review: 'Absolutely phenomenal dining experience! The truffle arancini was exceptional and the service was impeccable. Will definitely be back.',
    bookingId: 'bk_historical_001',
    responded: false
  },
  {
    id: 'rev_002',
    guestName: 'Robert Chen',
    rating: 4,
    date: '2025-10-24',
    review: 'Great food and atmosphere. The salmon was perfectly cooked. Only complaint is that it was quite noisy during peak hours.',
    bookingId: 'bk_historical_002',
    responded: true,
    response: 'Thank you for your feedback, Robert! We appreciate your comments about the noise level and are working on acoustic improvements.'
  },
  {
    id: 'rev_003',
    guestName: 'Lisa Thompson',
    rating: 3,
    date: '2025-10-23',
    review: 'Food was good but service was slow. Waited 20 minutes just to place our order. Expected better for the price point.',
    bookingId: 'bk_historical_003',
    responded: false
  }
]

// Mock analytics data
const mockAnalytics = {
  revenue: {
    today: 3450,
    week: 28750,
    month: 125600,
    change: 12.5
  },
  bookings: {
    today: 23,
    week: 187,
    month: 742,
    change: 8.3
  },
  averageSpend: {
    current: 85,
    previous: 78,
    change: 8.9
  },
  occupancy: {
    current: 78,
    target: 85,
    change: -3.2
  },
  popularTimes: [
    { time: '17:00', bookings: 12 },
    { time: '18:00', bookings: 25 },
    { time: '19:00', bookings: 45 },
    { time: '20:00', bookings: 38 },
    { time: '21:00', bookings: 22 }
  ],
  popularItems: [
    { name: 'Truffle Arancini', orders: 156, revenue: 2808 },
    { name: 'Dry-Aged Ribeye', orders: 89, revenue: 5162 },
    { name: 'Pan-Seared Salmon', orders: 134, revenue: 4288 },
    { name: 'Chocolate Soufflé', orders: 98, revenue: 1372 }
  ]
}

// Mock special offers
const mockOffers = [
  {
    id: 'offer_001',
    title: 'Early Bird Special',
    description: '20% off all appetizers before 6 PM',
    discount: 20,
    type: 'percentage',
    category: 'Appetizers',
    validFrom: '2025-10-27',
    validTo: '2025-11-15',
    active: true,
    conditions: 'Valid Monday-Thursday before 6 PM'
  },
  {
    id: 'offer_002',
    title: 'Date Night Package',
    description: '3-course meal for two with wine pairing',
    discount: 95,
    type: 'fixed_price',
    category: 'Package',
    validFrom: '2025-10-25',
    validTo: '2025-12-31',
    active: true,
    conditions: 'Available Friday-Sunday evenings'
  }
]

export default function DashboardClient() {
  const [activeSection, setActiveSection] = useState('overview')
  const [restaurant, setRestaurant] = useState(mockRestaurant)
  const [bookings, setBookings] = useState(mockBookings)
  const [menu, setMenu] = useState(mockMenu)
  const [reviews, setReviews] = useState(mockReviews)
  const [offers, setOffers] = useState(mockOffers)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState(null)
  const [newOffer, setNewOffer] = useState(null)
  const { toast } = useToast()

  const handleBookingAction = (bookingId, action) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: action }
        : booking
    ))

    const booking = bookings.find(b => b.id === bookingId)
    toast({
      title: `Booking ${action}`,
      description: `${booking.guestName}'s reservation has been ${action}.`,
    })
  }

  const handleMenuItemUpdate = (itemId, updates) => {
    setMenu(prev => prev.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    ))
    setEditingMenuItem(null)
    toast({
      title: "Menu Updated",
      description: "Menu item has been successfully updated.",
    })
  }

  const handleReviewResponse = (reviewId, response) => {
    setReviews(prev => prev.map(review =>
      review.id === reviewId 
        ? { ...review, responded: true, response }
        : review
    ))
    toast({
      title: "Response Sent",
      description: "Your response to the review has been published.",
    })
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
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

  // Sidebar navigation
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'menu', label: 'Menu Management', icon: MenuIcon },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'offers', label: 'Special Offers', icon: Gift },
    { id: 'profile', label: 'Restaurant Profile', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Restaurant Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">{restaurant.name}</p>
        </div>
        
        <nav className="p-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mb-1 ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
                <p className="text-gray-600">Welcome back! Here's what's happening at your restaurant today.</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">${mockAnalytics.revenue.today.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Today's Revenue</div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-500">+{mockAnalytics.revenue.change}%</span>
                    <span className="text-gray-500 ml-1">vs yesterday</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{mockAnalytics.bookings.today}</div>
                      <div className="text-sm text-gray-600">Today's Bookings</div>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-500">+{mockAnalytics.bookings.change}%</span>
                    <span className="text-gray-500 ml-1">vs yesterday</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{mockAnalytics.occupancy.current}%</div>
                      <div className="text-sm text-gray-600">Table Occupancy</div>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <Users className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-red-500">{mockAnalytics.occupancy.change}%</span>
                    <span className="text-gray-500 ml-1">vs target</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{restaurant.rating}</div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {restaurant.totalReviews} total reviews
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Bookings</h3>
                  <div className="space-y-4">
                    {bookings.filter(b => b.status === 'pending').slice(0, 3).map(booking => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{booking.guestName}</div>
                          <div className="text-sm text-gray-600">
                            {formatDate(booking.date)} at {formatTime(booking.time)} • {booking.partySize} guests
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleBookingAction(booking.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBookingAction(booking.id, 'declined')}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map(review => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{review.guestName}</div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{review.review}</p>
                        {!review.responded && (
                          <Badge variant="outline" className="text-xs">
                            Awaiting Response
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Management Section */}
          {activeSection === 'bookings' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Management</h2>
                <p className="text-gray-600">Manage incoming reservations and table availability.</p>
              </div>

              {/* Booking Status Tabs */}
              <div className="mb-6">
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  {['all', 'pending', 'confirmed', 'declined'].map((status) => (
                    <button
                      key={status}
                      className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors bg-white text-gray-900 shadow-sm"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)} 
                      {status !== 'all' && ` (${bookings.filter(b => b.status === status).length})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookings List */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">All Reservations</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {bookings.map(booking => (
                    <div key={booking.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <div>
                              <div className="font-semibold text-gray-900">{booking.guestName}</div>
                              <div className="text-sm text-gray-600">{booking.guestEmail}</div>
                            </div>
                            <Badge 
                              variant={
                                booking.status === 'confirmed' ? 'default' :
                                booking.status === 'pending' ? 'secondary' : 'destructive'
                              }
                            >
                              {booking.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                              <MapPin className="w-4 h-4 mr-1" />
                              {booking.tablePreference}
                            </div>
                          </div>

                          {booking.specialRequests && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium text-gray-700">Special Requests: </span>
                              <span className="text-gray-600">{booking.specialRequests}</span>
                            </div>
                          )}

                          {booking.specialOccasion && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                {booking.specialOccasion}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {booking.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              onClick={() => handleBookingAction(booking.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleBookingAction(booking.id, 'declined')}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        )}

                        {booking.status !== 'pending' && (
                          <div className="ml-4">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Menu Management Section */}
          {activeSection === 'menu' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Menu Management</h2>
                  <p className="text-gray-600">Add, edit, and organize your menu items.</p>
                </div>
                <Button onClick={() => setEditingMenuItem('new')}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Menu Item
                </Button>
              </div>

              {/* Menu Categories */}
              <div className="space-y-6">
                {['Appetizers', 'Main Courses', 'Desserts'].map(category => (
                  <div key={category} className="bg-white rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {menu.filter(item => item.category === category).map(item => (
                        <div key={item.id} className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="font-semibold text-gray-900">{item.name}</div>
                                <div className="font-bold text-green-600">${item.price}</div>
                                {item.popular && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    Popular
                                  </Badge>
                                )}
                                {!item.available && (
                                  <Badge variant="destructive" className="text-xs">
                                    Unavailable
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-gray-600 mb-2">{item.description}</p>
                              
                              <div className="flex flex-wrap gap-2 text-xs">
                                <div className="text-gray-500">
                                  <span className="font-medium">Ingredients: </span>
                                  {item.ingredients.join(', ')}
                                </div>
                              </div>
                              
                              {item.allergens.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {item.allergens.map(allergen => (
                                    <Badge key={allergen} variant="outline" className="text-xs text-orange-600">
                                      {allergen}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingMenuItem(item)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMenuItemUpdate(item.id, { available: !item.available })}
                                className={item.available ? 'text-red-600' : 'text-green-600'}
                              >
                                {item.available ? 'Disable' : 'Enable'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Management Section */}
          {activeSection === 'reviews' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
                <p className="text-gray-600">Manage and respond to customer feedback.</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="font-medium">{restaurant.rating}</span>
                        <span className="text-gray-500 ml-1">({restaurant.totalReviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {reviews.map(review => (
                    <div key={review.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="font-semibold text-gray-900">{review.guestName}</div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-sm text-gray-500">{formatDate(review.date)}</div>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{review.review}</p>
                          
                          {review.responded ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="default" className="text-xs">
                                  Restaurant Response
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700">{review.response}</p>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  const response = prompt("Enter your response to this review:")
                                  if (response) {
                                    handleReviewResponse(review.id, response)
                                  }
                                }}
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Respond
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
                <p className="text-gray-600">Track performance and discover trends in your business.</p>
              </div>

              {/* Revenue Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Booking Times</h3>
                  <div className="space-y-3">
                    {mockAnalytics.popularTimes.map((slot, index) => (
                      <div key={slot.time} className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-700">{slot.time}</div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(slot.bookings / 50) * 100}%` }}
                            />
                          </div>
                          <div className="text-sm text-gray-600 w-8">{slot.bookings}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Menu Items</h3>
                  <div className="space-y-4">
                    {mockAnalytics.popularItems.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.orders} orders</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600">${item.revenue.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Revenue Trends</h4>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-semibold">${mockAnalytics.revenue.month.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Week</span>
                      <span className="font-semibold">${mockAnalytics.revenue.week.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Today</span>
                      <span className="font-semibold">${mockAnalytics.revenue.today.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Customer Metrics</h4>
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Spend</span>
                      <span className="font-semibold">${mockAnalytics.averageSpend.current}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Table Turnover</span>
                      <span className="font-semibold">2.3x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupancy Rate</span>
                      <span className="font-semibold">{mockAnalytics.occupancy.current}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Performance</h4>
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Rating</span>
                      <span className="font-semibold">{restaurant.rating}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Reviews</span>
                      <span className="font-semibold">{restaurant.totalReviews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Rate</span>
                      <span className="font-semibold">85%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Special Offers Section */}
          {activeSection === 'offers' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Special Offers</h2>
                  <p className="text-gray-600">Create and manage promotional offers and discounts.</p>
                </div>
                <Button onClick={() => setNewOffer({})}>
                  <Plus className="w-4 h-4 mr-1" />
                  Create Offer
                </Button>
              </div>

              <div className="space-y-6">
                {offers.map(offer => (
                  <div key={offer.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
                          <Badge variant={offer.active ? 'default' : 'secondary'}>
                            {offer.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{offer.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Discount: </span>
                            <span className="text-gray-600">
                              {offer.type === 'percentage' ? `${offer.discount}%` : `$${offer.discount}`}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Category: </span>
                            <span className="text-gray-600">{offer.category}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Valid From: </span>
                            <span className="text-gray-600">{formatDate(offer.validFrom)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Valid To: </span>
                            <span className="text-gray-600">{formatDate(offer.validTo)}</span>
                          </div>
                        </div>
                        
                        {offer.conditions && (
                          <div className="mt-3">
                            <span className="font-medium text-gray-700">Conditions: </span>
                            <span className="text-gray-600">{offer.conditions}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOffers(prev => prev.map(o => 
                              o.id === offer.id ? { ...o, active: !o.active } : o
                            ))
                            toast({
                              title: offer.active ? "Offer Deactivated" : "Offer Activated",
                              description: `${offer.title} has been ${offer.active ? 'deactivated' : 'activated'}.`,
                            })
                          }}
                          className={offer.active ? 'text-red-600' : 'text-green-600'}
                        >
                          {offer.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Restaurant Profile Section */}
          {activeSection === 'profile' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Profile</h2>
                  <p className="text-gray-600">Manage your restaurant information and settings.</p>
                </div>
                <Button 
                  onClick={() => setEditingProfile(!editingProfile)}
                  variant={editingProfile ? "outline" : "default"}
                >
                  {editingProfile ? (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Restaurant Image */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Image</h3>
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {editingProfile && (
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-1" />
                      Change Image
                    </Button>
                  )}
                </div>

                {/* Basic Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                        {editingProfile ? (
                          <input
                            type="text"
                            value={restaurant.name}
                            onChange={(e) => setRestaurant(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-gray-900">{restaurant.name}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
                        {editingProfile ? (
                          <input
                            type="text"
                            value={restaurant.cuisine}
                            onChange={(e) => setRestaurant(prev => ({ ...prev, cuisine: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-gray-900">{restaurant.cuisine}</div>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        {editingProfile ? (
                          <textarea
                            value={restaurant.description}
                            onChange={(e) => setRestaurant(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-gray-900">{restaurant.description}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        {editingProfile ? (
                          <input
                            type="tel"
                            value={restaurant.phone}
                            onChange={(e) => setRestaurant(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="flex items-center text-gray-900">
                            <Phone className="w-4 h-4 mr-2" />
                            {restaurant.phone}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        {editingProfile ? (
                          <input
                            type="email"
                            value={restaurant.email}
                            onChange={(e) => setRestaurant(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="flex items-center text-gray-900">
                            <Mail className="w-4 h-4 mr-2" />
                            {restaurant.email}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        {editingProfile ? (
                          <input
                            type="url"
                            value={restaurant.website}
                            onChange={(e) => setRestaurant(prev => ({ ...prev, website: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="flex items-center text-gray-900">
                            <Globe className="w-4 h-4 mr-2" />
                            {restaurant.website}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        {editingProfile ? (
                          <input
                            type="text"
                            value={restaurant.address}
                            onChange={(e) => setRestaurant(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="flex items-center text-gray-900">
                            <MapPin className="w-4 h-4 mr-2" />
                            {restaurant.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h3>
                    <div className="space-y-3">
                      {Object.entries(restaurant.hours).map(([day, hours]) => (
                        <div key={day} className="flex items-center justify-between">
                          <div className="font-medium text-gray-700 capitalize">{day}</div>
                          <div className="text-gray-900">{hours}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {editingProfile && (
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => {
                          setEditingProfile(false)
                          toast({
                            title: "Profile Updated",
                            description: "Your restaurant profile has been successfully updated.",
                          })
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setEditingProfile(false)
                          setRestaurant(mockRestaurant)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}