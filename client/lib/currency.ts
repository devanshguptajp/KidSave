import { Currency } from '@shared/types';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
};

const CURRENCY_NAMES: Record<Currency, string> = {
  INR: 'Indian Rupees',
  USD: 'US Dollars',
};

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency];
}

export function getCurrencyName(currency: Currency): string {
  return CURRENCY_NAMES[currency];
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
}

export function formatCurrencyShort(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);
  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }
  return `${symbol}${Math.floor(amount)}`;
}

export function parseAmount(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}
