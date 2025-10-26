/**
 * Delivery Payment Processing API
 * Handle delivery-specific payments with Nigerian payment gateways
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

// POST /api/delivery/payment/initiate - Initiate delivery payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, paymentMethod, provider } = body;

    const order = await prisma.deliveryOrder.findUnique({
      where: { id: orderId },
      include: {
        restaurant: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 400 }
      );
    }

    // Initialize payment based on provider
    let paymentData;

    if (provider === 'paystack') {
      paymentData = await initiatePaystackPayment(order);
    } else if (provider === 'flutterwave') {
      paymentData = await initiateFlutterwavePayment(order);
    } else {
      return NextResponse.json(
        { error: 'Unsupported payment provider' },
        { status: 400 }
      );
    }

    // Update order with payment info
    await prisma.deliveryOrder.update({
      where: { id: orderId },
      data: {
        paymentMethod: provider,
      },
    });

    return NextResponse.json({
      paymentData,
      message: 'Payment initiated',
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}

// Paystack payment initialization
async function initiatePaystackPayment(order: any) {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecretKey) {
    throw new Error('Paystack secret key not configured');
  }

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: order.user.email,
      amount: Math.round(order.totalAmount * 100), // Convert to kobo
      currency: order.currency || 'NGN',
      reference: `delivery_${order.orderNumber}_${Date.now()}`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/delivery/payment/callback`,
      metadata: {
        order_id: order.id,
        order_number: order.orderNumber,
        restaurant_name: order.restaurant.name,
        custom_fields: [
          {
            display_name: 'Order Number',
            variable_name: 'order_number',
            value: order.orderNumber,
          },
          {
            display_name: 'Restaurant',
            variable_name: 'restaurant',
            value: order.restaurant.name,
          },
        ],
      },
      channels: ['card', 'bank', 'ussd', 'mobile_money', 'bank_transfer'],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to initialize Paystack payment');
  }

  const data = await response.json();

  return {
    provider: 'paystack',
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  };
}

// Flutterwave payment initialization
async function initiateFlutterwavePayment(order: any) {
  const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;

  if (!flutterwaveSecretKey) {
    throw new Error('Flutterwave secret key not configured');
  }

  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${flutterwaveSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: `delivery_${order.orderNumber}_${Date.now()}`,
      amount: order.totalAmount,
      currency: order.currency || 'NGN',
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/delivery/payment/callback`,
      customer: {
        email: order.user.email,
        name: order.contactName,
        phonenumber: order.contactPhone,
      },
      customizations: {
        title: 'Delivery Order Payment',
        description: `Payment for order #${order.orderNumber}`,
        logo: order.restaurant.coverImage || order.restaurant.images?.[0],
      },
      meta: {
        order_id: order.id,
        order_number: order.orderNumber,
        restaurant_id: order.restaurantId,
        restaurant_name: order.restaurant.name,
      },
      payment_options: 'card,banktransfer,mobilemoney,ussd',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to initialize Flutterwave payment');
  }

  const data = await response.json();

  return {
    provider: 'flutterwave',
    paymentUrl: data.data.link,
    reference: data.data.tx_ref,
  };
}

// POST /api/delivery/payment/verify - Verify payment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, provider } = body;

    let paymentVerified = false;
    let paymentData;

    if (provider === 'paystack') {
      paymentData = await verifyPaystackPayment(reference);
      paymentVerified = paymentData.status === 'success';
    } else if (provider === 'flutterwave') {
      paymentData = await verifyFlutterwavePayment(reference);
      paymentVerified = paymentData.status === 'successful';
    } else {
      return NextResponse.json(
        { error: 'Unsupported payment provider' },
        { status: 400 }
      );
    }

    if (!paymentVerified) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Extract order ID from metadata
    const orderId = paymentData.metadata?.order_id || paymentData.meta?.order_id;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID not found in payment data' },
        { status: 400 }
      );
    }

    // Update order payment status
    const order = await prisma.deliveryOrder.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
        status: order?.status === 'pending' ? 'confirmed' : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      order,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

async function verifyPaystackPayment(reference: string) {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to verify Paystack payment');
  }

  const data = await response.json();
  return data.data;
}

async function verifyFlutterwavePayment(reference: string) {
  const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;

  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`,
    {
      headers: {
        'Authorization': `Bearer ${flutterwaveSecretKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to verify Flutterwave payment');
  }

  const data = await response.json();
  return data.data;
}
