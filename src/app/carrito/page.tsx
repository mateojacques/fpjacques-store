'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Badge, Button, Spinner, Card } from '@/components/ui';
import {
  UnavailableItemsNotice,
  countUnavailableItems,
  isItemUnavailable,
} from '@/components/features/cart';
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '@/hooks/use-cart';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice, cn } from '@/lib/utils';
import { ProductPrice } from '@/components/features/products/product-price';

export default function CartPage() {
  const { data: cartData, isLoading } = useCart({ fresh: true });
  const { cart, setCart } = useCartStore();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  // Sync cart data with store
  useEffect(() => {
    if (cartData?.data) {
      setCart(cartData.data);
    }
  }, [cartData, setCart]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const isEmpty = !cart?.items || cart.items.length === 0;
  const unavailableCount = countUnavailableItems(cart);

  if (isEmpty) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-gray-300" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">El carrito está vacío</h1>
        <p className="mt-2 text-gray-500">No hay productos agregados.</p>
        <Link href="/productos">
          <Button className="mt-6">
            Ver productos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItem.mutate({ itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem.mutate(itemId);
  };

  const handleClearCart = () => {
    if (confirm('¿Vaciar el carrito?')) {
      clearCart.mutate();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Carrito</h1>
        <Button variant="ghost" onClick={handleClearCart} className="text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4 mr-2" />
          Vaciar carrito
        </Button>
      </div>

      <UnavailableItemsNotice count={unavailableCount} className="mb-6" />

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-8">
          <Card padding="none">
            <ul className="divide-y divide-gray-200">
              {cart?.items.map((item) => {
                const effectivePrice = parseFloat(item.priceAtAdd);
                const itemTotal = effectivePrice * item.quantity;
                const unavailable = isItemUnavailable(item);

                return (
                  <li key={item.id} className={cn('p-4 sm:p-6', unavailable && 'bg-yellow-50/60')}>
                    <div className="flex gap-4 sm:gap-6">
                      {/* Product Image */}
                      <Link
                        href={`/productos/${item.product.sku}`}
                        className={cn(
                          'relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100',
                          unavailable && 'pointer-events-none opacity-50'
                        )}
                        aria-disabled={unavailable}
                        tabIndex={unavailable ? -1 : undefined}
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
                            <ShoppingBag className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        {unavailable ? (
                          <p className="text-base sm:text-lg font-medium text-gray-500 line-clamp-2">
                            {item.product.name}
                          </p>
                        ) : (
                          <Link
                            href={`/productos/${item.product.sku}`}
                            className="text-base sm:text-lg font-medium text-gray-900 hover:text-[var(--color-primary)] line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                        )}
                        <p className="mt-1 text-sm text-gray-500">SKU: {item.product.sku}</p>
                        {unavailable ? (
                          <Badge variant="warning" size="md" className="mt-2">
                            No disponible
                          </Badge>
                        ) : (
                          <ProductPrice
                            price={item.priceAtAdd}
                            listPrice={item.listPrice}
                            showLabel={false}
                            className="mt-2"
                          />
                        )}

                        {/* Mobile Actions */}
                        <div className="mt-4 flex items-center justify-between sm:hidden">
                          <div className={cn('flex items-center border border-gray-300 rounded-lg', unavailable && 'invisible')}>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-2 text-gray-600 disabled:opacity-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-3 text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-2 text-gray-600"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600"
                            aria-label="Quitar del carrito"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Desktop Actions */}
                      <div className="hidden sm:flex flex-col items-end justify-between">
                        <div className={cn('flex items-center border border-gray-300 rounded-lg', unavailable && 'invisible')}>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 text-gray-600 disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-gray-600"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          {!unavailable && (
                            <span className="text-lg font-medium text-gray-900">
                              {formatPrice(itemTotal)}
                            </span>
                          )}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            aria-label="Quitar del carrito"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <Card className="sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h2>

            <div className="flex justify-between text-base font-medium">
              <span className="text-gray-900">Total estimado</span>
              <span className="text-gray-900">{formatPrice(cart?.subtotal || '0')}</span>
            </div>

            {unavailableCount > 0 ? (
              <>
                <Button className="w-full mt-6" size="lg" disabled>
                  Continuar con el pedido
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="mt-2 text-sm text-gray-600">
                  Quite los productos no disponibles para continuar.
                </p>
              </>
            ) : (
              <Link href="/checkout" className="block mt-6">
                <Button className="w-full" size="lg">
                  Continuar con el pedido
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}

            <Link
              href="/productos"
              className="block mt-3 text-center text-sm text-[var(--color-primary)] hover:opacity-80"
            >
              Ver productos
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
