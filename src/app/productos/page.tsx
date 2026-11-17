'use client';

import { Suspense } from 'react';
import { CatalogView } from '@/components/features/products';
import { Skeleton } from '@/components/ui';

function CatalogFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-3 h-9 w-56" />
    </div>
  );
}

export default function ProductosPage() {
  return (
    <div className="bg-white">
      <Suspense fallback={<CatalogFallback />}>
        <CatalogView />
      </Suspense>
    </div>
  );
}
