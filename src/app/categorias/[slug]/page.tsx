'use client';

import { Suspense, use } from 'react';
import Link from 'next/link';
import { useCategoryBySlug, useCategories } from '@/hooks';
import { CatalogView } from '@/components/features/products';
import { Skeleton } from '@/components/ui';
import type { CategoryTree } from '@/types';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

function findById(nodes: CategoryTree[], id: string): CategoryTree | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findById(node.children, id);
    if (found) return found;
  }
  return null;
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-3 h-9 w-64" />
    </div>
  );
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params);
  const { data: categoryData, isPending, error } = useCategoryBySlug(slug);
  const { data: treeData } = useCategories();

  const category = categoryData?.data;

  if (isPending && !error) {
    return (
      <div className="bg-white">
        <PageSkeleton />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl font-semibold text-gray-950">Categoría no encontrada</h1>
        <p className="mt-2 text-gray-700">La categoría no existe o ya no tiene productos publicados.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/categorias"
            className="flex h-11 items-center rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)]"
          >
            Ver categorías
          </Link>
          <Link
            href="/productos"
            className="flex h-11 items-center rounded-lg border border-gray-300 px-5 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Ver todos los productos
          </Link>
        </div>
      </div>
    );
  }

  const node = (treeData?.data && findById(treeData.data, category.id)) || { ...category, children: [] };

  return (
    <div className="bg-white">
      <Suspense fallback={<PageSkeleton />}>
        <CatalogView key={category.id} category={node} />
      </Suspense>
    </div>
  );
}
