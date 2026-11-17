'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { useCategories } from '@/hooks';
import { Skeleton } from '@/components/ui';
import type { CategoryTree } from '@/types';

/** Subcategories listed under each tile before "Ver N más". */
const VISIBLE_CHILDREN = 4;

function CategoryTile({ category }: { category: CategoryTree }) {
  const href = `/categorias/${category.slug}`;
  const children = category.children ?? [];
  const hidden = children.length - VISIBLE_CHILDREN;

  return (
    <li>
      <Link href={href} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt=""
              fill
              // Product photos have white backgrounds: multiply blends them into the well
              className="object-contain p-5 mix-blend-multiply transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:p-8"
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-12 w-12 text-gray-300" aria-hidden />
            </div>
          )}
        </div>
        <h2 className="mt-3 font-display text-lg font-semibold text-gray-950 underline-offset-4 group-hover:underline sm:text-xl">
          {category.name}
        </h2>
      </Link>

      {children.length > 0 && (
        <ul className="mt-1.5 space-y-1 text-sm text-gray-700">
          {children.slice(0, VISIBLE_CHILDREN).map((child) => (
            <li key={child.id}>
              <Link href={`/categorias/${child.slug}`} className="hover:text-gray-950 hover:underline">
                {child.name}
              </Link>
            </li>
          ))}
          {hidden > 0 && (
            <li>
              <Link
                href={href}
                className="font-medium text-[var(--color-primary-ink)] underline underline-offset-4 hover:text-gray-950"
              >
                {hidden === 1 ? 'Ver 1 más' : `Ver ${hidden} más`}
              </Link>
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

const gridClass = 'grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8';

export default function CategoriasPage() {
  const { data, isPending, error, refetch } = useCategories();
  const categories = (data?.data ?? []).filter((c) => !c.parentId);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 md:pt-10 lg:px-8">
        <h1 className="font-display text-2xl font-semibold text-gray-950 md:text-3xl">Categorías</h1>

        <div className="mt-6 md:mt-8">
          {isPending ? (
            <ul className={gridClass} aria-hidden>
              {Array.from({ length: 8 }).map((_, i) => (
                <li key={i}>
                  <Skeleton className="aspect-[4/3]" />
                  <Skeleton className="mt-3 h-6 w-2/3" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                </li>
              ))}
            </ul>
          ) : error ? (
            <div className="border-t border-gray-200 py-12">
              <p className="text-gray-800">No se pudieron cargar las categorías.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 text-sm font-semibold text-[var(--color-primary-ink)] underline underline-offset-4"
              >
                Reintentar
              </button>
            </div>
          ) : categories.length > 0 ? (
            <ul className={gridClass}>
              {categories.map((category) => (
                <CategoryTile key={category.id} category={category} />
              ))}
            </ul>
          ) : (
            <div className="border-t border-gray-200 py-12">
              <p className="text-gray-800">Todavía no hay categorías con productos publicados.</p>
              <Link
                href="/productos"
                className="mt-3 inline-block text-sm font-semibold text-[var(--color-primary-ink)] underline underline-offset-4"
              >
                Ver todos los productos
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
