'use client';

import { useAddToCart } from '@/hooks/use-cart';
import { useToast, type Toast } from '@/components/ui/toast';
import { useCartStore } from '@/stores/cart-store';

const TOAST_KEY = 'cart-added';

interface AddedMeta {
  names: string[];
  units: number;
}

/**
 * Adds a product to the cart and reports it in a single toast: adding
 * several products in a row updates that toast instead of stacking new ones.
 */
export function useAddToCartWithToast() {
  const addToCart = useAddToCart();
  const { upsertToast, error } = useToast();
  const openCart = useCartStore((state) => state.openCart);

  const add = async (product: { id: string; name: string }, quantity = 1) => {
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity });
    } catch {
      error('No se pudo agregar el producto', 'Intente de nuevo en unos segundos.');
      return false;
    }

    upsertToast(TOAST_KEY, (previous: Toast | undefined) => {
      const prev = previous?.meta as AddedMeta | undefined;
      const names = prev ? [...prev.names.filter((n) => n !== product.name), product.name] : [product.name];
      const units = (prev?.units ?? 0) + quantity;
      return {
        type: 'success',
        title: names.length === 1 ? 'Agregado al carrito' : `${names.length} productos agregados al carrito`,
        message: describe(names, units),
        action: { label: 'Ver carrito', onClick: openCart },
        meta: { names, units } satisfies AddedMeta,
      };
    });
    return true;
  };

  return { add, isPending: addToCart.isPending };
}

/** "Lápiz HB", "Lápiz HB (3 unidades)" or "Último: Cuaderno A4" for several products. */
function describe(names: string[], units: number): string {
  const last = names[names.length - 1];
  if (names.length > 1) return `Último: ${last}`;
  return units > 1 ? `${last} (${units} unidades)` : last;
}
