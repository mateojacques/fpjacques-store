'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { CarouselWithProducts } from '@/types';
import { Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/features/products/product-card';

interface ProductCarouselProps {
  carousel: CarouselWithProducts;
}

export function ProductCarousel({ carousel }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollButtons);
      }
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [carousel.products]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!carousel.products || carousel.products.length === 0) {
    return null;
  }

  // Determine the link for "Ver todos"
  const viewAllLink = carousel.type === 'category' && carousel.categoryId
    ? `/productos?categoryId=${carousel.categoryId}`
    : `/productos`;

  return (
    <section className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-semibold text-gray-900">
            {carousel.name}
          </h2>
          {carousel.description && (
            <p className="mt-1 text-sm text-gray-500">{carousel.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Navigation Buttons - Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={cn(
                'p-2 rounded-full border transition-colors',
                canScrollLeft
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
              )}
              aria-label="Anteriores"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={cn(
                'p-2 rounded-full border transition-colors',
                canScrollRight
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
              )}
              aria-label="Siguientes"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* View All Link */}
          <Link
            href={viewAllLink}
            className="hidden sm:flex items-center text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity"
          >
            Ver todos
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-6 lg:px-8 pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {carousel.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              sizes="(max-width: 640px) 168px, (max-width: 768px) 208px, 232px"
              className="w-[168px] flex-shrink-0 sm:w-[208px] md:w-[232px]"
            />
          ))}
        </div>
      </div>

      {/* View All - Mobile */}
      <div className="sm:hidden px-4 mt-4">
        <Link
          href={viewAllLink}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-800 active:bg-gray-50"
        >
          Ver todos los productos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

// Skeleton component for loading state
export function ProductCarouselSkeleton() {
  return (
    <section className="py-8">
      <div className="px-4 sm:px-6 lg:px-8 mb-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-64 mt-2" />
      </div>
      <div className="flex gap-4 overflow-hidden px-4 sm:px-6 lg:px-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[168px] sm:w-[208px] md:w-[232px]"
          >
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-4 w-3/4 mt-3" />
            <Skeleton className="h-4 w-1/2 mt-2" />
            <Skeleton className="h-9 w-full mt-3" />
          </div>
        ))}
      </div>
    </section>
  );
}
