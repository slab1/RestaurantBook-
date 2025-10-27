'use client'

import { useEffect, useState } from 'react'
import { RestaurantCard } from './restaurant-card'

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

// Mock data for featured restaurants
const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'The Golden Spoon',
    description: 'Fine dining experience with contemporary cuisine',
    address: '123 Main Street, Downtown',
    cuisine: 'Contemporary',
    priceRange: '$$$',
    rating: 4.8,
    imageUrl: '/imgs/elegant_fine_dining_restaurant_interior_wooden_decor.jpg',
    _count: { reviews: 127 }
  },
  {
    id: '2', 
    name: 'Bella Vista',
    description: 'Authentic Italian cuisine with a modern twist',
    address: '456 Oak Avenue, Little Italy',
    cuisine: 'Italian',
    priceRange: '$$',
    rating: 4.6,
    imageUrl: '/imgs/delicious_authentic_italian_spaghetti_pasta_fork.jpg',
    _count: { reviews: 89 }
  },
  {
    id: '3',
    name: 'Sakura Sushi',
    description: 'Fresh sushi and traditional Japanese dishes',
    address: '789 Cherry Blossom Road', 
    cuisine: 'Japanese',
    priceRange: '$$',
    rating: 4.7,
    imageUrl: '/imgs/modern_japanese_sushi_restaurant_bar_chefs.jpg',
    _count: { reviews: 156 }
  },
  {
    id: '4',
    name: 'The Cozy Corner',
    description: 'Comfort food and warm atmosphere for family dining',
    address: '321 Elm Street, Residential District',
    cuisine: 'American',
    priceRange: '$',
    rating: 4.4,
    imageUrl: '/imgs/american_comfort_food_feast_family_restaurant.jpg',
    _count: { reviews: 203 }
  },
  {
    id: '5',
    name: 'Spice Route',
    description: 'Authentic Indian cuisine with traditional spices',
    address: '654 Curry Lane, Spice District',
    cuisine: 'Indian',
    priceRange: '$$',
    rating: 4.5,
    imageUrl: '/imgs/authentic_indian_chicken_tikka_masala_rice_naan.jpg',
    _count: { reviews: 98 }
  },
  {
    id: '6',
    name: 'Le Petit Bistro',
    description: 'Classic French cuisine in an intimate setting',
    address: '987 Wine Street, French Quarter',
    cuisine: 'French', 
    priceRange: '$$$',
    rating: 4.9,
    imageUrl: '/imgs/elegant_french_bistro_wine_atmosphere.jpg',
    _count: { reviews: 76 }
  }
]

export function FeaturedRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time then set mock data
    const timer = setTimeout(() => {
      setRestaurants(mockRestaurants)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

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