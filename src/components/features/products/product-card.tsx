'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package, Plus } from 'lucide-react';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';
import { ProductPrice } from './product-price';
import { useAddToCartWithToast } from '@/components/features/cart/use-add-to-cart-with-toast';

interface ProductCardProps {
  product: Product;
  /** Passed to next/image; the default fits the catalogue grid. */
  sizes?: string;
  className?: string;
}

export function ProductCard({
  product,
  sizes = '(max-width: 767px) 50vw, (max-width: 1279px) 30vw, 22vw',
  className,
}: ProductCardProps) {
  const { add, isPending } = useAddToCartWithToast();
  const href = `/productos/${product.sku}`;

  return (
    <article className={cn('group flex flex-col', className)}>
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden rounded-lg bg-gray-100"
        tabIndex={-1}
        aria-hidden
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            fill
            // Product photos have white backgrounds: multiply blends them into the well
            className="object-contain p-3 mix-blend-multiply transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:p-5"
            sizes={sizes}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-gray-300" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <h3 className="text-sm leading-snug text-gray-800 line-clamp-2 sm:text-[15px]">
          <Link href={href} className="hover:text-gray-950 hover:underline underline-offset-2">
            {product.name}
          </Link>
        </h3>

        <ProductPrice
          price={product.price}
          listPrice={product.listPrice}
          size="sm"
          className="mt-auto pt-2"
        />

        <button
          type="button"
          onClick={() => add(product)}
          disabled={!product.isActive || isPending}
          aria-label={`Agregar ${product.name} al carrito`}
          className={cn(
            'mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border text-sm font-semibold transition-colors',
            'border-[var(--color-primary)] text-[var(--color-primary-ink)] hover:bg-[var(--color-primary)] hover:text-white',
            'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary-100)]',
            'disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent',
            isPending && 'disabled:border-[var(--color-primary)] disabled:text-[var(--color-primary-ink)]'
          )}
        >
          {isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
          ) : (
            product.isActive && <Plus className="h-4 w-4" aria-hidden />
          )}
          {product.isActive ? 'Agregar' : 'No disponible'}
        </button>
      </div>
    </article>
  );
}
