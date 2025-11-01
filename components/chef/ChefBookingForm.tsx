'use client'

import { useState } from 'react'
import { Calendar, Clock, Users, MapPin, Utensils, DollarSign, CreditCard, X } from 'lucide-react'

interface BookingFormProps {
  chef: any
  onClose: () => void
  onSuccess: () => void
}

const EVENT_TYPES = [
  { value: 'PRIVATE_DINING', label: 'Private Dining' },
  { value: 'BIRTHDAY_PARTY', label: 'Birthday Party' },
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'CORPORATE_EVENT', label: 'Corporate Event' },
  { value: 'COOKING_CLASS', label: 'Cooking Class' },
  { value: 'MEAL_PREP', label: 'Meal Preparation' },
  { value: 'HOLIDAY_DINNER', label: 'Holiday Dinner' },
  { value: 'ANNIVERSARY', label: 'Anniversary' },
]

const SERVICE_TYPES = [
  { value: 'ON_SITE_COOKING', label: 'On-Site Cooking' },
  { value: 'MEAL_DELIVERY', label: 'Meal Delivery' },
  { value: 'COOKING_CLASS', label: 'Cooking Class' },
  { value: 'CONSULTATION', label: 'Consultation' },
]

export function ChefBookingForm({ chef, onClose, onSuccess }: BookingFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    eventType: '',
    serviceType: 'ON_SITE_COOKING',
    eventDate: '',
    startTime: '18:00',
    endTime: '22:00',
    partySize: 10,
    eventAddress: '',
    eventCity: chef.city,
    eventState: chef.state,
    eventZipCode: '',
    cuisinePreference: [] as string[],
    menuDetails: '',
    dietaryRestrictions: [] as string[],
    allergies: '',
    specialRequests: '',
    equipmentProvided: true,
    servingStyle: 'plated',
  })

  const calculateDuration = () => {
    const start = new Date(`2000-01-01 ${formData.startTime}`)
    const end = new Date(`2000-01-01 ${formData.endTime}`)
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  }

  const calculatePricing = () => {
    const duration = calculateDuration()
    const basePrice = Number(chef.hourlyRate) * duration
    const platformFee = basePrice * 0.12
    const totalAmount = basePrice + platformFee
    const depositAmount = totalAmount * 0.3

    return {
      duration,
      basePrice,
      platformFee,
      totalAmount,
      depositAmount,
      remainingAmount: totalAmount - depositAmount,
    }
  }

  const pricing = calculatePricing()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // TODO: Get customer ID from session
      const customerId = 'current-user-id'

      const bookingData = {
        ...formData,
        customerId,
        chefId: chef.id,
        durationHours: pricing.duration,
        basePrice: pricing.basePrice,
        platformFee: pricing.platformFee,
        totalAmount: pricing.totalAmount,
        depositAmount: pricing.depositAmount,
      }

      const response = await fetch('/api/chefs/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()

      if (data.success) {
        // TODO: Initiate payment flow
        onSuccess()
      } else {
        alert('Failed to create booking: ' + data.error)
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const handleCuisineToggle = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisinePreference: prev.cuisinePreference.includes(cuisine)
        ? prev.cuisinePreference.filter(c => c !== cuisine)
        : [...prev.cuisinePreference, cuisine]
    }))
  }

  const handleDietaryToggle = (restriction: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Book {chef.businessName}</h2>
            <p className="text-sm text-gray-600 mt-1">Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full ${
                  s <= step ? 'bg-orange-600' : 'bg-gray-200'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Step 1: Event Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select event type</option>
                    {EVENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {SERVICE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    value={formData.partySize}
                    onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) })}
                    min={chef.minPartySize}
                    max={chef.maxPartySize}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Min: {chef.minPartySize}, Max: {chef.maxPartySize}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Duration:</span>
                  <span className="font-semibold">{pricing.duration.toFixed(1)} hours</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location & Preferences */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Address *
                </label>
                <input
                  type="text"
                  value={formData.eventAddress}
                  onChange={(e) => setFormData({ ...formData, eventAddress: e.target.value })}
                  placeholder="Street address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.eventCity}
                    onChange={(e) => setFormData({ ...formData, eventCity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.eventState}
                    onChange={(e) => setFormData({ ...formData, eventState: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={formData.eventZipCode}
                    onChange={(e) => setFormData({ ...formData, eventZipCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {chef.specialties.map((specialty: string) => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => handleCuisineToggle(specialty)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        formData.cuisinePreference.includes(specialty)
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menu Details / Special Requests
                </label>
                <textarea
                  value={formData.menuDetails}
                  onChange={(e) => setFormData({ ...formData, menuDetails: e.target.value })}
                  rows={4}
                  placeholder="Describe your menu preferences, dishes you'd like, or any special requests..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Restrictions
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Halal', 'Kosher'].map((restriction) => (
                    <button
                      key={restriction}
                      type="button"
                      onClick={() => handleDietaryToggle(restriction)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        formData.dietaryRestrictions.includes(restriction)
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {restriction}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies (if any)
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="List any food allergies"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.equipmentProvided}
                    onChange={(e) => setFormData({ ...formData, equipmentProvided: e.target.checked })}
                    className="rounded text-orange-600"
                  />
                  <span className="text-sm text-gray-700">Kitchen equipment available at venue</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Review & Payment */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event Type:</span>
                    <span className="font-medium">{EVENT_TYPES.find(t => t.value === formData.eventType)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(formData.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{formData.startTime} - {formData.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{formData.partySize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{formData.eventCity}, {formData.eventState}</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Pricing Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price ({pricing.duration.toFixed(1)} hrs × {formatCurrency(Number(chef.hourlyRate))})</span>
                    <span>{formatCurrency(pricing.basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee (12%)</span>
                    <span>{formatCurrency(pricing.platformFee)}</span>
                  </div>
                  <div className="border-t border-orange-200 my-2"></div>
                  <div className="flex justify-between font-bold text-base">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(pricing.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-orange-700 font-semibold">
                    <span>Deposit Required (30%):</span>
                    <span>{formatCurrency(pricing.depositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Balance Due on Event Day:</span>
                    <span>{formatCurrency(pricing.remainingAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> A 30% deposit is required to confirm your booking. The remaining balance will be collected on the event day. Your deposit is refundable according to the chef's cancellation policy.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <button
            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
            disabled={loading || (step === 1 && (!formData.eventType || !formData.eventDate))}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : step === 3 ? (
              <>
                <CreditCard className="w-4 h-4" />
                Pay Deposit {formatCurrency(pricing.depositAmount)}
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
