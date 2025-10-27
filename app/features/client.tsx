'use client'

import { useState, useEffect } from 'react'
import { Clock, Users, QrCode, Receipt, ShoppingCart, Star, Share2, Plus, Minus, Check, X, MapPin, Calendar, User, UserPlus, Gift, Camera, Phone, Mail, MessageCircle, Heart, Zap, Award, Target, ChevronRight, ChevronDown, Bell, Search, Filter, Download, Upload, Smartphone, Wifi, CreditCard, Timer, AlertCircle, CheckCircle2, UserCheck, Utensils, Coffee } from 'lucide-react'

interface WaitListEntry {
  id: string
  restaurantName: string
  partySize: number
  estimatedWait: number
  position: number
  status: 'waiting' | 'ready' | 'expired'
  joinedAt: string
  restaurantId: string
}

interface PreOrder {
  id: string
  restaurantName: string
  items: PreOrderItem[]
  pickupTime: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed'
  total: number
  specialInstructions?: string
}

interface PreOrderItem {
  id: string
  name: string
  price: number
  quantity: number
  customizations: string[]
}

interface GroupOrder {
  id: string
  name: string
  restaurantName: string
  organizer: string
  participants: GroupOrderParticipant[]
  deadline: string
  status: 'collecting' | 'submitted' | 'confirmed'
  total: number
}

interface GroupOrderParticipant {
  name: string
  items: PreOrderItem[]
  total: number
  paid: boolean
}

interface BillSplit {
  items: BillItem[]
  people: Person[]
  tax: number
  tip: number
  total: number
}

interface BillItem {
  id: string
  name: string
  price: number
  assignedTo: string[]
}

interface Person {
  id: string
  name: string
  total: number
}

interface LoyaltyReward {
  id: string
  title: string
  description: string
  points: number
  category: 'discount' | 'free_item' | 'experience' | 'exclusive'
  available: boolean
  expiresAt?: string
}

interface SocialPost {
  id: string
  user: string
  restaurant: string
  rating: number
  photos: string[]
  caption: string
  timestamp: string
  likes: number
  liked: boolean
}

export default function FeaturesClient() {
  const [activeTab, setActiveTab] = useState('waitlist')
  
  // Wait List State
  const [waitListEntries, setWaitListEntries] = useState<WaitListEntry[]>([
    {
      id: '1',
      restaurantName: 'The Artisan Table',
      partySize: 4,
      estimatedWait: 25,
      position: 3,
      status: 'waiting',
      joinedAt: '2024-03-15T19:30:00',
      restaurantId: '1'
    },
    {
      id: '2',
      restaurantName: 'Sakura Sushi',
      partySize: 2,
      estimatedWait: 0,
      position: 0,
      status: 'ready',
      joinedAt: '2024-03-15T18:45:00',
      restaurantId: '2'
    }
  ])

  // Pre-Order State
  const [preOrders, setPreOrders] = useState<PreOrder[]>([
    {
      id: '1',
      restaurantName: 'Morning Brew Cafe',
      items: [
        { id: '1', name: 'Avocado Toast', price: 12.99, quantity: 1, customizations: ['Extra avocado', 'Gluten-free bread'] },
        { id: '2', name: 'Oat Milk Latte', price: 4.50, quantity: 2, customizations: ['Extra shot'] }
      ],
      pickupTime: '2024-03-16T08:30:00',
      status: 'confirmed',
      total: 21.99,
      specialInstructions: 'Please prepare gluten-free option carefully'
    }
  ])

  // Group Order State
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([
    {
      id: '1',
      name: 'Team Lunch Friday',
      restaurantName: 'Pizza Corner',
      organizer: 'Sarah Chen',
      participants: [
        { name: 'Sarah Chen', items: [{ id: '1', name: 'Margherita Pizza', price: 18.99, quantity: 1, customizations: [] }], total: 18.99, paid: true },
        { name: 'Mike Johnson', items: [{ id: '2', name: 'Pepperoni Pizza', price: 21.99, quantity: 1, customizations: ['Extra cheese'] }], total: 21.99, paid: false },
        { name: 'Emily Davis', items: [{ id: '3', name: 'Caesar Salad', price: 14.99, quantity: 1, customizations: [] }], total: 14.99, paid: true }
      ],
      deadline: '2024-03-16T11:00:00',
      status: 'collecting',
      total: 55.97
    }
  ])

  // Bill Split State
  const [currentBill, setCurrentBill] = useState<BillSplit>({
    items: [
      { id: '1', name: 'Grilled Salmon', price: 28.99, assignedTo: ['person1'] },
      { id: '2', name: 'Pasta Carbonara', price: 22.99, assignedTo: ['person2'] },
      { id: '3', name: 'Shared Appetizer', price: 16.99, assignedTo: ['person1', 'person2', 'person3'] },
      { id: '4', name: 'Wine Bottle', price: 45.99, assignedTo: ['person1', 'person2', 'person3'] }
    ],
    people: [
      { id: 'person1', name: 'Alex', total: 0 },
      { id: 'person2', name: 'Jordan', total: 0 },
      { id: 'person3', name: 'Taylor', total: 0 }
    ],
    tax: 12.50,
    tip: 18.00,
    total: 132.47
  })

  // Loyalty State
  const [loyaltyPoints, setLoyaltyPoints] = useState(2847)
  const [loyaltyTier, setLoyaltyTier] = useState('Platinum')
  const [loyaltyRewards] = useState<LoyaltyReward[]>([
    { id: '1', title: '20% Off Next Meal', description: 'Valid at any partner restaurant', points: 500, category: 'discount', available: true },
    { id: '2', title: 'Free Appetizer', description: 'Choose from selected appetizers', points: 750, category: 'free_item', available: true },
    { id: '3', title: 'Chef\'s Table Experience', description: 'Exclusive dining experience', points: 2000, category: 'experience', available: true },
    { id: '4', title: 'VIP Table Guarantee', description: 'Skip the wait at premium locations', points: 1500, category: 'exclusive', available: false, expiresAt: '2024-04-15' }
  ])

  // Social State
  const [socialPosts] = useState<SocialPost[]>([
    {
      id: '1',
      user: 'foodie_sarah',
      restaurant: 'The Artisan Table',
      rating: 5,
      photos: ['/api/placeholder/300/300'],
      caption: 'Amazing dinner tonight! The truffle pasta was incredible 🍝✨',
      timestamp: '2024-03-15T20:30:00',
      likes: 24,
      liked: false
    },
    {
      id: '2',
      user: 'mike_eats',
      restaurant: 'Sakura Sushi',
      rating: 4,
      photos: ['/api/placeholder/300/300', '/api/placeholder/300/300'],
      caption: 'Fresh sushi and great atmosphere. Definitely coming back! 🍣',
      timestamp: '2024-03-15T19:15:00',
      likes: 18,
      liked: true
    }
  ])

  // QR Check-in State
  const [qrCheckInHistory, setQrCheckInHistory] = useState([
    { id: '1', restaurant: 'The Artisan Table', timestamp: '2024-03-15T19:00:00', table: 'A7' },
    { id: '2', restaurant: 'Sakura Sushi', timestamp: '2024-03-14T18:30:00', table: 'S12' }
  ])

  const [showQRCode, setShowQRCode] = useState(false)

  // Calculate bill split totals
  useEffect(() => {
    const updatedPeople = currentBill.people.map(person => {
      let total = 0
      currentBill.items.forEach(item => {
        if (item.assignedTo.includes(person.id)) {
          total += item.price / item.assignedTo.length
        }
      })
      // Add proportional tax and tip
      const subtotal = currentBill.items.reduce((sum, item) => sum + item.price, 0)
      const proportion = total / subtotal
      total += (currentBill.tax + currentBill.tip) * proportion
      return { ...person, total }
    })
    setCurrentBill(prev => ({ ...prev, people: updatedPeople }))
  }, [currentBill.items, currentBill.tax, currentBill.tip])

  const joinWaitList = (restaurantName: string, partySize: number) => {
    const newEntry: WaitListEntry = {
      id: Date.now().toString(),
      restaurantName,
      partySize,
      estimatedWait: Math.floor(Math.random() * 45) + 15,
      position: Math.floor(Math.random() * 8) + 1,
      status: 'waiting',
      joinedAt: new Date().toISOString(),
      restaurantId: Date.now().toString()
    }
    setWaitListEntries(prev => [...prev, newEntry])
  }

  const leaveWaitList = (id: string) => {
    setWaitListEntries(prev => prev.filter(entry => entry.id !== id))
  }

  const confirmTable = (id: string) => {
    setWaitListEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, status: 'expired' as const } : entry
    ))
  }

  const redeemReward = (rewardId: string) => {
    const reward = loyaltyRewards.find(r => r.id === rewardId)
    if (reward && reward.available && loyaltyPoints >= reward.points) {
      setLoyaltyPoints(prev => prev - reward.points)
      alert(`Successfully redeemed: ${reward.title}`)
    }
  }

  const toggleLike = (postId: string) => {
    // In a real app, this would update the backend
    console.log(`Toggled like for post ${postId}`)
  }

  const tabs = [
    { id: 'waitlist', label: 'Wait List', icon: Clock },
    { id: 'preorder', label: 'Pre-Order', icon: ShoppingCart },
    { id: 'qrcheckin', label: 'QR Check-in', icon: QrCode },
    { id: 'billsplit', label: 'Split Bill', icon: Receipt },
    { id: 'grouporder', label: 'Group Order', icon: Users },
    { id: 'loyalty', label: 'Loyalty+', icon: Star },
    { id: 'social', label: 'Social', icon: Share2 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Features</h1>
          <p className="text-gray-600">Enhanced tools and features for the ultimate dining experience</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Wait List Tab */}
          {activeTab === 'waitlist' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Wait List Management</h2>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                  Join New Wait List
                </button>
              </div>

              <div className="grid gap-4">
                {waitListEntries.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{entry.restaurantName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>Party of {entry.partySize}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Joined {new Date(entry.joinedAt).toLocaleTimeString()}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {entry.status === 'ready' ? (
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                            Table Ready!
                          </div>
                        ) : (
                          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                            Position #{entry.position}
                          </div>
                        )}
                        {entry.status === 'waiting' && (
                          <p className="text-sm text-gray-600">Est. wait: {entry.estimatedWait} min</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      {entry.status === 'ready' ? (
                        <>
                          <button 
                            onClick={() => confirmTable(entry.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            Confirm Table
                          </button>
                          <button 
                            onClick={() => leaveWaitList(entry.id)}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => leaveWaitList(entry.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Leave Wait List
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {waitListEntries.length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Wait Lists</h3>
                    <p className="text-gray-600">Join a wait list at your favorite restaurants to skip the line!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pre-Order Tab */}
          {activeTab === 'preorder' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Pre-Orders</h2>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                  New Pre-Order
                </button>
              </div>

              <div className="grid gap-4">
                {preOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{order.restaurantName}</h3>
                        <p className="text-sm text-gray-600">
                          Pickup: {new Date(order.pickupTime).toLocaleDateString()} at {new Date(order.pickupTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                          order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                        <p className="text-lg font-bold text-gray-900 mt-1">${order.total.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="font-medium">{item.quantity}x {item.name}</span>
                            {item.customizations.length > 0 && (
                              <p className="text-gray-600 text-xs">+ {item.customizations.join(', ')}</p>
                            )}
                          </div>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {order.specialInstructions && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>Special Instructions:</strong> {order.specialInstructions}
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                        Track Order
                      </button>
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        Modify Order
                      </button>
                    </div>
                  </div>
                ))}

                {preOrders.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pre-Orders</h3>
                    <p className="text-gray-600">Order ahead and skip the wait! Perfect for busy schedules.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QR Check-in Tab */}
          {activeTab === 'qrcheckin' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">QR Check-in</h2>
                <button 
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  {showQRCode ? 'Hide QR Code' : 'Generate QR Code'}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* QR Code Generator */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Quick Check-in</h3>
                  
                  {showQRCode ? (
                    <div className="text-center">
                      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 mb-4 inline-block">
                        <QrCode className="w-32 h-32 text-gray-800 mx-auto" />
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Scan this QR code at the restaurant to check in instantly
                      </p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">
                          Code expires in: <span className="font-medium text-orange-600">14:32</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Generate a QR code for quick restaurant check-in</p>
                    </div>
                  )}
                </div>

                {/* Check-in History */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Recent Check-ins</h3>
                  <div className="space-y-3">
                    {qrCheckInHistory.map((checkin) => (
                      <div key={checkin.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900">{checkin.restaurant}</p>
                          <p className="text-sm text-gray-600">Table {checkin.table}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {new Date(checkin.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(checkin.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* How it Works */}
              <div className="mt-6 bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-blue-900 mb-4">How QR Check-in Works</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <Smartphone className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-blue-900 mb-1">1. Generate Code</h4>
                    <p className="text-sm text-blue-700">Create a unique QR code for your reservation</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <QrCode className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-blue-900 mb-1">2. Scan at Restaurant</h4>
                    <p className="text-sm text-blue-700">Show your code to the host for instant check-in</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-blue-900 mb-1">3. Seated Instantly</h4>
                    <p className="text-sm text-blue-700">Skip the check-in line and go straight to your table</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bill Split Tab */}
          {activeTab === 'billsplit' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Bill Splitter</h2>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                  New Bill Split
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Bill Items */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Bill Items</h3>
                  <div className="space-y-3">
                    {currentBill.items.map((item) => (
                      <div key={item.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{item.name}</span>
                          <span className="font-bold">${item.price.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentBill.people.map((person) => (
                            <button
                              key={person.id}
                              onClick={() => {
                                const newItems = currentBill.items.map(i => 
                                  i.id === item.id
                                    ? {
                                        ...i,
                                        assignedTo: i.assignedTo.includes(person.id)
                                          ? i.assignedTo.filter(id => id !== person.id)
                                          : [...i.assignedTo, person.id]
                                      }
                                    : i
                                )
                                setCurrentBill(prev => ({ ...prev, items: newItems }))
                              }}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                item.assignedTo.includes(person.id)
                                  ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                  : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              {person.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tax and Tip */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Tax</span>
                        <input
                          type="number"
                          value={currentBill.tax}
                          onChange={(e) => setCurrentBill(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                          className="w-20 text-right border border-gray-300 rounded px-2 py-1"
                          step="0.01"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Tip</span>
                        <input
                          type="number"
                          value={currentBill.tip}
                          onChange={(e) => setCurrentBill(prev => ({ ...prev, tip: parseFloat(e.target.value) || 0 }))}
                          className="w-20 text-right border border-gray-300 rounded px-2 py-1"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Split Results */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Split Results</h3>
                  <div className="space-y-4">
                    {currentBill.people.map((person) => (
                      <div key={person.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-lg">{person.name}</span>
                          <span className="font-bold text-xl text-orange-600">
                            ${person.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Items: ${(person.total - (currentBill.tax + currentBill.tip) * (person.total / currentBill.items.reduce((sum, item) => sum + item.price, 0))).toFixed(2)}</p>
                          <p>Tax & Tip: ${((currentBill.tax + currentBill.tip) * (person.total / currentBill.items.reduce((sum, item) => sum + item.price, 0))).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Bill</span>
                      <span>${currentBill.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <button className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                      Send Payment Requests
                    </button>
                    <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      Share Split Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Group Order Tab */}
          {activeTab === 'grouporder' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Group Orders</h2>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                  Start Group Order
                </button>
              </div>

              <div className="grid gap-4">
                {groupOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{order.name}</h3>
                        <p className="text-gray-600">{order.restaurantName}</p>
                        <p className="text-sm text-gray-500">Organized by {order.organizer}</p>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                          order.status === 'collecting' ? 'bg-orange-100 text-orange-800' :
                          order.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                        <p className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Order Deadline</span>
                        <span className="text-sm text-gray-600">
                          {new Date(order.deadline).toLocaleDateString()} at {new Date(order.deadline).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">3 hours remaining</p>
                    </div>

                    <div className="space-y-3 mb-4">
                      <h4 className="font-medium text-gray-900">Participants ({order.participants.length})</h4>
                      {order.participants.map((participant, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${participant.paid ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                            <span className="font-medium">{participant.name}</span>
                            <span className="text-sm text-gray-600">
                              ({participant.items.length} item{participant.items.length !== 1 ? 's' : ''})
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">${participant.total.toFixed(2)}</span>
                            {participant.paid && (
                              <span className="ml-2 text-xs text-green-600 font-medium">Paid</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      {order.status === 'collecting' && (
                        <>
                          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                            Add Your Order
                          </button>
                          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            Invite Friends
                          </button>
                        </>
                      )}
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}

                {groupOrders.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Group Orders</h3>
                    <p className="text-gray-600">Start a group order to coordinate dining with friends and colleagues!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loyalty Tab */}
          {activeTab === 'loyalty' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Loyalty Program</h2>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">{loyaltyPoints.toLocaleString()} pts</p>
                  <p className="text-sm text-gray-600">{loyaltyTier} Member</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Points Overview */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <Star className="w-8 h-8" />
                      <span className="text-sm font-medium bg-white bg-opacity-20 px-2 py-1 rounded">
                        {loyaltyTier}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-2">{loyaltyPoints.toLocaleString()}</h3>
                    <p className="text-orange-100 mb-4">Total Points</p>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress to Diamond</span>
                          <span>847/2000</span>
                        </div>
                        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                          <div className="bg-white h-2 rounded-full" style={{ width: '42%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Earning Rate</h4>
                      <p className="text-sm text-gray-600">1 point per $1 spent</p>
                      <p className="text-sm text-gray-600">2x points on weekends</p>
                      <p className="text-sm text-gray-600">3x points at partner restaurants</p>
                    </div>
                  </div>
                </div>

                {/* Available Rewards */}
                <div className="lg:col-span-2">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Available Rewards</h3>
                  <div className="grid gap-4">
                    {loyaltyRewards.map((reward) => (
                      <div key={reward.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{reward.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                reward.category === 'discount' ? 'bg-green-100 text-green-800' :
                                reward.category === 'free_item' ? 'bg-blue-100 text-blue-800' :
                                reward.category === 'experience' ? 'bg-purple-100 text-purple-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {reward.category.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{reward.description}</p>
                            {reward.expiresAt && (
                              <p className="text-xs text-red-600">
                                Expires: {new Date(reward.expiresAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-lg text-orange-600">{reward.points} pts</p>
                            <button
                              onClick={() => redeemReward(reward.id)}
                              disabled={!reward.available || loyaltyPoints < reward.points}
                              className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                reward.available && loyaltyPoints >= reward.points
                                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {!reward.available ? 'Unavailable' : 
                               loyaltyPoints < reward.points ? 'Not Enough Points' : 'Redeem'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-gray-900">Dinner at The Artisan Table</p>
                      <p className="text-sm text-gray-600">March 15, 2024</p>
                    </div>
                    <span className="text-green-600 font-medium">+125 pts</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-gray-900">Weekend Bonus</p>
                      <p className="text-sm text-gray-600">March 15, 2024</p>
                    </div>
                    <span className="text-green-600 font-medium">+62 pts</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-gray-900">Redeemed: Free Appetizer</p>
                      <p className="text-sm text-gray-600">March 14, 2024</p>
                    </div>
                    <span className="text-red-600 font-medium">-750 pts</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Social Feed</h2>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                  Share Your Experience
                </button>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Social Feed */}
                <div className="lg:col-span-2 space-y-6">
                  {socialPosts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">@{post.user}</p>
                          <p className="text-sm text-gray-600">at {post.restaurant}</p>
                        </div>
                        <div className="ml-auto flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < post.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-gray-900 mb-4">{post.caption}</p>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {post.photos.map((photo, index) => (
                          <img 
                            key={index}
                            src={photo} 
                            alt={`Food photo ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => toggleLike(post.id)}
                            className={`flex items-center space-x-1 hover:text-red-600 transition-colors ${
                              post.liked ? 'text-red-600' : ''
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Social Features Sidebar */}
                <div className="space-y-6">
                  {/* Friends Activity */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Friends Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Sarah visited Sakura Sushi</p>
                          <p className="text-xs text-gray-600">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Mike saved Pasta Palace</p>
                          <p className="text-xs text-gray-600">5 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trending Restaurants */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Trending Restaurants</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">The Artisan Table</p>
                          <p className="text-xs text-gray-600">127 check-ins today</p>
                        </div>
                        <div className="text-orange-600">
                          <Zap className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Ocean Breeze</p>
                          <p className="text-xs text-gray-600">89 check-ins today</p>
                        </div>
                        <div className="text-orange-600">
                          <Zap className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Award className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Foodie Explorer</p>
                          <p className="text-xs text-gray-600">Visited 10 restaurants</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Target className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Weekend Warrior</p>
                          <p className="text-xs text-gray-600">5 weekend bookings</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}