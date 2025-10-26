import { NextRequest, NextResponse } from 'next/server';
import { CurrencyService } from '@/lib/i18n/currency-service';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';

export const dynamic = 'force-dynamic';

/**
 * GET /api/i18n/currency
 * Get currency information and conversion rates
 * 
 * Query params:
 * - from: string (required) - source currency code (USD, NGN, EUR, etc.)
 * - to: string (optional) - target currency code(s), comma-separated
 * - amount: number (optional) - amount to convert
 * - locale: string (optional) - locale for formatting
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const amountStr = searchParams.get('amount');
    const locale = searchParams.get('locale');

    // Validate required parameters
    if (!from) {
      return NextResponse.json(
        { error: 'Missing required parameter: from' },
        { status: 400 }
      );
    }

    const currencyService = CurrencyService.getInstance();
    
    // If no conversion target specified, return exchange rates for the source currency
    if (!to) {
      const rates = await currencyService.getExchangeRates(from.toUpperCase());
      
      return NextResponse.json({
        baseCurrency: from.toUpperCase(),
        rates,
        timestamp: new Date().toISOString(),
        supportedCurrencies: SUPPORTED_LOCALES.map(l => l.currency).filter(Boolean)
      });
    }

    // Convert currency
    const targetCurrencies = to.split(',').map(c => c.trim().toUpperCase());
    const amount = amountStr ? parseFloat(amountStr) : 1;

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number.' },
        { status: 400 }
      );
    }

    const conversions: Record<string, any> = {};

    for (const targetCurrency of targetCurrencies) {
      try {
        const convertedAmount = await currencyService.convertCurrency(
          amount,
          from.toUpperCase(),
          targetCurrency
        );

        const formattedAmount = locale
          ? currencyService.formatCurrency(convertedAmount, targetCurrency, locale)
          : currencyService.formatCurrency(convertedAmount, targetCurrency);

        conversions[targetCurrency] = {
          amount: convertedAmount,
          formatted: formattedAmount,
          currency: targetCurrency
        };
      } catch (error) {
        console.error(`Failed to convert ${from} to ${targetCurrency}:`, error);
        conversions[targetCurrency] = {
          error: 'Conversion failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      from: from.toUpperCase(),
      amount,
      conversions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing currency request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process currency request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/i18n/currency/rates
 * Get all exchange rates for a base currency
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { baseCurrency = 'USD' } = body;

    const currencyService = CurrencyService.getInstance();
    const rates = await currencyService.getExchangeRates(baseCurrency.toUpperCase());

    return NextResponse.json({
      baseCurrency: baseCurrency.toUpperCase(),
      rates,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch exchange rates',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
