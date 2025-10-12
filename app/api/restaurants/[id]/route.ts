import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { restaurantSchema } from '@/lib/validations'
import { GoogleMapsService, WeatherService } from '@/lib/external-apis'

// GET /api/restaurants/[id] - Get restaurant details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
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
        operatingHours: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
        reviews: {
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
            bookings: true,
          },
        },
      },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Get weather data if coordinates are available
    let weather = null
    if (restaurant.latitude && restaurant.longitude) {
      weather = await WeatherService.getCurrentWeather(
        restaurant.latitude,
        restaurant.longitude
      )
    }

    return NextResponse.json({
      restaurant: {
        ...restaurant,
        weather,
      },
    })
  } catch (error) {
    console.error('Get restaurant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/restaurants/[id] - Update restaurant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, ['RESTAURANT_OWNER', 'ADMIN'])
    const body = await request.json()
    const validatedData = restaurantSchema.parse(body)

    // Check if user owns the restaurant or is admin
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
    })

    if (!existingRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    if (user.role !== 'ADMIN' && existingRestaurant.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this restaurant' },
        { status: 403 }
      )
    }

    // Geocode address if it changed
    let coordinates = {
      latitude: existingRestaurant.latitude,
      longitude: existingRestaurant.longitude,
    }

    if (validatedData.address !== existingRestaurant.address) {
      const geocodeResult = await GoogleMapsService.geocodeAddress(validatedData.address)
      if (geocodeResult) {
        coordinates = {
          latitude: geocodeResult.latitude,
          longitude: geocodeResult.longitude,
        }
      }
    }

    const restaurant = await prisma.restaurant.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        ...coordinates,
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
      message: 'Restaurant updated successfully',
    })
  } catch (error) {
    console.error('Update restaurant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/restaurants/[id] - Delete restaurant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, ['RESTAURANT_OWNER', 'ADMIN'])

    // Check if user owns the restaurant or is admin
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
    })

    if (!existingRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    if (user.role !== 'ADMIN' && existingRestaurant.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this restaurant' },
        { status: 403 }
      )
    }

    await prisma.restaurant.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Restaurant deleted successfully',
    })
  } catch (error) {
    console.error('Delete restaurant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}