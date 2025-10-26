import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json()

    if (!subscription) {
      return NextResponse.json(
        { error: 'Missing subscription' },
        { status: 400 }
      )
    }

    // Remove subscription from database
    // await db.pushNotification.delete({ where: { subscription: subscription.endpoint } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unsubscription error:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}