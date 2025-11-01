import { NextRequest, NextResponse } from 'next/server'
import { mockChefs } from '@/lib/mock-data/chefs'

// GET /api/chefs - Search and list chefs with advanced filtering (DEMO MODE)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Parse filters
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const specialty = searchParams.get('specialty')
    const eventType = searchParams.get('eventType')
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined
    const maxRate = searchParams.get('maxRate') ? parseFloat(searchParams.get('maxRate')!) : undefined
    const minExperience = searchParams.get('minExperience') ? parseInt(searchParams.get('minExperience')!) : undefined
    const isVerified = searchParams.get('isVerified') === 'true'
    const isFeatured = searchParams.get('isFeatured') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'rating'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Filter chefs based on criteria
    let filteredChefs = mockChefs.filter(chef => {
      if (city && !chef.city.toLowerCase().includes(city.toLowerCase())) return false
      if (state && !chef.state.toLowerCase().includes(state.toLowerCase())) return false
      if (specialty && !chef.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))) return false
      if (eventType && !chef.eventTypes.includes(eventType)) return false
      if (minRating && chef.rating < minRating) return false
      if (maxRate && chef.hourlyRate > maxRate) return false
      if (minExperience && chef.experienceYears < minExperience) return false
      if (isVerified && !chef.verified) return false
      if (isFeatured && !chef.featured) return false
      return true
    })
    
    // Sort chefs
    filteredChefs.sort((a, b) => {
      let valueA, valueB
      if (sortBy === 'rating') {
        valueA = a.rating
        valueB = b.rating
      } else if (sortBy === 'hourlyRate') {
        valueA = a.hourlyRate
        valueB = b.hourlyRate
      } else if (sortBy === 'experience') {
        valueA = a.experienceYears
        valueB = b.experienceYears
      } else {
        valueA = a.rating
        valueB = b.rating
      }
      
      if (sortOrder === 'desc') {
        return valueB - valueA
      } else {
        return valueA - valueB
      }
    })
    
    // Pagination
    const total = filteredChefs.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedChefs = filteredChefs.slice(startIndex, endIndex)
    
    return NextResponse.json({
      success: true,
      data: paginatedChefs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching chefs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chefs' },
      { status: 500 }
    )
  }
}
