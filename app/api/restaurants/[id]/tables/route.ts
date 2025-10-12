import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { tableSchema } from '@/lib/validations'

// GET /api/restaurants/[id]/tables - Get restaurant tables
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tables = await prisma.table.findMany({
      where: { restaurantId: params.id },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ tables })
  } catch (error) {
    console.error('Get tables error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/restaurants/[id]/tables - Create table
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, ['RESTAURANT_OWNER', 'ADMIN'])
    const body = await request.json()
    const validatedData = tableSchema.parse(body)

    // Check if user owns the restaurant or is admin
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    if (user.role !== 'ADMIN' && restaurant.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to manage this restaurant' },
        { status: 403 }
      )
    }

    const table = await prisma.table.create({
      data: {
        ...validatedData,
        restaurantId: params.id,
      },
    })

    return NextResponse.json({
      table,
      message: 'Table created successfully',
    })
  } catch (error) {
    console.error('Create table error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}