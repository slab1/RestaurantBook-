'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSwipe, useHaptic } from '@/hooks/useMobileGestures'
import { Star, MapPin, Clock, QrCode, Heart, Share } from 'lucide-react'

interface RestaurantCardProps {
  restaurant: {
    id: string
    name: string
    cuisine: string
    rating: number
    reviews: number
    priceRange: string
    location: string
    distance?: string
    image?: string
    isOpen: boolean
    nextAvailableTime?: string
  }
  onBook: (id: string) => void
  onViewMenu: (id: string) => void
  onShare: (id: string) => void
  onScanQR?: (id: string) => void
}

export function MobileRestaurantCard({ 
  restaurant, 
  onBook, 
  onViewMenu, 
  onShare, 
  onScanQR 
}: RestaurantCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)
  const { vibrate, mediumImpact } = useHaptic()

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      mediumImpact()
      onViewMenu(restaurant.id)
    },
    onSwipeRight: () => {
      mediumImpact()
      onBook(restaurant.id)
    },
  })

  const handleLike = () => {
    setIsLiked(!isLiked)
    vibrate(10)
    // TODO: Implement like functionality
  }

  const handleShare = () => {
    vibrate(20)
    onShare(restaurant.id)
  }

  const handleQR = () => {
    vibrate(30)
    onScanQR?.(restaurant.id)
  }

  const handleBook = () => {
    mediumImpact()
    onBook(restaurant.id)
  }

  const handleViewMenu = () => {
    mediumImpact()
    onViewMenu(restaurant.id)
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card 
        className=\"overflow-hidden mobile-card relative"
        {...swipeHandlers}
      >
        {/* Image Container */}
        <div 
          className="relative h-48 overflow-hidden cursor-pointer"
          onClick={() => setShowFullImage(true)}
        >
          <img
            src={restaurant.image || '/api/placeholder/300/200'}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge 
              variant={restaurant.isOpen ? 'default' : 'destructive'}
              className=\"text-xs"
            >
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </Badge>
            {restaurant.nextAvailableTime && (
              <Badge variant="secondary" className="text-xs">
                {restaurant.nextAvailableTime}
              </Badge>
            )}
          </div>
          <div className="absolute top-3 right-3 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40"
              onClick={(e) => {
                e.stopPropagation()
                handleLike()
              }}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">
                {restaurant.name}
              </h3>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{restaurant.rating}</span>
                <span className="text-xs text-gray-500">({restaurant.reviews})</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {restaurant.cuisine} • {restaurant.priceRange}
            </p>

            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{restaurant.location}</span>
              {restaurant.distance && (
                <>
                  <span>•</span>
                  <span>{restaurant.distance}</span>
                </>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap">
          <Button
            onClick={handleBook}
            className="flex-1 min-w-[120px] touch-target"
            size="sm"
          >
            Book Now
          </Button>
          
          <Button
            variant="outline"
            onClick={handleViewMenu}
            className="flex-1 min-w-[100px] touch-target"
            size="sm"
          >
            View Menu
          </Button>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQR}
              className="h-10 w-10 p-0"
              disabled={!onScanQR}
            >
              <QrCode className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-10 w-10 p-0"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>

        {/* Swipe indicators */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 md:hidden">
          <div className="text-xs text-gray-400 text-center">
            <span>← Swipe to book</span>
            <br />
            <span>Swipe → to view menu</span>
          </div>
        </div>
      </Card>

      {/* Full screen image modal */}
      {showFullImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <img
            src={restaurant.image || '/api/placeholder/300/200'}
            alt={restaurant.name}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  )
}