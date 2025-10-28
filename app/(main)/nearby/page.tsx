'use client'

import { useEffect, useState } from 'react'
import { MapPin, Navigation, Star, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getRestaurantsByDistance, Restaurant } from '@/lib/restaurant-data'

export default function NearbyPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    requestLocation()
  }, [])

  const requestLocation = () => {
    setLoading(true)
    setRequesting(true)
    setError(null)

    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.')
      setLoading(false)
      setRequesting(false)
      return
    }

    console.log('[Nearby] Requesting geolocation...')
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        console.log(`[Nearby] Location obtained: ${latitude}, ${longitude}`)
        
        setLocation({
          lat: latitude,
          lng: longitude
        })
        
        // Get restaurants sorted by distance from user's location
        const nearbyRestaurants = getRestaurantsByDistance(latitude, longitude, 10)
        console.log(`[Nearby] Found ${nearbyRestaurants.length} restaurants within 10km`)
        
        setRestaurants(nearbyRestaurants)
        setLoading(false)
        setRequesting(false)
      },
      (error) => {
        console.error('[Nearby] Geolocation error:', error)
        
        let errorMessage = 'Unable to access location. '
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location permission denied. Please enable location access in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable. Please try again.'
            break
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.'
            break
          default:
            errorMessage += 'An unknown error occurred.'
        }
        
        setError(errorMessage)
        setLoading(false)
        setRequesting(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Nearby Restaurants</h1>
          <Button
            onClick={requestLocation}
            variant="outline"
            size="sm"
            disabled={requesting}
          >
            {requesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Locating...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 text-yellow-800 dark:text-yellow-200">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-2">{error}</p>
                  <Button onClick={requestLocation} size="sm" variant="outline">
                    <Navigation className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading && !error && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p>Searching for nearby restaurants...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {location && !loading && restaurants.length > 0 && (
          <Card className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <MapPin className="h-5 w-5" />
                <p>
                  Found {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} near your location
                </p>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
                Location: {location.lat.toFixed(4)}°N, {Math.abs(location.lng).toFixed(4)}°W
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && location && restaurants.length === 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No restaurants found within 10km of your location.
              </p>
              <Button onClick={requestLocation} variant="outline">
                <Navigation className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.png'
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold">{restaurant.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {restaurant.cuisine}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
                        <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                        <span className="text-sm font-medium">{restaurant.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {restaurant.description}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                        <MapPin className="h-4 w-4" />
                        <span>{restaurant.distance} km away</span>
                      </div>
                      <span className="text-gray-500">{restaurant.priceRange}</span>
                      <span className="text-gray-500">{restaurant._count.reviews} reviews</span>
                    </div>
                    {restaurant.isOpen && restaurant.nextAvailableTime && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        Next available: {restaurant.nextAvailableTime}
                      </p>
                    )}
                    {restaurant.isOpen === false && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                        Currently closed
                      </p>
                    )}
                    <div className="mt-4">
                      <Link href={`/restaurants/${restaurant.id}`}>
                        <Button size="sm" className="w-full sm:w-auto">
                          View Details & Book
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
