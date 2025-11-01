import { NextRequest, NextResponse } from 'next/server'
import { mockChefs } from '@/lib/mock-data/chefs'

// GET /api/admin/chefs - Admin: List all chefs with filters (DEMO MODE)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const city = searchParams.get('city')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Filter chefs
    let filteredChefs = [...mockChefs]
    
    if (city) {
      filteredChefs = filteredChefs.filter(c => 
        c.city.toLowerCase().includes(city.toLowerCase())
      )
    }
    
    if (search) {
      filteredChefs = filteredChefs.filter(c =>
        c.businessName.toLowerCase().includes(search.toLowerCase()) ||
        c.bio.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    const total = filteredChefs.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedChefs = filteredChefs.slice(startIndex, endIndex)
    
    // Add counts
    const enrichedChefs = paginatedChefs.map(chef => ({
      ...chef,
      _count: {
        bookings: Math.floor(Math.random() * 50) + 10,
        ratings: chef.totalReviews,
        portfolio: chef.portfolio.length,
      },
    }))
    
    return NextResponse.json({
      success: true,
      data: enrichedChefs,
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

// PATCH /api/admin/chefs - Admin: Update chef status (DEMO MODE)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { chefId, isFeatured, isVerified } = body

    const chefIndex = mockChefs.findIndex(c => c.id === chefId)
    
    if (chefIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Chef not found' },
        { status: 404 }
      )
    }

    // Update mock chef (in real app, this would persist to database)
    if (isFeatured !== undefined) mockChefs[chefIndex].featured = isFeatured
    if (isVerified !== undefined) mockChefs[chefIndex].verified = isVerified

    return NextResponse.json({
      success: true,
      data: mockChefs[chefIndex],
      message: 'Chef updated successfully (DEMO MODE)',
    })
  } catch (error) {
    console.error('Error updating chef:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update chef' },
      { status: 500 }
    )
  }
}
