import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRestaurantStore, useBookingStore } from '../store'
import { useToast } from '../hooks/use-toast'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { useI18n } from '../contexts/I18nContext'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  CreditCard,
  Check,
  AlertCircle,
} from 'lucide-react'

export function BookingPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>()
  const navigate = useNavigate()
  const { restaurants } = useRestaurantStore()
  const { createBooking, isLoading } = useBookingStore()
  const { toast } = useToast()
  const { t, formatPrice } = useI18n()
  
  const restaurant = restaurants.find(r => r.id === restaurantId)
  
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    partySize: 2,
    specialRequests: '',
  })
  
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setBookingData(prev => ({
      ...prev,
      date: tomorrow.toISOString().split('T')[0],
    }))
  }, [])

  const timeSlots = [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ]

  const partySizes = Array.from({ length: 12 }, (_, i) => i + 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!restaurant) {
      toast({
        title: t('booking.error'),
        description: t('booking.restaurantNotFound'),
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const booking = await createBooking({
        restaurantId: restaurant.id,
        ...bookingData,
      })
      
      toast({
        title: t('booking.confirmed'),
        description: t('booking.confirmedMessage'),
      })
      
      navigate('/profile')
    } catch (error) {
      toast({
        title: t('booking.error'),
        description: t('booking.errorMessage'),
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">{t('restaurants.notFound')}</h2>
        <Button onClick={() => navigate('/restaurants')}>
          {t('restaurants.browseRestaurants')}
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate(`/restaurants/${restaurantId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('booking.title')}</h1>
          <p className="text-muted-foreground">{restaurant.name}</p>
        </div>
      </div>

      {/* Restaurant Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{restaurant.name}</h3>
              <p className="text-muted-foreground text-sm">{restaurant.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <span>⭐</span>
                  <span>{restaurant.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{restaurant.priceRange}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{restaurant.cuisine.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > stepNum ? <Check className="h-4 w-4" /> : stepNum}
            </div>
            {stepNum < 3 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  step > stepNum ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && t('booking.step1Title')}
            {step === 2 && t('booking.step2Title')}
            {step === 3 && t('booking.step3Title')}
          </CardTitle>
          <CardDescription>
            {step === 1 && t('booking.step1Description')}
            {step === 2 && t('booking.step2Description')}
            {step === 3 && t('booking.step3Description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">
                      <Calendar className="inline mr-2 h-4 w-4" />
                      {t('booking.date')}
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">
                      <Clock className="inline mr-2 h-4 w-4" />
                      {t('booking.time')}
                    </Label>
                    <Select
                      value={bookingData.time}
                      onValueChange={(value) => setBookingData({ ...bookingData, time: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('booking.selectTime')} />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partySize">
                    <Users className="inline mr-2 h-4 w-4" />
                    {t('booking.partySize')}
                  </Label>
                  <Select
                    value={bookingData.partySize.toString()}
                    onValueChange={(value) => setBookingData({ ...bookingData, partySize: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {partySizes.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} {size === 1 ? t('booking.guest') : t('booking.guests')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="button" onClick={() => setStep(2)} className="w-full">
                  {t('common.next')}
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="specialRequests">
                    <MessageSquare className="inline mr-2 h-4 w-4" />
                    {t('booking.specialRequests')}
                  </Label>
                  <Textarea
                    id="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                    placeholder={t('booking.specialRequestsPlaceholder')}
                    rows={4}
                  />
                </div>

                {/* Booking Summary */}
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{t('booking.summary')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t('booking.date')}</span>
                      <span>{bookingData.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('booking.time')}</span>
                      <span>{bookingData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('booking.partySize')}</span>
                      <span>
                        {bookingData.partySize} {bookingData.partySize === 1 ? t('booking.guest') : t('booking.guests')}
                      </span>
                    </div>
                    {bookingData.specialRequests && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-muted-foreground">{t('booking.specialRequests')}:</span>
                        <p className="text-sm">{bookingData.specialRequests}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    {t('common.back')}
                  </Button>
                  <Button type="button" onClick={() => setStep(3)} className="flex-1">
                    {t('common.next')}
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                {/* Confirmation */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                    <Check className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-900">{t('booking.readyToConfirm')}</h3>
                      <p className="text-sm text-green-700">
                        {t('booking.confirmationMessage')}
                      </p>
                    </div>
                  </div>

                  {/* Loyalty Benefits */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t('booking.loyaltyBenefits')}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>{t('booking.loyaltyDiscount')}</span>
                        <Badge variant="secondary">10% off</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{t('booking.earnPoints')}</span>
                        <Badge variant="outline">+500 points</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      {t('booking.termsText')}{' '}
                      <a href="/terms" className="text-primary hover:underline">
                        {t('booking.termsOfService')}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                    {t('common.back')}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      t('booking.confirming')
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        {t('booking.confirmBooking')}
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
