'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { cn, formatPrice } from '@/lib/utils';

const sizes = {
  sm: { price: 'text-base', list: 'text-xs', note: 'text-xs' },
  md: { price: 'text-lg', list: 'text-sm', note: 'text-xs' },
  lg: { price: 'text-3xl', list: 'text-xl', note: 'text-sm' },
} as const;

interface ProductPriceProps {
  /** The price the API gave this viewer. */
  price: string | number;
  /** The general price, crossed out, when it's higher than `price`. */
  listPrice?: string | null;
  size?: keyof typeof sizes;
  /** Show "Precio mayorista" to a logged-in user. */
  showLabel?: boolean;
  /** Tell an anonymous visitor that registered institutions get wholesale prices. */
  showSignupHint?: boolean;
  className?: string;
}

export function ProductPrice({
  price,
  listPrice,
  size = 'md',
  showLabel = true,
  showSignupHint = false,
  className,
}: ProductPriceProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const s = sizes[size];

  return (
    <div className={className}>
      {isAuthenticated && showLabel && (
        <p className={cn('font-medium text-gray-500', s.note)}>Precio mayorista</p>
      )}
      <div className="flex items-baseline gap-2">
        <span className={cn('font-bold tabular-nums text-gray-950', s.price)}>
          {formatPrice(price)}
        </span>
        {listPrice && (
          <span className={cn('tabular-nums text-gray-500 line-through', s.list)}>{formatPrice(listPrice)}</span>
        )}
      </div>
      {!isAuthenticated && showSignupHint && (
        <Link
          href="/registro"
          className={cn('mt-1 inline-block text-gray-500 underline hover:text-[var(--color-primary)]', s.note)}
        >
          Precio mayorista para instituciones registradas
        </Link>
      )}
    </div>
  );
}
