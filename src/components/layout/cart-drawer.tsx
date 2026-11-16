'use client';

import { useEffect } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart-store';
import { Badge, Button, Spinner } from '@/components/ui';
import {
  UnavailableItemsNotice,
  countUnavailableItems,
  isItemUnavailable,
} from '@/components/features/cart';
import { formatPrice } from '@/lib/utils';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const { isOpen, closeCart, cart, setCart } = useCartStore();
  const { data: cartData, isLoading, refetch } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  // Sync cart data with store
  useEffect(() => {
    if (cartData?.data) {
      setCart(cartData.data);
    }
  }, [cartData, setCart]);

  // Check availability again each time the drawer opens
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItem.mutate({ itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem.mutate(itemId);
  };

  const isEmpty = !cart?.items || cart.items.length === 0;
  const unavailableCount = countUnavailableItems(cart);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Carrito
            {cart?.itemCount ? (
              <span className="text-sm font-normal text-gray-500">
                ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
              </span>
            ) : null}
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size="lg" />
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">El carrito está vacío</p>
              <p className="mt-1 text-sm text-gray-500">
                No hay productos agregados.
              </p>
              <Link href="/productos" onClick={closeCart}>
                <Button className="mt-6">
                  Ver productos
                </Button>
              </Link>
            </div>
          ) : (
            <>
            <UnavailableItemsNotice count={unavailableCount} className="m-4" />
            <ul className="divide-y divide-gray-200">
              {cart?.items.map((item) => {
                const effectivePrice = parseFloat(item.priceAtAdd);
                const itemTotal = effectivePrice * item.quantity;
                const unavailable = isItemUnavailable(item);

                return (
                  <li key={item.id} className={cn('px-4 py-4', unavailable && 'bg-yellow-50/60')}>
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div
                        className={cn(
                          'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100',
                          unavailable && 'opacity-50'
                        )}
                      >
                        {item.product.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ShoppingBag className="h-8 w-8 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        {unavailable ? (
                          <p className="text-sm font-medium text-gray-500 line-clamp-2">
                            {item.product.name}
                          </p>
                        ) : (
                          <Link
                            href={`/productos/${item.product.sku}`}
                            className="text-sm font-medium text-gray-900 hover:text-[var(--color-primary)] line-clamp-2"
                            onClick={closeCart}
                          >
                            {item.product.name}
                          </Link>
                        )}
                        <p className="mt-1 text-xs text-gray-500">SKU: {item.product.sku}</p>
                        {unavailable ? (
                          <Badge variant="warning" className="mt-1">
                            No disponible
                          </Badge>
                        ) : (
                          <p className="mt-1 text-sm font-medium text-[var(--color-primary)]">
                            {formatPrice(effectivePrice)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="mt-3 flex items-center justify-between">
                      <div
                        className={cn(
                          'flex items-center border border-gray-300 rounded-lg',
                          unavailable && 'invisible'
                        )}
                      >
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updateItem.isPending}
                          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updateItem.isPending}
                          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        {!unavailable && (
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(itemTotal)}
                          </span>
                        )}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removeItem.isPending}
                          className={cn(
                            'p-2 text-gray-400 hover:text-red-600 transition-colors',
                            removeItem.isPending && 'opacity-50'
                          )}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            </>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="border-t border-gray-200 px-4 py-4 space-y-4">
            <div className="flex items-center justify-between text-base font-medium">
              <span className="text-gray-900">Total estimado</span>
              <span className="text-gray-900">{formatPrice(cart?.subtotal || '0')}</span>
            </div>
            <p className="text-xs text-gray-500">
              Los precios y la entrega se confirman por WhatsApp.
            </p>
            <div className="flex flex-col gap-2">
              {unavailableCount > 0 ? (
                <Button className="w-full" disabled>
                  Continuar con el pedido
                </Button>
              ) : (
                <Link href="/checkout" onClick={closeCart} className="w-full">
                  <Button className="w-full">Continuar con el pedido</Button>
                </Link>
              )}
              <Link href="/carrito" onClick={closeCart} className="w-full">
                <Button variant="outline" className="w-full">Ver carrito</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
