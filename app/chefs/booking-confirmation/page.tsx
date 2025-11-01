'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Calendar, Clock, MapPin, Users, DollarSign, Phone, Mail, ChefHat } from 'lucide-react'

export default function BookingConfirmationPage() {
  const router = useRouter()
  const [bookingDetails, setBookingDetails] = useState({
    chefName: "Chef Adebayo Okafor",
    eventType: "Birthday Party",
    eventDate: "2024-12-15",
    startTime: "18:00",
    endTime: "22:00",
    location: "Victoria Island, Lagos",
    partySize: 25,
    totalAmount: 120000,
    depositAmount: 36000,
    specialRequests: "No seafood, vegetarian options needed"
  })

  const handlePayment = () => {
    alert('🎉 Demo: Booking Confirmed!\n\nPayment processed successfully. Chef will receive booking details and confirm availability within 2 hours.\n\nBooking ID: CHEF-BOOK-2024-001')
    router.push('/dashboard')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <ChefHat className="mr-3 w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chef Warehouse</h1>
              <p className="text-gray-600">Booking Confirmation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="bg-green-50 border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">
                🚀 Demo Booking Confirmation
              </p>
              <p className="text-xs text-green-700">
                This demonstrates the complete chef booking flow from search to confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success Message */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">Booking Request Sent!</h2>
                  <p className="text-gray-600">Your chef will respond within 2 hours</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Chef {bookingDetails.chefName} will review your booking request</li>
                  <li>• You'll receive an email confirmation with payment details</li>
                  <li>• Complete payment to secure your booking (30% deposit required)</li>
                  <li>• Chef will contact you to finalize menu and special requirements</li>
                </ul>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chef
                  </label>
                  <p className="text-gray-900 font-semibold">{bookingDetails.chefName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <p className="text-gray-900">{bookingDetails.eventType}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(bookingDetails.eventDate).toLocaleDateString('en-NG', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {bookingDetails.startTime} - {bookingDetails.endTime}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {bookingDetails.location}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party Size
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {bookingDetails.partySize} guests
                  </p>
                </div>
              </div>
              
              {bookingDetails.specialRequests && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <p className="text-gray-900 bg-gray-50 rounded-lg p-3">
                    {bookingDetails.specialRequests}
                  </p>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    +234 801 234 5678
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    your.email@example.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-semibold">{formatCurrency(bookingDetails.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deposit (30%)</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(bookingDetails.depositAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Balance Due</span>
                  <span className="font-semibold">
                    {formatCurrency(bookingDetails.totalAmount - bookingDetails.depositAmount)}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="text-sm text-gray-600 mb-2">Payment Terms</div>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• 30% deposit required to confirm booking</li>
                  <li>• Remaining balance due 24 hours before event</li>
                  <li>• Free cancellation up to 7 days before event</li>
                  <li>• 50% refund for cancellations 3-7 days before</li>
                </ul>
              </div>
              
              <button
                onClick={handlePayment}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
              >
                Complete Payment
              </button>
              
              <button
                onClick={() => router.push('/chefs')}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Book Different Chef
              </button>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    📞 Call: +234 700 CHEF HELP
                  </p>
                  <p className="text-gray-600">
                    💬 Chat: Available 24/7
                  </p>
                  <p className="text-gray-600">
                    ✉️ Email: support@chefware.ng
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}