'use client'

import { useEffect, useState } from 'react'
import { RestaurantCard } from './restaurant-card'
import axios from 'axios'

interface Restaurant {
  id: string
  name: string
  description: string
  address: string
  cuisine: string
  priceRange: string
  rating: number
  imageUrl: string
  _count: {
    reviews: number
  }
}

export function FeaturedRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedRestaurants()
  }, [])

  const fetchFeaturedRestaurants = async () => {
    try {
      const response = await axios.get('/api/restaurants?limit=6')
      setRestaurants(response.data.restaurants)
    } catch (error) {
      console.error('Error fetching featured restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
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
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  )
}