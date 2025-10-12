'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, DollarSign } from 'lucide-react'

interface RestaurantCardProps {
  restaurant: {
    id: string
    name: string
    description?: string
    address: string
    cuisine?: string
    priceRange?: string
    rating?: number
    imageUrl?: string
    distance?: number
    _count?: {
      reviews: number
    }
  }
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
          alt={restaurant.name}
          fill
          className="object-cover"
        />
        {restaurant.distance && (
          <Badge className="absolute top-2 right-2">
            {restaurant.distance.toFixed(1)} km
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg line-clamp-1">
              {restaurant.name}
            </h3>
            {restaurant.rating && (
              <div className="flex items-center space-x-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{restaurant.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {restaurant.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {restaurant.description}
            </p>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{restaurant.address}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {restaurant.cuisine && (
                <Badge variant="secondary">{restaurant.cuisine}</Badge>
              )}
              {restaurant.priceRange && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>{restaurant.priceRange}</span>
                </div>
              )}
            </div>
            
            {restaurant._count?.reviews && (
              <span className="text-xs text-muted-foreground">
                {restaurant._count.reviews} reviews
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link href={`/restaurants/${restaurant.id}`} className="w-full">
          <Button className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}