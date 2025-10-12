'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { RestaurantCard } from '@/components/restaurant/restaurant-card'
import { SearchBar } from '@/components/restaurant/search-bar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import axios from 'axios'
import { Loader2, Filter } from 'lucide-react'

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
  _count: {
    reviews: number
  }
}

export default function RestaurantsPage() {
  const searchParams = useSearchParams()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
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

  const fetchRestaurants = async (page: number) => {
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
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    fetchRestaurants(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    window.location.href = '/restaurants'
  }

  const hasActiveFilters = searchParams.toString() !== ''

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Discover Restaurants
        </h1>
        <p className="text-lg text-muted-foreground">
          Find the perfect dining experience for any occasion
        </p>
      </div>

      {/* Search */}
      <SearchBar />

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
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? (
              'Loading restaurants...'
            ) : (
              `Showing ${restaurants.length} of ${pagination.total} restaurants`
            )}
          </p>
        </div>

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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
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
    </div>
  )
}