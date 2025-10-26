'use client';

import React, { useState } from 'react';
import { DollarSign, ChevronDown, Check } from 'lucide-react';
import { useCurrency } from '@/lib/i18n/i18n-context';
import { CurrencyService } from '@/lib/i18n/currency-service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const currencies = CurrencyService.getAllCurrencies();
  const currentCurrencyInfo = CurrencyService.getCurrencyInfo(currency);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <DollarSign className="h-4 w-4" />
        <span className="font-medium">{currentCurrencyInfo.code}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <Card className="absolute right-0 mt-2 w-64 max-h-[400px] overflow-y-auto z-50 shadow-lg">
            <div className="p-2 space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                Select Currency
              </div>
              {currencies.map((curr) => {
                const isActive = currency === curr.code;

                return (
                  <button
                    key={curr.code}
                    onClick={() => handleCurrencyChange(curr.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl font-bold">{curr.symbol}</span>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{curr.code}</span>
                        <span className="text-xs opacity-70">{curr.name}</span>
                      </div>
                    </div>
                    {isActive && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

/**
 * Compact currency selector for mobile
 */
export function CompactCurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const currencies = CurrencyService.getAllCurrencies();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(event.target.value);
  };

  return (
    <div className="relative">
      <select
        value={currency}
        onChange={handleChange}
        className="appearance-none bg-muted border border-border rounded-lg px-8 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {currencies.map((curr) => (
          <option key={curr.code} value={curr.code}>
            {curr.symbol} {curr.code} - {curr.name}
          </option>
        ))}
      </select>
      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
    </div>
  );
}

/**
 * Currency comparison display for Nigerian users
 */
export function CurrencyComparison({ amount }: { amount: number }) {
  const { currency } = useCurrency();

  // Show NGN comparison if not already in NGN
  if (currency === 'NGN') {
    return null;
  }

  const ngnAmount = CurrencyService.convert(amount, currency, 'NGN');
  const formattedNGN = CurrencyService.formatNaira(ngnAmount, true);

  return (
    <div className="text-sm text-muted-foreground mt-1">
      Approximately {formattedNGN} in Nigerian Naira
    </div>
  );
}

/**
 * Price display with currency
 */
export function PriceDisplay({ amount, showComparison = false }: { amount: number; showComparison?: boolean }) {
  const { formatPrice } = useCurrency();

  return (
    <div>
      <span className="text-lg font-bold">{formatPrice(amount)}</span>
      {showComparison && <CurrencyComparison amount={amount} />}
    </div>
  );
}
