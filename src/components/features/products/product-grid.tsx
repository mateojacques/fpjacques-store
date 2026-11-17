'use client';

import { useProducts } from '@/hooks/use-products';
import { ProductCard } from './product-card';
import { ProductGridSkeleton } from '@/components/ui';
import type { ProductFilters } from '@/types';

interface ProductGridProps {
  filters?: ProductFilters;
  limit?: number;
  emptyMessage?: string;
}

export function ProductGrid({ filters, limit, emptyMessage }: ProductGridProps) {
  const { data, isLoading, error } = useProducts({
    ...filters,
    limit: limit || filters?.limit || 20,
    isActive: true,
  });

  if (isLoading) {
    return <ProductGridSkeleton count={limit || 8} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error al cargar los productos</p>
        <p className="text-sm text-gray-600 mt-1">Puede ser un problema de conexión.</p>
      </div>
    );
  }

  const products = data?.data || [];

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-900 font-medium">{emptyMessage || 'No se encontraron productos'}</p>
        <p className="text-sm text-gray-600 mt-1">Quite algún filtro para ver más productos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
