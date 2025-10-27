'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, MapPin } from 'lucide-react'

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
  }
  onBook: (id: string) => void
  onViewMenu: (id: string) => void
  onShare: (id: string) => void
}

export function MobileRestaurantCard({ 
  restaurant, 
  onBook, 
  onViewMenu, 
  onShare 
}: RestaurantCardProps) {
  const [imageError, setImageError] = useState(false)

  const handleBook = () => {
    onBook(restaurant.id)
  }

  const handleViewMenu = () => {
    onViewMenu(restaurant.id)
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-lg">{restaurant.name}</h3>
            <span className="text-sm text-gray-500">{restaurant.cuisine}</span>
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm">{restaurant.rating}</span>
              <span className="ml-1 text-sm text-gray-500">({restaurant.reviews})</span>
            </div>
            <span className="text-sm text-gray-500">{restaurant.priceRange}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{restaurant.location}</span>
            {restaurant.distance && <span className="ml-2">{restaurant.distance}</span>}
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleBook}
              className="flex-1"
              disabled={!restaurant.isOpen}
            >
              {restaurant.isOpen ? 'Book Now' : 'Closed'}
            </Button>
            <Button 
              variant="outline"
              onClick={handleViewMenu}
            >
              Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}