'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { RestaurantCard } from '@/components/restaurant/restaurant-card'
import { MobileRestaurantCard } from '@/components/restaurant/mobile-restaurant-card'
import { SearchBar } from '@/components/restaurant/search-bar'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { QRScanner } from '@/components/ui/qr-scanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MobileBookingForm } from '@/components/booking/mobile-booking-form'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/providers/auth-provider'
import { usePullToRefresh } from '@/hooks/useMobileGestures'
import axios from 'axios'
import { Loader2, Filter, QrCode, MapPin, Grid, List } from 'lucide-react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface Restaurant {
  id: string
  name: string
  description: string
  address: string
  cuisine: string
  priceRange: string
  rating: number
  imageUrl: string
  distance?: number
  isOpen?: boolean
  nextAvailableTime?: string
  _count: {
    reviews: number
  }
}

export default function RestaurantsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  })
  const [filters, setFilters] = useState({
    cuisine: '',
    priceRange: '',
    query: '',
  })

  useEffect(() => {
    // Initialize filters from URL params
    setFilters({
      cuisine: searchParams.get('cuisine') || '',
      priceRange: searchParams.get('priceRange') || '',
      query: searchParams.get('query') || '',
    })
    
    fetchRestaurants(1)
  }, [searchParams])

  const fetchRestaurants = async (page: number = pagination.page) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      // Add search parameters
      searchParams.forEach((value, key) => {
        if (value) params.set(key, value)
      })

      const response = await axios.get(`/api/restaurants?${params.toString()}`)
      setRestaurants(response.data.restaurants)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
      toast({
        title: 'Error',
        description: 'Failed to load restaurants. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchRestaurants(1)
      toast({
        title: 'Updated',
        description: 'Restaurant list refreshed',
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    fetchRestaurants(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    router.push('/restaurants')
  }

  const handleQRCodeScan = (data: string) => {
    // Handle QR code scanning
    try {
      const restaurantData = JSON.parse(data)
      if (restaurantData.restaurantId) {
        router.push(`/restaurants/${restaurantData.restaurantId}`)
      }
    } catch (error) {
      // If it's not JSON, it might be a URL
      if (data.startsWith('http')) {
        window.open(data, '_blank')
      } else {
        toast({
          title: 'QR Code Scanned',
          description: `Scanned: ${data}`,
        })
      }
    }
  }

  const handleBook = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setShowBookingForm(true)
  }

  const handleBookSubmit = async (bookingData: any) => {
    // Handle booking submission
    console.log('Booking data:', bookingData, 'for restaurant:', selectedRestaurant?.name)
    
    try {
      const response = await axios.post('/api/bookings', {
        ...bookingData,
        restaurantId: selectedRestaurant?.id,
      })
      
      setShowBookingForm(false)
      setSelectedRestaurant(null)
      
      toast({
        title: 'Booking Confirmed!',
        description: `Your table has been booked at ${selectedRestaurant?.name}`,
      })
      
      router.push('/bookings')
    } catch (error) {
      throw new Error('Booking failed')
    }
  }

  const handleViewMenu = (restaurantId: string) => {
    router.push(`/restaurants/${restaurantId}/menu`)
  }

  const handleShare = async (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId)
    if (restaurant) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: restaurant.name,
            text: `Check out ${restaurant.name} - ${restaurant.cuisine}`,
            url: `${window.location.origin}/restaurants/${restaurantId}`,
          })
        } catch (error) {
          // Share canceled or failed
        }
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(`${window.location.origin}/restaurants/${restaurantId}`)
        toast({
          title: 'Link Copied',
          description: 'Restaurant link has been copied to clipboard',
        })
      }
    }
  }

  const hasActiveFilters = searchParams.toString() !== ''
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <PullToRefresh onRefresh={handleRefresh} className="space-y-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Discover Restaurants
          </h1>
          <p className="text-lg text-muted-foreground">
            Find the perfect dining experience for any occasion
          </p>
        </div>

        {/* Search and Controls */}
        <div className="space-y-4">
          <SearchBar />
          
          {/* Mobile Controls */}
          {isMobile && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQRScanner(true)}
                className="flex-1 touch-target"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Scan QR
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/nearby')}
                className="flex-1 touch-target"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Nearby
              </Button>
            </div>
          )}

          {/* View Mode Toggle (Desktop) */}
          {!isMobile && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {loading ? (
                  'Loading restaurants...'
                ) : (
                  `Showing ${restaurants.length} of ${pagination.total} restaurants`
                )}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Active filters:</span>
                  {searchParams.get('query') && (
                    <Badge variant="secondary">
                      Query: {searchParams.get('query')}
                    </Badge>
                  )}
                  {searchParams.get('cuisine') && (
                    <Badge variant="secondary">
                      Cuisine: {searchParams.get('cuisine')}
                    </Badge>
                  )}
                  {searchParams.get('priceRange') && (
                    <Badge variant="secondary">
                      Price: {searchParams.get('priceRange')}
                    </Badge>
                  )}
                  {searchParams.get('location') && (
                    <Badge variant="secondary">
                      Location: {searchParams.get('location')}
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-48 rounded-lg mb-4" />
                <div className="space-y-2">
                  <div className="bg-muted h-4 rounded w-3/4" />
                  <div className="bg-muted h-3 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length > 0 ? (
          <>
            <div className={isMobile ? 'space-y-4' : `grid ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {restaurants.map((restaurant) => (
                isMobile ? (
                  <MobileRestaurantCard
                    key={restaurant.id}
                    restaurant={{
                      ...restaurant,
                      location: restaurant.address,
                      image: restaurant.imageUrl,
                      isOpen: restaurant.isOpen ?? true,
                    }}
                    onBook={(id) => handleBook(restaurant)}
                    onViewMenu={handleViewMenu}
                    onShare={handleShare}
                    onScanQR={(id) => {
                      // QR scanner could show restaurant menu
                      router.push(`/restaurants/${id}/menu`)
                    }}
                  />
                ) : (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    viewMode={viewMode}
                  />
                )
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={pagination.page === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                  
                  {pagination.pages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant={pagination.page === pagination.pages ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pagination.pages)}
                      >
                        {pagination.pages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No restaurants found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all restaurants
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters}>
                View all restaurants
              </Button>
            )}
          </div>
        )}
      </div>

      {/* QR Scanner Dialog */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRCodeScan}
        title="Scan Restaurant QR Code"
      />

      {/* Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          {selectedRestaurant && (
            <MobileBookingForm
              restaurantName={selectedRestaurant.name}
              onSubmit={handleBookSubmit}
              onCancel={() => setShowBookingForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </PullToRefresh>
  )
}