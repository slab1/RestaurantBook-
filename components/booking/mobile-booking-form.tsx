'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Users, Phone, Mail, MessageSquare } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useHaptic } from '@/hooks/useMobileGestures'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { motion } from 'framer-motion'

interface MobileBookingFormProps {
  restaurantName: string
  onSubmit: (bookingData: BookingFormData) => Promise<void>
  onCancel: () => void
}

export interface BookingFormData {
  date: string
  time: string
  partySize: number
  guestName: string
  guestEmail: string
  guestPhone: string
  specialRequests?: string
  notifications: boolean
}

export function MobileBookingForm({ 
  restaurantName, 
  onSubmit, 
  onCancel 
}: MobileBookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<BookingFormData>({
    date: '',
    time: '',
    partySize: 2,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',
    notifications: true,
  })

  const { toast } = useToast()
  const { vibrate, mediumImpact } = useHaptic()
  const { subscribeToPush, sendNotification } = usePushNotifications()

  const handleInputChange = (field: keyof BookingFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    mediumImpact()
    setIsSubmitting(true)

    try {
      // Subscribe to notifications if enabled
      if (formData.notifications) {
        // TODO: Get actual user ID
        const userId = 'current-user-id'
        await subscribeToPush(userId)
      }

      await onSubmit(formData)
      
      // Send confirmation notification
      if (formData.notifications) {
        sendNotification('Booking Confirmed!', {
          body: `Your table at ${restaurantName} has been booked for ${formData.date} at ${formData.time}`,
          icon: '/icons/icon-192x192.png',
          tag: 'booking-confirmation',
        })
      }

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

  // Generate time slots
  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ]

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            Book at {restaurantName}
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                min={today}
                required
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="touch-target"
              />
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </Label>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={formData.time === time ? "default" : "outline"}
                    size="sm"
                    className="h-10 text-xs touch-target"
                    onClick={() => handleInputChange('time', time)}
                  >
                    {time}
                  </Button>
                ))}
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
                  className="h-10 w-10 p-0 touch-target"
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
                  className="text-center touch-target flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleInputChange('partySize', Math.min(20, formData.partySize + 1))}
                  className="h-10 w-10 p-0 touch-target"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Guest Name */}
            <div className="space-y-2">
              <Label htmlFor="guestName" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="guestName"
                type="text"
                required
                value={formData.guestName}
                onChange={(e) => handleInputChange('guestName', e.target.value)}
                placeholder="Enter your full name"
                className="touch-target"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="guestEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="guestEmail"
                type="email"
                required
                value={formData.guestEmail}
                onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                placeholder="Enter your email"
                className="touch-target"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="guestPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input
                id="guestPhone"
                type="tel"
                required
                value={formData.guestPhone}
                onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                placeholder="Enter your phone number"
                className="touch-target"
              />
            </div>

            {/* Special Requests */}
            <div className="space-y-2">
              <Label htmlFor="specialRequests" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Special Requests (Optional)
              </Label>
              <textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                placeholder="Any special dietary requirements or requests..."
                className="w-full min-h-[80px] p-3 border border-input rounded-md text-sm resize-none touch-target"
                rows={3}
              />
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Label htmlFor="notifications" className="text-sm font-medium">
                  Enable Notifications
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Get booking confirmations and reminders
                </p>
              </div>
              <input
                id="notifications"
                type="checkbox"
                checked={formData.notifications}
                onChange={(e) => handleInputChange('notifications', e.target.checked)}
                className="h-4 w-4 rounded touch-target"
              />
            </div>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 touch-target"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 touch-target"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}