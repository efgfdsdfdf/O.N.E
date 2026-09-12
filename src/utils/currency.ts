import { CURRENCY_SYMBOL } from '@/lib/constants';

export function formatNaira(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Price on request';
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-NG')}`;
}

export function formatCompactPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Price on request';
  if (amount >= 1_000_000_000) {
    return `${CURRENCY_SYMBOL}${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `${CURRENCY_SYMBOL}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${CURRENCY_SYMBOL}${(amount / 1_000).toFixed(0)}K`;
  }
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-NG')}`;
}
