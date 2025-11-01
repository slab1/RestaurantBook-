'use client'

import { useState, useMemo } from 'react'
import { Search, MapPin, Star, Clock, Award, Filter, ChevronDown, Heart, CheckCircle, ChefHat } from 'lucide-react'
import Link from 'next/link'
import { mockChefs, eventTypes, priceRanges, getAvailableChefs, getChefsByLocation, getChefsBySpecialty, getFeaturedChefs, calculateBookingPrice } from '@/lib/chef-demo-data'

export default function ChefsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
  const [selectedEventType, setSelectedEventType] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  // Get unique locations and specialties
  const locations = Array.from(new Set(mockChefs.map(chef => chef.location))).sort()
  const specialties = Array.from(new Set(mockChefs.flatMap(chef => chef.specialties))).sort()

  // Filter and sort chefs
  const filteredChefs = useMemo(() => {
    let filtered = mockChefs

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(chef =>
        chef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chef.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        chef.bio.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(chef => 
        chef.location.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    }

    // Specialty filter
    if (selectedSpecialty) {
      filtered = filtered.filter(chef =>
        chef.specialties.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase()))
      )
    }

    // Price range filter
    if (selectedPriceRange) {
      const range = priceRanges.find(r => r.id === selectedPriceRange)
      if (range) {
        filtered = filtered.filter(chef => 
          chef.hourlyRate >= range.min && chef.hourlyRate <= range.max
        )
      }
    }

    // Availability filter (check for next 7 days)
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    filtered = filtered.filter(chef => {
      const availableDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        return date.toISOString().split('T')[0]
      })
      
      return availableDates.some(date => {
        const morningAvailable = getAvailableChefs(date, '09:00', '13:00').some(c => c.id === chef.id)
        const afternoonAvailable = getAvailableChefs(date, '14:00', '18:00').some(c => c.id === chef.id)
        return morningAvailable || afternoonAvailable
      })
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'price-low':
          return a.hourlyRate - b.hourlyRate
        case 'price-high':
          return b.hourlyRate - a.hourlyRate
        case 'experience':
          return b.experience - a.experience
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedLocation, selectedSpecialty, selectedPriceRange, sortBy])

  const toggleFavorite = (chefId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(chefId)) {
        newFavorites.delete(chefId)
      } else {
        newFavorites.add(chefId)
      }
      return newFavorites
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedLocation('')
    setSelectedSpecialty('')
    setSelectedPriceRange('')
    setSelectedEventType('')
    setSortBy('rating')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleBookChef = (chefId: string) => {
    // Navigate to chef profile page
    window.location.href = `/chefs/${chefId}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 flex items-center">
                <ChefHat className="mr-3 w-10 h-10" />
                Chef Warehouse
              </h1>
              <p className="text-xl opacity-90">
                Book professional chefs for your events, parties, and private dining
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-75">Demo Mode</div>
                <div className="text-lg font-semibold">Live Chef Marketplace</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search chefs by name, specialty, or cuisine..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="">All Locations</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {getFeaturedChefs().slice(0, 3).map(chef => (
                <button
                  key={chef.id}
                  onClick={() => setSearchTerm(chef.name)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                >
                  {chef.name}
                </button>
              ))}
              {['Nigerian', 'Italian', 'Continental'].map(specialty => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {specialty}
                </button>
              ))}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  <option value="">All Specialties</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                >
                  <option value="">All Prices</option>
                  {priceRanges.map((range) => (
                    <option key={range.id} value={range.id}>{range.label}</option>
                  ))}
                </select>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="experience">Most Experienced</option>
                </select>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      checked={false}
                      className="rounded text-blue-600"
                      readOnly
                    />
                    Verified Only
                  </label>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(selectedLocation || selectedSpecialty || selectedPriceRange) && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {selectedLocation && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Location: {selectedLocation}
                      <button
                        onClick={() => setSelectedLocation('')}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedSpecialty && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Specialty: {selectedSpecialty}
                      <button
                        onClick={() => setSelectedSpecialty('')}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedPriceRange && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Price: {priceRanges.find(r => r.id === selectedPriceRange)?.label}
                      <button
                        onClick={() => setSelectedPriceRange('')}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredChefs.length} of {mockChefs.length} Chefs Available
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-full mb-4"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredChefs.length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="mx-auto w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No chefs found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or clearing some filters.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChefs.map((chef) => (
              <ChefCard 
                key={chef.id} 
                chef={chef} 
                isFavorite={favorites.has(chef.id)}
                onToggleFavorite={() => toggleFavorite(chef.id)}
                onBook={() => handleBookChef(chef.id)}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Chef Card Component
interface ChefCardProps {
  chef: any
  isFavorite: boolean
  onToggleFavorite: () => void
  onBook: () => void
  formatCurrency: (amount: number) => string
}

const ChefCard: React.FC<ChefCardProps> = ({ 
  chef, 
  isFavorite, 
  onToggleFavorite, 
  onBook, 
  formatCurrency 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Header Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
        <ChefHat className="w-16 h-16 text-white" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {chef.isFeatured && (
            <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Award className="w-3 h-3" />
              Featured
            </span>
          )}
          {chef.isVerified && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-white'}`} />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{chef.name}</h3>
            <p className="text-sm text-gray-600">{chef.specialties.join(', ')}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
            <span className="font-semibold text-gray-900">{chef.rating}</span>
            <span className="ml-1">({chef.totalReviews} reviews)</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{chef.experience} years exp.</span>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{chef.location} • {chef.travelRadius}km radius</span>
        </div>
        
        <p className="text-gray-700 text-sm line-clamp-3 mb-4">
          {chef.bio}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {chef.specialties.slice(0, 3).map((specialty, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {specialty}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <span className="text-sm text-gray-500">From</span>
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(chef.hourlyRate)}/hr
            </div>
          </div>
          <button
            onClick={onBook}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  )
}
