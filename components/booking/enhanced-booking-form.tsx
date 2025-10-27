'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Calendar, Clock, Users, Phone, Mail, MessageSquare, MapPin, CreditCard, Gift, Crown, Coffee, Building, TreePine, AlertTriangle, CheckCircle, XCircle, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface EnhancedBookingFormProps {
  restaurantName: string
  restaurantId: string
  onSubmit: (bookingData: EnhancedBookingFormData) => Promise<void>
  onCancel: () => void
}

export interface EnhancedBookingFormData {
  date: string
  time: string
  partySize: number
  guestName: string
  guestEmail: string
  guestPhone: string
  specialRequests?: string
  notifications: boolean
  tablePreference: 'any' | 'window' | 'outdoor' | 'indoor' | 'quiet' | 'bar'
  specialOccasion?: 'none' | 'birthday' | 'anniversary' | 'business' | 'celebration' | 'date'
  occasionDetails?: string
  depositRequired?: boolean
  depositAmount?: number
  agreedToPolicy: boolean
  specialDietary?: string
  accessibilityNeeds?: string
}

interface TimeSlotStatus {
  time: string
  available: boolean
  limited: boolean
  waitlist: boolean
}

interface DateAvailability {
  date: string
  available: boolean
  timeSlots: TimeSlotStatus[]
  isFullyBooked: boolean
  hasLimitedAvailability: boolean
}

// Mock availability data - in real app this would come from API
const generateMockAvailability = (restaurantId: string): DateAvailability[] => {
  const availability: DateAvailability[] = []
  const today = new Date()
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    
    // Generate realistic availability patterns
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isFullyBooked = Math.random() < (isWeekend ? 0.3 : 0.15)
    
    const timeSlots: TimeSlotStatus[] = [
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
      '14:00', '14:30', '17:00', '17:30', '18:00', '18:30',
      '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
    ].map(time => {
      const hour = parseInt(time.split(':')[0])
      const isPeakTime = (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)
      
      if (isFullyBooked) {
        return {
          time,
          available: false,
          limited: false,
          waitlist: Math.random() < 0.7
        }
      }
      
      const availability = Math.random()
      if (isPeakTime) {
        return {
          time,
          available: availability > 0.4,
          limited: availability > 0.2 && availability <= 0.4,
          waitlist: availability <= 0.2
        }
      } else {
        return {
          time,
          available: availability > 0.2,
          limited: availability > 0.1 && availability <= 0.2,
          waitlist: availability <= 0.1
        }
      }
    })
    
    availability.push({
      date: dateStr,
      available: !isFullyBooked,
      timeSlots,
      isFullyBooked,
      hasLimitedAvailability: timeSlots.some(slot => slot.limited)
    })
  }
  
  return availability
}

export function EnhancedBookingForm({ 
  restaurantName, 
  restaurantId,
  onSubmit, 
  onCancel 
}: EnhancedBookingFormProps) {
  const [currentStep, setCurrentStep] = useState<'calendar' | 'details' | 'payment' | 'confirmation'>('calendar')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availability, setAvailability] = useState<DateAvailability[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  
  const [formData, setFormData] = useState<EnhancedBookingFormData>({
    date: '',
    time: '',
    partySize: 2,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',
    notifications: true,
    tablePreference: 'any',
    specialOccasion: 'none',
    occasionDetails: '',
    depositRequired: false,
    depositAmount: 0,
    agreedToPolicy: false,
    specialDietary: '',
    accessibilityNeeds: ''
  })

  const { toast } = useToast()

  useEffect(() => {
    // Load availability data
    setAvailability(generateMockAvailability(restaurantId))
  }, [restaurantId])

  // Calculate deposit requirement
  const depositRequired = useMemo(() => {
    return formData.partySize >= 8 || formData.specialOccasion !== 'none'
  }, [formData.partySize, formData.specialOccasion])

  const depositAmount = useMemo(() => {
    if (!depositRequired) return 0
    if (formData.partySize >= 12) return 200
    if (formData.partySize >= 8) return 100
    if (formData.specialOccasion !== 'none') return 50
    return 0
  }, [depositRequired, formData.partySize, formData.specialOccasion])

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      depositRequired,
      depositAmount
    }))
  }, [depositRequired, depositAmount])

  const handleInputChange = (field: keyof EnhancedBookingFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const selectedDateAvailability = useMemo(() => {
    return availability.find(a => a.date === formData.date)
  }, [availability, formData.date])

  const availableTimeSlots = useMemo(() => {
    if (!selectedDateAvailability) return []
    return selectedDateAvailability.timeSlots.filter(slot => slot.available || slot.limited)
  }, [selectedDateAvailability])

  const handleDateSelect = (date: string) => {
    handleInputChange('date', date)
    handleInputChange('time', '') // Reset time when date changes
    if (currentStep === 'calendar') {
      setCurrentStep('details')
    }
  }

  const handleTimeSelect = (time: string) => {
    handleInputChange('time', time)
  }

  const canProceedToPayment = () => {
    return formData.date && formData.time && formData.guestName && 
           formData.guestEmail && formData.guestPhone && formData.agreedToPolicy
  }

  const handleNext = () => {
    if (currentStep === 'details' && canProceedToPayment()) {
      if (depositRequired) {
        setCurrentStep('payment')
      } else {
        handleSubmit()
      }
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setCurrentStep('confirmation')
      
      toast({
        title: 'Booking Confirmed!',
        description: `Your table at ${restaurantName} has been successfully booked.`,
      })
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: 'Please check your information and try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCalendar = () => {
    const today = new Date()
    const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
    const lastDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    const startingDayOfWeek = firstDayOfMonth.getDay()

    const calendarDays = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="p-2"></div>)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day)
      const dateStr = date.toISOString().split('T')[0]
      const dayAvailability = availability.find(a => a.date === dateStr)
      const isToday = date.toDateString() === today.toDateString()
      const isPast = date < today
      const isSelected = formData.date === dateStr

      let dayClass = "p-2 text-center cursor-pointer rounded-lg transition-colors min-h-[40px] flex items-center justify-center relative "
      let dayContent = day.toString()
      let indicator = null

      if (isPast) {
        dayClass += "text-gray-300 cursor-not-allowed"
      } else if (isSelected) {
        dayClass += "bg-blue-500 text-white font-semibold"
      } else if (dayAvailability?.isFullyBooked) {
        dayClass += "bg-red-100 text-red-600 cursor-not-allowed"
        indicator = <XCircle className="h-3 w-3 absolute top-0 right-0" />
      } else if (dayAvailability?.hasLimitedAvailability) {
        dayClass += "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
        indicator = <AlertTriangle className="h-3 w-3 absolute top-0 right-0" />
      } else if (dayAvailability?.available) {
        dayClass += "bg-green-100 text-green-700 hover:bg-green-200"
        indicator = <CheckCircle className="h-3 w-3 absolute top-0 right-0" />
      } else {
        dayClass += "text-gray-400 hover:bg-gray-100"
      }

      if (isToday) {
        dayClass += " ring-2 ring-blue-300"
      }

      calendarDays.push(
        <div
          key={day}
          className={dayClass}
          onClick={() => {
            if (!isPast && dayAvailability?.available && !dayAvailability.isFullyBooked) {
              handleDateSelect(dateStr)
            }
          }}
        >
          {dayContent}
          {indicator}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
          >
            ←
          </Button>
          <h3 className="text-lg font-semibold">
            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
          >
            →
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-600 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 font-medium">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDays}
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-yellow-600" />
            <span>Limited</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-600" />
            <span>Fully Booked</span>
          </div>
        </div>
      </div>
    )
  }

  const renderTimeSlots = () => {
    if (!selectedDateAvailability) return null

    return (
      <div className="space-y-4">
        <h4 className="font-medium">Available Times for {formData.date}</h4>
        <div className="grid grid-cols-3 gap-2">
          {selectedDateAvailability.timeSlots.map((slot) => {
            const isSelected = formData.time === slot.time
            let buttonClass = "h-12 text-sm relative "
            let variant: "default" | "outline" | "secondary" = "outline"
            
            if (slot.available) {
              if (isSelected) {
                variant = "default"
                buttonClass += "ring-2 ring-blue-300"
              } else {
                variant = "outline"
                buttonClass += "hover:bg-green-50 border-green-200"
              }
            } else if (slot.limited) {
              if (isSelected) {
                variant = "default"
                buttonClass += "bg-yellow-500 hover:bg-yellow-600"
              } else {
                variant = "secondary"
                buttonClass += "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              }
            } else {
              buttonClass += "opacity-50 cursor-not-allowed"
              variant = "outline"
            }

            return (
              <Button
                key={slot.time}
                type="button"
                variant={variant}
                className={buttonClass}
                disabled={!slot.available && !slot.limited}
                onClick={() => slot.available || slot.limited ? handleTimeSelect(slot.time) : null}
              >
                <div className="text-center">
                  <div>{slot.time}</div>
                  {slot.limited && (
                    <div className="text-xs text-yellow-600">Limited</div>
                  )}
                  {slot.waitlist && (
                    <div className="text-xs text-red-600">Waitlist</div>
                  )}
                </div>
              </Button>
            )
          })}
        </div>
        
        {formData.partySize >= 8 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Crown className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Large Party Booking</p>
                <p className="text-blue-700">For parties of 8 or more, we recommend calling directly for the best experience and table arrangements.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            Book at {restaurantName}
          </CardTitle>
          <div className="flex justify-center space-x-2">
            {['calendar', 'details', 'payment', 'confirmation'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step ? 'bg-blue-500 text-white' : 
                  ['calendar', 'details', 'payment', 'confirmation'].indexOf(currentStep) > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && <div className={`w-8 h-0.5 ${
                  ['calendar', 'details', 'payment', 'confirmation'].indexOf(currentStep) > index ? 'bg-green-500' : 'bg-gray-200'
                }`} />}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {currentStep === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Date & Time</h3>
                  {renderCalendar()}
                </div>
                
                {formData.date && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    {renderTimeSlots()}
                  </motion.div>
                )}
              </motion.div>
            )}

            {currentStep === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold">Booking Details</h3>
                
                {/* Booking Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Booking Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                    <div>Date: {formData.date}</div>
                    <div>Time: {formData.time}</div>
                    <div>Party Size: {formData.partySize}</div>
                    <div>Restaurant: {restaurantName}</div>
                  </div>
                </div>

                {/* Party Size */}
                <div className="space-y-2">
                  <Label htmlFor="partySize" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Party Size
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange('partySize', Math.max(1, formData.partySize - 1))}
                      className="h-10 w-10 p-0"
                    >
                      -
                    </Button>
                    <Input
                      id="partySize"
                      type="number"
                      min="1"
                      max="20"
                      required
                      value={formData.partySize}
                      onChange={(e) => handleInputChange('partySize', parseInt(e.target.value) || 1)}
                      className="text-center flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange('partySize', Math.min(20, formData.partySize + 1))}
                      className="h-10 w-10 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Table Preference */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Table Preference
                  </Label>
                  <Select value={formData.tablePreference} onValueChange={(value) => handleInputChange('tablePreference', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any table" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Any table
                        </div>
                      </SelectItem>
                      <SelectItem value="window">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Window seat
                        </div>
                      </SelectItem>
                      <SelectItem value="outdoor">
                        <div className="flex items-center gap-2">
                          <TreePine className="h-4 w-4" />
                          Outdoor seating
                        </div>
                      </SelectItem>
                      <SelectItem value="indoor">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Indoor seating
                        </div>
                      </SelectItem>
                      <SelectItem value="quiet">
                        <div className="flex items-center gap-2">
                          <Coffee className="h-4 w-4" />
                          Quiet area
                        </div>
                      </SelectItem>
                      <SelectItem value="bar">
                        <div className="flex items-center gap-2">
                          <Coffee className="h-4 w-4" />
                          Bar seating
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Special Occasion */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    Special Occasion
                  </Label>
                  <Select value={formData.specialOccasion} onValueChange={(value) => handleInputChange('specialOccasion', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="birthday">🎂 Birthday</SelectItem>
                      <SelectItem value="anniversary">💕 Anniversary</SelectItem>
                      <SelectItem value="business">💼 Business Dinner</SelectItem>
                      <SelectItem value="celebration">🎉 Celebration</SelectItem>
                      <SelectItem value="date">❤️ Date Night</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {formData.specialOccasion !== 'none' && (
                    <Input
                      placeholder="Tell us more about your special occasion..."
                      value={formData.occasionDetails}
                      onChange={(e) => handleInputChange('occasionDetails', e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Guest Information */}
                <Separator />
                <h4 className="font-medium">Guest Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guestName" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Full Name *
                    </Label>
                    <Input
                      id="guestName"
                      type="text"
                      required
                      value={formData.guestName}
                      onChange={(e) => handleInputChange('guestName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guestPhone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone *
                    </Label>
                    <Input
                      id="guestPhone"
                      type="tel"
                      required
                      value={formData.guestPhone}
                      onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestEmail" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    required
                    value={formData.guestEmail}
                    onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                {/* Dietary Requirements */}
                <div className="space-y-2">
                  <Label htmlFor="specialDietary">
                    Special Dietary Requirements
                  </Label>
                  <Input
                    id="specialDietary"
                    value={formData.specialDietary}
                    onChange={(e) => handleInputChange('specialDietary', e.target.value)}
                    placeholder="Allergies, vegetarian, vegan, etc."
                  />
                </div>

                {/* Accessibility */}
                <div className="space-y-2">
                  <Label htmlFor="accessibilityNeeds">
                    Accessibility Requirements
                  </Label>
                  <Input
                    id="accessibilityNeeds"
                    value={formData.accessibilityNeeds}
                    onChange={(e) => handleInputChange('accessibilityNeeds', e.target.value)}
                    placeholder="Wheelchair access, hearing assistance, etc."
                  />
                </div>

                {/* Special Requests */}
                <div className="space-y-2">
                  <Label htmlFor="specialRequests" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Additional Requests
                  </Label>
                  <textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    placeholder="Any other special requests or notes..."
                    className="w-full min-h-[80px] p-3 border border-input rounded-md text-sm resize-none"
                    rows={3}
                  />
                </div>

                {/* Deposit Information */}
                {depositRequired && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-2">
                      <CreditCard className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-900">Deposit Required</p>
                        <p className="text-amber-700">
                          A deposit of ${depositAmount} is required for this booking.
                          {formData.partySize >= 8 && " Large party bookings require a deposit to secure your reservation."}
                          {formData.specialOccasion !== 'none' && " Special occasion bookings require a deposit."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms and Policy */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreedToPolicy"
                    checked={formData.agreedToPolicy}
                    onCheckedChange={(checked) => handleInputChange('agreedToPolicy', checked)}
                  />
                  <Label htmlFor="agreedToPolicy" className="text-sm text-gray-600">
                    I agree to the cancellation policy and terms of service. 
                    <span className="text-blue-600 hover:underline cursor-pointer ml-1">
                      Read policy
                    </span>
                  </Label>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="notifications" className="text-sm font-medium">
                      Enable Notifications
                    </Label>
                    <p className="text-xs text-gray-600">
                      Get booking confirmations and reminders
                    </p>
                  </div>
                  <Checkbox
                    id="notifications"
                    checked={formData.notifications}
                    onCheckedChange={(checked) => handleInputChange('notifications', checked)}
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 'payment' && depositRequired && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold">Payment & Deposit</h3>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div>Restaurant: {restaurantName}</div>
                    <div>Date: {formData.date} at {formData.time}</div>
                    <div>Party Size: {formData.partySize} guests</div>
                    <div>Guest: {formData.guestName}</div>
                    {formData.tablePreference !== 'any' && (
                      <div>Table: {formData.tablePreference}</div>
                    )}
                    {formData.specialOccasion !== 'none' && (
                      <div>Occasion: {formData.specialOccasion}</div>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                    <h4 className="font-medium text-amber-900">Deposit Required</h4>
                  </div>
                  <p className="text-amber-700 text-sm mb-3">
                    Amount: <span className="font-semibold text-lg">${depositAmount}</span>
                  </p>
                  <p className="text-amber-600 text-xs">
                    This deposit will be applied to your final bill. Cancellations must be made 24 hours in advance for a full refund.
                  </p>
                </div>

                {/* Mock Payment Form */}
                <div className="space-y-4 border rounded-lg p-4">
                  <h4 className="font-medium">Payment Information</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Card Number</Label>
                      <Input placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Expiry Date</Label>
                        <Input placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label>CVV</Label>
                        <Input placeholder="123" />
                      </div>
                    </div>
                    <div>
                      <Label>Cardholder Name</Label>
                      <Input placeholder="Name on card" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'confirmation' && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-green-900 mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-600">Your reservation has been successfully made.</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg text-left">
                  <h4 className="font-medium text-green-900 mb-2">Booking Details</h4>
                  <div className="space-y-1 text-sm text-green-800">
                    <div>Confirmation #: RST{Date.now().toString().slice(-6)}</div>
                    <div>Restaurant: {restaurantName}</div>
                    <div>Date: {formData.date} at {formData.time}</div>
                    <div>Party Size: {formData.partySize} guests</div>
                    <div>Guest: {formData.guestName}</div>
                    <div>Phone: {formData.guestPhone}</div>
                    <div>Email: {formData.guestEmail}</div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                  <p>📧 Confirmation email sent to {formData.guestEmail}</p>
                  <p>📱 SMS reminder will be sent 2 hours before your reservation</p>
                  <p>⏰ Please arrive on time. Tables are held for 15 minutes past reservation time.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex gap-2">
          {currentStep !== 'confirmation' && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (currentStep === 'details') setCurrentStep('calendar')
                  else if (currentStep === 'payment') setCurrentStep('details')
                  else onCancel()
                }}
                className="flex-1"
                disabled={isSubmitting}
              >
                {currentStep === 'calendar' ? 'Cancel' : 'Back'}
              </Button>
              
              <Button
                type="button"
                onClick={() => {
                  if (currentStep === 'calendar' && formData.date && formData.time) {
                    setCurrentStep('details')
                  } else if (currentStep === 'details') {
                    handleNext()
                  } else if (currentStep === 'payment') {
                    handleSubmit()
                  }
                }}
                className="flex-1"
                disabled={
                  isSubmitting ||
                  (currentStep === 'calendar' && (!formData.date || !formData.time)) ||
                  (currentStep === 'details' && !canProceedToPayment())
                }
              >
                {isSubmitting ? 'Processing...' : 
                 currentStep === 'calendar' ? 'Continue' :
                 currentStep === 'details' ? (depositRequired ? 'Continue to Payment' : 'Confirm Booking') :
                 currentStep === 'payment' ? 'Pay & Confirm' : 'Confirm'}
              </Button>
            </>
          )}
          
          {currentStep === 'confirmation' && (
            <Button onClick={onCancel} className="w-full">
              Close
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}