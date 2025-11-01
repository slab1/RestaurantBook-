'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Star, MapPin, Clock, Award, CheckCircle, Calendar,
  Users, Utensils, DollarSign, Phone, Mail, ChevronLeft,
  Heart, ChefHat, MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { mockChefs } from '@/lib/chef-demo-data'

interface MockChef extends Chef {
  portfolio: ChefPortfolio[]
  reviews: ChefReview[]
}

export default function ChefDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [chef, setChef] = useState<MockChef | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchChefDetails()
    }
  }, [params.id])

  const fetchChefDetails = () => {
    setLoading(true)
    
    // Simulate loading delay
    setTimeout(() => {
      const foundChef = mockChefs.find(c => c.id === params.id)
      if (foundChef) {
        // Add mock portfolio and reviews
        const mockChef = {
          ...foundChef,
          portfolio: [
            {
              id: "portfolio-1",
              chefId: foundChef.id,
              title: "Elegant Wedding Catering",
              description: "Beautiful wedding reception with traditional and modern fusion cuisine",
              imageUrls: ["/imgs/wedding-catering-1.jpg", "/imgs/wedding-catering-2.jpg"],
              eventType: "Wedding",
              date: "2024-10-15"
            },
            {
              id: "portfolio-2", 
              chefId: foundChef.id,
              title: "Corporate Event Excellence",
              description: "Professional business lunch for 100+ executives",
              imageUrls: ["/imgs/corporate-catering-1.jpg"],
              eventType: "Corporate",
              date: "2024-09-22"
            },
            {
              id: "portfolio-3",
              chefId: foundChef.id,
              title: "Birthday Celebration",
              description: "Intimate family birthday party with custom menu",
              imageUrls: ["/imgs/birthday-party-1.jpg"],
              eventType: "Birthday",
              date: "2024-08-10"
            }
          ],
          reviews: [
            {
              id: "review-1",
              chefId: foundChef.id,
              customerName: "Sarah Johnson",
              rating: 5,
              review: "Absolutely amazing! The food was incredible and the service was professional. Our wedding guests couldn't stop talking about the amazing dishes. Highly recommend!",
              date: "2024-10-20",
              eventType: "Wedding"
            },
            {
              id: "review-2",
              chefId: foundChef.id,
              customerName: "Michael Chen",
              rating: 5,
              review: "Professional service and delicious food. Chef was punctual, courteous, and the menu exceeded our expectations. Will definitely book again!",
              date: "2024-09-25",
              eventType: "Corporate"
            },
            {
              id: "review-3",
              chefId: foundChef.id,
              customerName: "Aisha Mohammed",
              rating: 4,
              review: "Great experience overall. The food was tasty and well-presented. Service was good but could have been a bit faster. Still highly recommended!",
              date: "2024-08-15",
              eventType: "Birthday"
            },
            {
              id: "review-4",
              chefId: foundChef.id,
              customerName: "David Wilson",
              rating: 5,
              review: "Outstanding! The chef created a custom menu that perfectly matched our preferences. Every dish was restaurant-quality. Excellent communication throughout.",
              date: "2024-07-30",
              eventType: "Anniversary"
            }
          ]
        }
        setChef(mockChef)
      }
      setLoading(false)
    }, 1000)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const calculateEventPrice = (baseRate: number, eventType: string, partySize: number) => {
    const eventMultipliers: { [key: string]: number } = {
      "Birthday Party": 1.0,
      "Wedding": 2.0,
      "Corporate Event": 1.5,
      "Anniversary": 1.2,
      "Private Dining": 1.8,
      "Cooking Class": 0.8
    }
    
    const multiplier = eventMultipliers[eventType] || 1.0
    const partyMultiplier = partySize > 20 ? 1.5 : partySize > 10 ? 1.2 : 1.0
    const basePrice = baseRate * 4 // 4 hours minimum
    
    return Math.round(basePrice * multiplier * partyMultiplier)
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chef details...</p>
        </div>
      </div>
    )
  }

  if (!chef) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chef Not Found</h2>
          <p className="text-gray-600 mb-4">The chef you're looking for doesn't exist.</p>
          <Link href="/chefs" className="text-blue-600 hover:text-blue-700">
            Back to Chef Listings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/chefs"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Chefs
          </Link>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="bg-blue-100 border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <p className="text-center text-sm text-blue-800">
            🚀 <strong>Demo Mode:</strong> This is a working demonstration of the Chef Warehouse System
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chef Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <ChefHat className="w-16 h-16 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {chef.name}
                      </h1>
                      <p className="text-lg text-gray-600 mb-4">
                        Professional Chef • {chef.experience} Years Experience
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {chef.isVerified && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Verified
                        </div>
                      )}
                      {chef.isFeatured && (
                        <div className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          Featured
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-bold text-gray-900">{chef.rating}</span>
                      <span className="text-gray-500">({chef.totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span>{chef.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5" />
                      <span>{chef.experience} years exp.</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {chef.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About Chef {chef.name}</h2>
              <p className="text-gray-700 leading-relaxed">{chef.bio}</p>
            </div>

            {/* Certifications */}
            {chef.certifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Certifications & Training</h2>
                <ul className="space-y-2">
                  {chef.certifications.map((cert, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Portfolio */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio & Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chef.portfolio.map((item) => (
                  <div key={item.id} className="rounded-lg overflow-hidden shadow-md border">
                    <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <Utensils className="w-12 h-12 text-white" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded-full">{item.eventType}</span>
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Reviews ({chef.reviews.length})
              </h2>
              <div className="space-y-4">
                {chef.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {review.customerName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {review.eventType}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.review}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="text-sm text-gray-600 mb-1">Starting from</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {formatCurrency(chef.hourlyRate)}
                  <span className="text-lg text-gray-600 font-normal">/hour</span>
                </div>
                <div className="text-sm text-gray-600">
                  Minimum 4 hours • Travel: {chef.travelRadius}km radius
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">
                    Recommended for 5-50 guests
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">
                    Available in {chef.location} area
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">
                    Responds within 2 hours
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
              >
                Book This Chef
              </button>

              <div className="flex gap-2">
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Call
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Specialties</h3>
                <div className="space-y-2">
                  {chef.specialties.map((specialty, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {specialty}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {chef.languages.map((language, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Booking Form Modal */}
      {showBookingForm && chef && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Book Chef {chef.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option>Birthday Party</option>
                  <option>Wedding</option>
                  <option>Corporate Event</option>
                  <option>Anniversary</option>
                  <option>Private Dining</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party Size
                  </label>
                  <input 
                    type="number" 
                    placeholder="10"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours
                  </label>
                  <input 
                    type="number" 
                    placeholder="4"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date
                </label>
                <input 
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea 
                  placeholder="Any special dietary requirements or preferences..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-600 mb-1">Estimated Cost</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(calculateEventPrice(chef.hourlyRate, "Birthday Party", 10))}
                </div>
                <div className="text-xs text-gray-500">Based on 10 people, 4 hours</div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBookingForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBookingForm(false)
                  alert('🎉 Demo Booking Request Sent!\n\nYour booking request has been submitted. Chef will respond within 2 hours.')
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}