'use client';

import { X } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { cn } from '@/lib/utils';

/**
 * After a repeated order, lists the products that could not be added. Shown on
 * the cart page until dismissed, the next repeat, logout or a reload. (Not
 * cleared on unmount: Strict Mode's double mount would wipe it at once.)
 */
export function RepeatSkippedNotice({ className }: { className?: string }) {
  const skipped = useCartStore((state) => state.repeatSkipped);
  const setRepeatSkipped = useCartStore((state) => state.setRepeatSkipped);

  if (skipped.length === 0) return null;

  return (
    <div
      className={cn(
        'relative rounded-lg border border-amber-200 bg-amber-50 p-4 pr-10 text-left text-sm text-amber-800',
        className
      )}
      role="status"
    >
      <p className="font-medium">
        Estos productos ya no están disponibles y no se agregaron:
      </p>
      <ul className="mt-2 list-disc pl-5">
        {skipped.map((line) => (
          <li key={`${line.productSku}-${line.productName}`}>
            {line.productName} <span className="text-amber-700">(SKU {line.productSku})</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setRepeatSkipped([])}
        className="absolute right-3 top-3 text-amber-700 hover:text-amber-900"
        aria-label="Cerrar aviso"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
