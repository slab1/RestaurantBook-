import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useRestaurantStore, useBookingStore } from '../store'
import { useToast } from '../hooks/use-toast'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useI18n } from '../contexts/I18nContext'
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
  Heart,
  Share,
  QrCode,
  Camera,
  Award,
  DollarSign,
  Check,
} from 'lucide-react'

export function RestaurantDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { restaurants, selectedRestaurant, setSelectedRestaurant } = useRestaurantStore()
  const { createBooking } = useBookingStore()
  const { toast } = useToast()
  const { t, formatPrice } = useI18n()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const restaurant = selectedRestaurant || restaurants.find(r => r.id === id)

  useEffect(() => {
    if (restaurant && !selectedRestaurant) {
      setSelectedRestaurant(restaurant)
    }
  }, [restaurant, selectedRestaurant, setSelectedRestaurant])

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">{t('restaurants.notFound')}</h2>
        <Link to="/restaurants">
          <Button>{t('restaurants.backToList')}</Button>
        </Link>
      </div>
    )
  }

  const handleBooking = async (bookingData: any) => {
    try {
      const booking = await createBooking({
        restaurantId: restaurant.id,
        ...bookingData,
      })
      
      toast({
        title: t('booking.confirmed'),
        description: t('booking.confirmedMessage'),
      })
      
      setShowBookingForm(false)
    } catch (error) {
      toast({
        title: t('booking.error'),
        description: t('booking.errorMessage'),
        variant: 'destructive',
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurant.name,
          text: restaurant.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: t('common.linkCopied'),
        description: t('restaurants.linkCopiedMessage'),
      })
    }
  }

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited)
    toast({
      title: isFavorited ? t('restaurants.removedFromFavorites') : t('restaurants.addedToFavorites'),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/restaurants">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share className="mr-2 h-4 w-4" />
          {t('common.share')}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleFavorite}
          className={isFavorited ? 'text-red-500 border-red-500' : ''}
        >
          <Heart className={`mr-2 h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          {isFavorited ? t('restaurants.favorited') : t('restaurants.favorite')}
        </Button>
      </div>

      {/* Restaurant Header */}
      <Card>
        <div className="relative">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          <div className="absolute top-4 left-4 flex space-x-2">
            {restaurant.isOpen ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Clock className="h-3 w-3 mr-1" />
                {t('restaurants.open')}
              </Badge>
            ) : (
              <Badge variant="destructive">
                {t('restaurants.closed')}
              </Badge>
            )}
            <Badge variant="outline">
              {restaurant.priceRange}
            </Badge>
          </div>
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button size="sm" variant="secondary">
              <Camera className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary">
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{restaurant.name}</CardTitle>
              <CardDescription className="text-base">
                {restaurant.description}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{restaurant.rating}</span>
              <span>({restaurant.reviewCount} {t('restaurants.reviews')})</span>
            </div>
            {restaurant.distance && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{restaurant.distance}km</span>
              </div>
            )}
            {restaurant.nextAvailableTime && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{t('restaurants.nextAvailable')}: {restaurant.nextAvailableTime}</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button onClick={() => setShowBookingForm(true)} className="h-12">
          <Calendar className="mr-2 h-5 w-5" />
          {t('common.book')}
        </Button>
        <Button variant="outline" onClick={() => window.location.href = `/ar/${restaurant.id}`}>
          <Camera className="mr-2 h-5 w-5" />
          {t('restaurants.arView')}
        </Button>
        <Button variant="outline">
          <Users className="mr-2 h-5 w-5" />
          {t('restaurants.makeReservation')}
        </Button>
        <Button variant="outline">
          <Award className="mr-2 h-5 w-5" />
          {t('restaurants.joinWaitlist')}
        </Button>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('restaurants.overview')}</TabsTrigger>
          <TabsTrigger value="menu">{t('restaurants.menu')}</TabsTrigger>
          <TabsTrigger value="reviews">{t('restaurants.reviews')}</TabsTrigger>
          <TabsTrigger value="info">{t('restaurants.info')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>{t('restaurants.about')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{restaurant.description}</p>
                
                <div>
                  <h4 className="font-semibold mb-2">{t('restaurants.cuisine')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.cuisine.map((cuisine) => (
                      <Badge key={cuisine} variant="outline">
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">{t('restaurants.amenities')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Location */}
            <Card>
              <CardHeader>
                <CardTitle>{t('restaurants.contact')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{restaurant.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {restaurant.city}, {restaurant.state} {restaurant.postalCode}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a href={`tel:${restaurant.phone}`} className="text-primary hover:underline">
                    {restaurant.phone}
                  </a>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <a href={`mailto:${restaurant.email}`} className="text-primary hover:underline">
                    {restaurant.email}
                  </a>
                </div>
                
                {restaurant.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <a 
                      href={restaurant.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {restaurant.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Opening Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                {t('restaurants.openingHours')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center">
                    <span className="capitalize font-medium">{t(`days.${day}`)}</span>
                    {hours.closed ? (
                      <span className="text-muted-foreground">{t('restaurants.closed')}</span>
                    ) : (
                      <span>
                        {hours.open} - {hours.close}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('restaurants.menuComingSoon')}</CardTitle>
              <CardDescription>
                {t('restaurants.menuDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  {t('restaurants.arMenuView')}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t('restaurants.arMenuDescription')}
                </p>
                <Button onClick={() => window.location.href = `/ar/${restaurant.id}`}>
                  <Camera className="mr-2 h-4 w-4" />
                  {t('restaurants.tryAR')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('restaurants.reviewsAndRatings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  {t('restaurants.reviewsComingSoon')}
                </h3>
                <p className="text-muted-foreground">
                  {t('restaurants.reviewsDescription')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('restaurants.additionalInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">{t('restaurants.capacity')}</h4>
                  <p>{restaurant.capacity} {t('restaurants.guests')}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">{t('restaurants.priceRange')}</h4>
                  <p>{restaurant.priceRange}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">{t('restaurants.cuisine')}</h4>
                  <p>{restaurant.cuisine.join(', ')}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">{t('restaurants.amenities')}</h4>
                  <p>{restaurant.amenities.join(', ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QR Code for easy sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="mr-2 h-5 w-5" />
            {t('restaurants.qrCode')}
          </CardTitle>
          <CardDescription>
            {t('restaurants.qrCodeDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="inline-block p-4 bg-muted rounded-lg">
              {/* QR Code placeholder */}
              <div className="w-32 h-32 bg-white rounded border-2 border-dashed border-muted-foreground flex items-center justify-center">
                <QrCode className="h-16 w-16 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {t('restaurants.scanToView')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
