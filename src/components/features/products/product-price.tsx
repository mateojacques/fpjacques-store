import { cn, formatPrice } from '@/lib/utils';

const sizes = {
  sm: { price: 'text-base', list: 'text-xs' },
  md: { price: 'text-lg', list: 'text-sm' },
  lg: { price: 'text-3xl', list: 'text-xl' },
} as const;

interface ProductPriceProps {
  /** The price to pay, as the API gives it. */
  price: string | number;
  /** The regular price, crossed out, while a sale price applies. */
  listPrice?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}

export function ProductPrice({ price, listPrice, size = 'md', className }: ProductPriceProps) {
  const s = sizes[size];

  return (
    <div className={className}>
      <div className="flex items-baseline gap-2">
        <span className={cn('font-bold tabular-nums text-gray-950', s.price)}>
          {formatPrice(price)}
        </span>
        {listPrice && (
          <span className={cn('tabular-nums text-gray-500 line-through', s.list)}>{formatPrice(listPrice)}</span>
        )}
      </div>
    </div>
  );
}
