import { AlertTriangle } from 'lucide-react';
import type { Cart, CartItem } from '@/types';
import { cn } from '@/lib/utils';

/** An item the checkout would refuse. Older API responses without the flag count as available. */
export function isItemUnavailable(item: CartItem): boolean {
  return item.isAvailable === false;
}

export function countUnavailableItems(cart: Cart | null | undefined): number {
  return cart?.items.filter(isItemUnavailable).length ?? 0;
}

/** Tells the customer to remove unavailable products before continuing with the order. */
export function UnavailableItemsNotice({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count === 0) return null;

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900',
        className
      )}
    >
      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
      <div>
        <p className="font-medium">
          {count === 1
            ? 'Un producto del carrito ya no está disponible.'
            : `${count} productos del carrito ya no están disponibles.`}
        </p>
        <p className="mt-1">
          Para continuar con el pedido, quite del carrito los productos marcados como no
          disponibles.
        </p>
      </div>
    </div>
  );
}
