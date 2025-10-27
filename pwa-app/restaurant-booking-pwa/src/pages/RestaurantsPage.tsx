import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useRestaurantStore } from '../store'
import { useToast } from '../hooks/use-toast'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useI18n } from '../contexts/I18nContext'
import {
  Search,
  MapPin,
  Filter,
  Grid,
  List,
  Star,
  Clock,
  QrCode,
  Camera,
  Heart,
  Navigation,
  DollarSign,
} from 'lucide-react'
import { RestaurantCard } from '../components/restaurant/RestaurantCard'

export function RestaurantsPage() {
  const { restaurants, searchFilters, setSearchFilters, fetchRestaurants, isLoading } = useRestaurantStore()
  const { toast } = useToast()
  const { t, formatPrice } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    query: '',
    location: '',
    cuisine: '',
    priceRange: '',
  })

  useEffect(() => {
    // Initialize filters from URL params
    const query = searchParams.get('query') || ''
    const location = searchParams.get('location') || ''
    const cuisine = searchParams.get('cuisine') || ''
    const priceRange = searchParams.get('priceRange') || ''
    
    setLocalFilters({ query, location, cuisine, priceRange })
    
    // Apply filters
    const filters: any = {}
    if (query) filters.query = query
    if (location) filters.location = location
    if (cuisine && cuisine !== 'all') filters.cuisine = [cuisine]
    if (priceRange && priceRange !== 'all') filters.priceRange = [priceRange]
    
    setSearchFilters(filters)
    fetchRestaurants(filters)
  }, [searchParams])

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    if (localFilters.query) params.set('query', localFilters.query)
    if (localFilters.location) params.set('location', localFilters.location)
    if (localFilters.cuisine && localFilters.cuisine !== 'all') params.set('cuisine', localFilters.cuisine)
    if (localFilters.priceRange && localFilters.priceRange !== 'all') params.set('priceRange', localFilters.priceRange)
    
    setSearchParams(params)
    
    const filters: any = {}
    if (localFilters.query) filters.query = localFilters.query
    if (localFilters.location) filters.location = localFilters.location
    if (localFilters.cuisine && localFilters.cuisine !== 'all') filters.cuisine = [localFilters.cuisine]
    if (localFilters.priceRange && localFilters.priceRange !== 'all') filters.priceRange = [localFilters.priceRange]
    
    setSearchFilters(filters)
  }

  const clearFilters = () => {
    setLocalFilters({ query: '', location: '', cuisine: '', priceRange: '' })
    setSearchParams({})
    setSearchFilters({})
  }

  const hasActiveFilters = Object.values(localFilters).some(value => value !== '')

  const cuisines = [
    { value: 'italian', label: t('cuisines.italian') },
    { value: 'nigerian', label: t('cuisines.nigerian') },
    { value: 'japanese', label: t('cuisines.japanese') },
    { value: 'chinese', label: t('cuisines.chinese') },
    { value: 'indian', label: t('cuisines.indian') },
    { value: 'american', label: t('cuisines.american') },
    { value: 'mexican', label: t('cuisines.mexican') },
    { value: 'french', label: t('cuisines.french') },
  ]

  const priceRanges = [
    { value: '$', label: t('priceRanges.budget') },
    { value: '$$', label: t('priceRanges.moderate') },
    { value: '$$$', label: t('priceRanges.expensive') },
    { value: '$$$$', label: t('priceRanges.veryExpensive') },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t('restaurants.title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('restaurants.subtitle')}
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              {t('restaurants.search')}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {t('common.filters')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('restaurants.searchPlaceholder')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('restaurants.searchPlaceholder')}
                  value={localFilters.query}
                  onChange={(e) => setLocalFilters({ ...localFilters, query: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('restaurants.location')}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('restaurants.locationPlaceholder')}
                  value={localFilters.location}
                  onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('restaurants.cuisine')}</label>
              <Select value={localFilters.cuisine} onValueChange={(value) => setLocalFilters({ ...localFilters, cuisine: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('restaurants.selectCuisine')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {cuisines.map((cuisine) => (
                    <SelectItem key={cuisine.value} value={cuisine.value}>
                      {cuisine.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('restaurants.priceRange')}</label>
              <Select value={localFilters.priceRange} onValueChange={(value) => setLocalFilters({ ...localFilters, priceRange: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('restaurants.selectPriceRange')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
            <Button onClick={handleSearch} size="lg" className="w-full md:w-auto">
              <Search className="mr-2 h-5 w-5" />
              {t('restaurants.searchButton')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {hasActiveFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">{t('common.activeFilters')}:</span>
                {localFilters.query && (
                  <Badge variant="secondary">
                    {t('restaurants.search')}: {localFilters.query}
                  </Badge>
                )}
                {localFilters.location && (
                  <Badge variant="secondary">
                    {t('restaurants.location')}: {localFilters.location}
                  </Badge>
                )}
                {localFilters.cuisine && (
                  <Badge variant="secondary">
                    {t('restaurants.cuisine')}: {cuisines.find(c => c.value === localFilters.cuisine)?.label}
                  </Badge>
                )}
                {localFilters.priceRange && (
                  <Badge variant="secondary">
                    {t('restaurants.priceRange')}: {priceRanges.find(r => r.value === localFilters.priceRange)?.label}
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                {t('common.clearAll')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            {isLoading ? t('common.loading') : `${restaurants.length} ${t('restaurants.results')}`}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
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

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
          {restaurants.map((restaurant) => (
            <RestaurantCard 
              key={restaurant.id} 
              restaurant={restaurant}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">{t('restaurants.noResults')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('restaurants.noResultsDescription')}
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters}>
              {t('restaurants.clearFilters')}
            </Button>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <QrCode className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium">{t('restaurants.scanQR')}</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Camera className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="text-sm font-medium">{t('restaurants.arView')}</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Navigation className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">{t('restaurants.nearby')}</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-sm font-medium">{t('restaurants.favorites')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
