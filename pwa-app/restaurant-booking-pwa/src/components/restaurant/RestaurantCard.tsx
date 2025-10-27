import React from 'react'
import { Link } from 'react-router-dom'
import { Restaurant } from '../../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useI18n } from '../../contexts/I18nContext'
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  Share,
  QrCode,
  Camera,
  Calendar,
  Users,
  ExternalLink,
} from 'lucide-react'

interface RestaurantCardProps {
  restaurant: Restaurant
  viewMode?: 'grid' | 'list'
  onBook?: (restaurant: Restaurant) => void
  onViewMenu?: (restaurantId: string) => void
  onShare?: (restaurantId: string) => void
  onScanQR?: (restaurantId: string) => void
  onARView?: (restaurantId: string) => void
}

export function RestaurantCard({
  restaurant,
  viewMode = 'grid',
  onBook,
  onViewMenu,
  onShare,
  onScanQR,
  onARView,
}: RestaurantCardProps) {
  const { t, formatPrice } = useI18n()

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (onShare) {
      onShare(restaurant.id)
      return
    }
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurant.name,
          text: `${restaurant.description}`,
          url: `${window.location.origin}/restaurants/${restaurant.id}`,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/restaurants/${restaurant.id}`)
      // You could show a toast here
    }
  }

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (onBook) {
      onBook(restaurant)
    } else {
      // Default action: navigate to restaurant details or booking page
      window.location.href = `/booking/${restaurant.id}`
    }
  }

  const handleViewMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (onViewMenu) {
      onViewMenu(restaurant.id)
    } else {
      window.location.href = `/restaurants/${restaurant.id}`
    }
  }

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="md:flex">
          <div className="md:w-48 md:flex-shrink-0">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="h-32 w-full object-cover md:h-full"
            />
          </div>
          <div className="p-6 flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{restaurant.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {restaurant.priceRange}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {restaurant.description}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{restaurant.rating}</span>
                    <span>({restaurant.reviewCount})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{restaurant.distance}km</span>
                  </div>
                  {restaurant.isOpen && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Clock className="h-4 w-4" />
                      <span>Open</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {restaurant.cuisine.slice(0, 3).map((cuisine) => (
                    <Badge key={cuisine} variant="outline" className="text-xs">
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 ml-4">
                <Button size="sm" onClick={handleBookClick}>
                  <Calendar className="mr-2 h-4 w-4" />
                  {t('common.book')}
                </Button>
                <Button variant="outline" size="sm" onClick={handleViewMenu}>
                  {t('common.viewMenu')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-48 object-cover"
        />
        
        {/* Overlay Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-1">
            <Button size="sm" variant="secondary" onClick={handleShare}>
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          {restaurant.isOpen ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Clock className="h-3 w-3 mr-1" />
              Open
            </Badge>
          ) : (
            <Badge variant="destructive">
              Closed
            </Badge>
          )}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-1">{restaurant.name}</CardTitle>
          <Badge variant="secondary">{restaurant.priceRange}</Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {restaurant.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Rating and Distance */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{restaurant.rating}</span>
            <span className="text-muted-foreground">({restaurant.reviewCount})</span>
          </div>
          {restaurant.distance && (
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{restaurant.distance}km</span>
            </div>
          )}
        </div>
        
        {/* Cuisine Tags */}
        <div className="flex flex-wrap gap-1">
          {restaurant.cuisine.slice(0, 3).map((cuisine) => (
            <Badge key={cuisine} variant="outline" className="text-xs">
              {cuisine}
            </Badge>
          ))}
        </div>
        
        {/* Next Available */}
        {restaurant.nextAvailableTime && (
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Next available: {restaurant.nextAvailableTime}</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" onClick={handleBookClick}>
            <Calendar className="mr-2 h-4 w-4" />
            {t('common.book')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewMenu}>
            {t('common.viewMenu')}
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex justify-center space-x-2 pt-2 border-t">
          <Button size="sm" variant="ghost" onClick={() => onARView?.(restaurant.id)}>
            <Camera className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onScanQR?.(restaurant.id)}>
            <QrCode className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
