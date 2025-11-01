import { NextRequest, NextResponse } from 'next/server'
import { mockChefs } from '@/lib/mock-data/chefs'

// GET /api/chefs/[id] - Get individual chef details (DEMO MODE)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chef = mockChefs.find(c => c.id === params.id)

    if (!chef) {
      return NextResponse.json(
        { success: false, error: 'Chef not found' },
        { status: 404 }
      )
    }

    // Calculate average ratings from reviews
    const avgRatings = chef.ratings.length > 0 ? {
      overallRating: chef.ratings.reduce((sum, r) => sum + r.overall, 0) / chef.ratings.length,
      foodQualityRating: chef.ratings.reduce((sum, r) => sum + r.foodQuality, 0) / chef.ratings.length,
      professionalismRating: chef.ratings.reduce((sum, r) => sum + r.professionalism, 0) / chef.ratings.length,
      communicationRating: chef.ratings.reduce((sum, r) => sum + r.communication, 0) / chef.ratings.length,
    } : null

    return NextResponse.json({
      success: true,
      data: {
        ...chef,
        averageRatings: avgRatings,
      },
    })
  } catch (error) {
    console.error('Error fetching chef details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chef details' },
      { status: 500 }
    )
  }
}
