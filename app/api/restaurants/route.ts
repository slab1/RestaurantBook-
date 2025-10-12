import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { restaurantSchema } from '@/lib/validations'
import { GoogleMapsService } from '@/lib/external-apis'

// GET /api/restaurants - List all restaurants with optional search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const cuisine = searchParams.get('cuisine')
    const priceRange = searchParams.get('priceRange')
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {
      isActive: true,
    }

    // Add search filters
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { cuisine: { contains: query, mode: 'insensitive' } },
      ]
    }

    if (cuisine) {
      where.cuisine = { contains: cuisine, mode: 'insensitive' }
    }

    if (priceRange) {
      where.priceRange = priceRange
    }

    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        tables: {
          select: {
            id: true,
            name: true,
            capacity: true,
            isAvailable: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            bookings: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        rating: 'desc',
      },
    })

    // Calculate distance if user location is provided
    let restaurantsWithDistance = restaurants
    if (latitude && longitude) {
      const userLat = parseFloat(latitude)
      const userLng = parseFloat(longitude)
      
      restaurantsWithDistance = restaurants.map(restaurant => {
        const distance = restaurant.latitude && restaurant.longitude
          ? calculateDistance(userLat, userLng, restaurant.latitude, restaurant.longitude)
          : null
        
        return {
          ...restaurant,
          distance,
        }
      }).sort((a, b) => {
        if (a.distance === null) return 1
        if (b.distance === null) return -1
        return a.distance - b.distance
      })
    }

    const total = await prisma.restaurant.count({ where })

    return NextResponse.json({
      restaurants: restaurantsWithDistance,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get restaurants error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/restaurants - Create a new restaurant
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ['RESTAURANT_OWNER', 'ADMIN'])
    const body = await request.json()
    const validatedData = restaurantSchema.parse(body)

    // Geocode address to get coordinates
    const geocodeResult = await GoogleMapsService.geocodeAddress(validatedData.address)
    
    const restaurant = await prisma.restaurant.create({
      data: {
        ...validatedData,
        latitude: geocodeResult?.latitude,
        longitude: geocodeResult?.longitude,
        ownerId: user.id,
      },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        tables: true,
      },
    })

    return NextResponse.json({
      restaurant,
      message: 'Restaurant created successfully',
    })
  } catch (error) {
    console.error('Create restaurant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in kilometers
  return distance
}