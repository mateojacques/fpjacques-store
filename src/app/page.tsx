'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { HeroBanner } from '@/components/banners';
import { HomeSectionsRenderer } from '@/components/home';
import { ProductGrid } from '@/components/features/products/product-grid';
import { useHomeSections } from '@/hooks';

export default function HomePage() {
  const { sections, isLoading, hasContent } = useHomeSections();

  return (
    <>
      {/* Hero Banner */}
      <HeroBanner />

      {/* Dynamic Content: Interleaved Carousels & Slim Banners */}
      <section>
        <div className="mx-auto max-w-7xl">
          <HomeSectionsRenderer 
            sections={sections} 
            isLoading={isLoading}
            skeletonCount={4}
          />
        </div>
      </section>

      {/* Fallback: Featured Products Section (shown when no content configured) */}
      {!isLoading && !hasContent && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-900">
                  Productos Destacados
                </h2>
                <p className="mt-2 text-gray-600">
                  Los más vendidos
                </p>
              </div>
              <Link href="/productos" className="hidden sm:flex items-center text-[var(--color-primary)] hover:opacity-80 font-medium">
                Ver todos
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <ProductGrid limit={8} />
            
            <div className="mt-8 text-center sm:hidden">
              <Link href="/productos">
                <Button variant="outline">
                  Ver todos los productos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Instagram Feed Section -- TODO: config this */}
      {/* <InstagramFeed maxPosts={6} /> */}
    </>
  );
}
