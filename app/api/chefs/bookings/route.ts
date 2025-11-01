import { NextRequest, NextResponse } from 'next/server'
import { mockChefs, mockBookings } from '@/lib/mock-data/chefs'

// POST /api/chefs/bookings - Create a new chef booking (DEMO MODE)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customerId,
      chefId,
      eventType,
      serviceType,
      eventDate,
      startTime,
      endTime,
      durationHours,
      partySize,
      eventAddress,
      eventCity,
      eventState,
      cuisinePreference,
      menuDetails,
      dietaryRestrictions,
      allergies,
      specialRequests,
      equipmentProvided,
      equipmentNeeded,
      servingStyle,
    } = body

    // Get chef details for pricing
    const chef = mockChefs.find(c => c.id === chefId)

    if (!chef) {
      return NextResponse.json(
        { success: false, error: 'Chef not found' },
        { status: 404 }
      )
    }

    // Calculate pricing
    const basePrice = chef.hourlyRate * (durationHours || 4)
    const platformFeeRate = 0.12 // 12% platform fee
    const travelFee = 10000 // Fixed travel fee for demo
    const equipmentFee = 0
    const subtotal = basePrice + travelFee + equipmentFee
    const platformFee = subtotal * platformFeeRate
    const totalAmount = subtotal + platformFee
    const depositAmount = totalAmount * 0.30 // 30% deposit

    // Generate booking number
    const bookingNumber = `CHF${Date.now()}${Math.floor(Math.random() * 1000)}`

    // Create booking object
    const booking = {
      id: `booking-${Date.now()}`,
      bookingNumber,
      customerId: customerId || 'demo-customer',
      customerName: 'Demo Customer',
      chefId,
      eventType,
      serviceType,
      eventDate,
      startTime,
      endTime,
      durationHours: durationHours || 4,
      partySize,
      eventAddress,
      eventCity,
      eventState,
      cuisinePreference,
      menuDetails,
      dietaryRestrictions,
      allergies,
      specialRequests,
      equipmentProvided,
      equipmentNeeded,
      servingStyle,
      basePrice,
      travelFee,
      equipmentFee,
      subtotal,
      platformFee,
      totalAmount,
      currency: 'NGN',
      depositAmount,
      remainingAmount: totalAmount - depositAmount,
      status: 'PENDING',
      source: 'web',
      createdAt: new Date().toISOString(),
      chef: {
        businessName: chef.businessName,
        profileImage: chef.profileImage,
        rating: chef.rating,
      },
    }

    // Store in localStorage (handled by frontend)
    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Booking request created successfully (DEMO MODE)',
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

// GET /api/chefs/bookings - Get bookings (DEMO MODE)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const customerId = searchParams.get('customerId')
    const chefId = searchParams.get('chefId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Filter mock bookings
    let filteredBookings = [...mockBookings]
    if (customerId) filteredBookings = filteredBookings.filter(b => b.customerId === customerId)
    if (chefId) filteredBookings = filteredBookings.filter(b => b.chefId === chefId)
    if (status) filteredBookings = filteredBookings.filter(b => b.status === status)

    const total = filteredBookings.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex)

    // Enrich bookings with chef data
    const enrichedBookings = paginatedBookings.map(booking => ({
      ...booking,
      chef: mockChefs.find(c => c.id === booking.chefId),
    }))

    return NextResponse.json({
      success: true,
      data: enrichedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
