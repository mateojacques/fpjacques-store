'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowUpDown, Building2, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategories, useProducts } from '@/hooks';
import { useAuthStore } from '@/stores/auth-store';
import { Skeleton } from '@/components/ui';
import type { CategoryTree, ProductFilters } from '@/types';
import { ProductCard } from './product-card';
import { Pagination } from './pagination';

/** Enough rows that a page fills several screens, divisible by 2, 3 and 4 columns. */
const PAGE_SIZE = 48;

const sortOptions = [
  { value: 'createdAt-desc', label: 'Más recientes' },
  { value: 'name-asc', label: 'Nombre: A a Z' },
  { value: 'name-desc', label: 'Nombre: Z a A' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
] as const;
const DEFAULT_SORT = sortOptions[0].value;

const numberFormat = new Intl.NumberFormat('es-AR');

interface CatalogViewProps {
  /**
   * Category the page belongs to (`/categorias/[slug]`). Without it the
   * category comes from `?categoryId=` and the page is the full catalogue.
   */
  category?: CategoryTree;
}

/** Path from a root category down to `id`, or [] when it isn't in the tree. */
function findPath(nodes: CategoryTree[], id: string | undefined): CategoryTree[] {
  if (!id) return [];
  for (const node of nodes) {
    if (node.id === id) return [node];
    const below = findPath(node.children, id);
    if (below.length) return [node, ...below];
  }
  return [];
}

export function CatalogView({ category }: CatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const search = category ? '' : (searchParams.get('search')?.trim() ?? '');
  const categoryId = category?.id ?? searchParams.get('categoryId') ?? undefined;
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const sortParam = sortOptions.some((o) => o.value === searchParams.get('sort'))
    ? (searchParams.get('sort') as string)
    : DEFAULT_SORT;
  const [sortBy, sortOrder] = sortParam.split('-') as [
    NonNullable<ProductFilters['sortBy']>,
    NonNullable<ProductFilters['sortOrder']>,
  ];

  const { data: treeData } = useCategories();
  const tree = treeData?.data ?? [];
  const activePath = findPath(tree, categoryId);
  const activeCategory = activePath[activePath.length - 1] ?? category;

  const filters: ProductFilters = {
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    categoryId,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sortBy,
    sortOrder,
    isActive: true,
  };
  // isPending, not isLoading: the server never fetches, and both renders must match
  const { data, isPending, isFetching, error, refetch } = useProducts(filters);
  const products = data?.data ?? [];
  const meta = data?.meta;

  /** Same page with some params changed; any change but paging goes back to page 1. */
  const hrefWith = (updates: Record<string, string | undefined>, base = pathname) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (!('page' in updates)) params.delete('page');
    if (params.get('sort') === DEFAULT_SORT) params.delete('sort');
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };
  const update = (updates: Record<string, string | undefined>) => router.push(hrefWith(updates));

  // On a category page, other categories are their own pages; in the catalogue they're a filter
  const categoryHref = (target: CategoryTree | null) =>
    category
      ? target
        ? hrefWith({ categoryId: undefined }, `/categorias/${target.slug}`)
        : hrefWith({ categoryId: undefined }, '/productos')
      : hrefWith({ categoryId: target?.id });

  const hasFilters = Boolean(search || (!category && categoryId) || minPrice || maxPrice);
  const clearAll = () => router.push(category ? pathname : '/productos');

  const title = search ? `Resultados para “${search}”` : (activeCategory?.name ?? 'Productos');

  const filterPanel = (
    <FilterPanel
      tree={tree}
      activePath={activePath}
      showAll={!category}
      categoryHref={categoryHref}
      minPrice={minPrice}
      maxPrice={maxPrice}
      onPrice={(min, max) => update({ minPrice: min, maxPrice: max })}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      {/* Breadcrumb and title */}
      <div className="pb-5 pt-5 md:pb-6 md:pt-8">
        <nav aria-label="Ruta" className="mb-2 text-sm text-gray-600">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-gray-900 hover:underline">
                Inicio
              </Link>
            </li>
            <Crumb href={activePath.length || search ? '/productos' : undefined}>Productos</Crumb>
            {activePath.map((node, i) => (
              <Crumb
                key={node.id}
                href={i < activePath.length - 1 || search ? categoryHref(node) : undefined}
              >
                {node.name}
              </Crumb>
            ))}
          </ol>
        </nav>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="font-display text-2xl font-semibold text-gray-950 text-balance md:text-3xl">
            {title}
          </h1>
          <p className="text-sm text-gray-600 tabular-nums" aria-live="polite">
            {meta ? `${numberFormat.format(meta.total)} ${meta.total === 1 ? 'producto' : 'productos'}` : ' '}
          </p>
        </div>
      </div>

      {/* Subcategories at hand on phones, where the filter panel is folded away */}
      {category && activeCategory && activeCategory.children.length > 0 && (
        <ul className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:hidden">
          {activeCategory.children.map((child) => (
            <li key={child.id} className="shrink-0">
              <Link
                href={categoryHref(child)}
                className="flex h-9 items-center rounded-full border border-gray-300 px-4 text-sm text-gray-800 active:bg-gray-50"
              >
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[16.5rem_minmax(0,1fr)] xl:gap-12">
        {/* Filters: anchored while the products scroll */}
        <aside
          aria-label="Filtros"
          className="hidden lg:sticky lg:block lg:max-h-[calc(100vh-var(--header-height,122px)-3rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pb-6 lg:pr-2 lg:[scrollbar-width:thin]"
          style={{ top: 'calc(var(--header-height, 122px) + 1.5rem)' }}
        >
          {filterPanel}
        </aside>

        <section aria-label="Productos" className="min-w-0">
          {/* Phones and tablets: filter and sort stay at hand */}
          <div
            className="sticky -mx-4 mb-4 flex gap-2 border-b border-gray-200 bg-white px-4 py-2.5 sm:-mx-6 sm:px-6 lg:hidden"
            style={{ top: 'var(--header-height, 113px)', zIndex: 'var(--z-sticky)' }}
          >
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-800 active:bg-gray-50"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              Filtrar
              {hasFilters && (
                <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" aria-label="(con filtros)" />
              )}
            </button>
            <SortSelect value={sortParam} onChange={(v) => update({ sort: v })} className="flex-1" compact />
          </div>

          {/* Desktop toolbar: what's applied, and the order */}
          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3 lg:mb-8">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              {search && (
                <Chip label={`“${search}”`} onRemove={() => update({ search: undefined })} removeLabel="Quitar búsqueda" />
              )}
              {!category && activeCategory && (
                <Chip
                  label={activeCategory.name}
                  onRemove={() => update({ categoryId: undefined })}
                  removeLabel="Quitar categoría"
                />
              )}
              {(minPrice || maxPrice) && (
                <Chip
                  label={priceLabel(minPrice, maxPrice)}
                  onRemove={() => update({ minPrice: undefined, maxPrice: undefined })}
                  removeLabel="Quitar rango de precio"
                />
              )}
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-1 text-sm font-medium text-gray-700 underline underline-offset-4 hover:text-gray-950"
                >
                  Limpiar todo
                </button>
              )}
            </div>
            <SortSelect
              value={sortParam}
              onChange={(v) => update({ sort: v })}
              className="hidden lg:flex"
            />
          </div>

          {!isAuthenticated && (
            <Link
              href="/registro"
              className="group mb-8 flex items-center gap-3 rounded-lg bg-[var(--color-primary-50)] px-4 py-3 text-sm text-gray-800"
            >
              <Building2 className="h-5 w-5 shrink-0 text-[var(--color-primary-ink)]" aria-hidden />
              <span className="flex-1">
                Precios generales. Las instituciones con cuenta mayorista ven sus precios al ingresar.
              </span>
              <span className="hidden shrink-0 font-semibold text-[var(--color-primary-ink)] group-hover:underline underline-offset-4 sm:inline">
                Abrir cuenta
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-primary-ink)] sm:hidden" aria-hidden />
            </Link>
          )}

          {isPending ? (
            <GridSkeleton />
          ) : error ? (
            <EmptyState
              title="No se pudieron cargar los productos"
              text="Puede ser un problema de conexión."
              action={
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="text-sm font-semibold text-[var(--color-primary-ink)] underline underline-offset-4"
                >
                  Reintentar
                </button>
              }
            />
          ) : products.length === 0 ? (
            <EmptyState
              title={search ? `No hay productos para “${search}”` : 'No hay productos con estos filtros'}
              text={
                search
                  ? 'Revise la ortografía o busque con menos palabras. También se puede buscar por código.'
                  : 'Quite algún filtro para ver más productos.'
              }
              action={
                hasFilters ? (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-800 hover:bg-gray-50"
                  >
                    Ver todos los productos
                  </button>
                ) : null
              }
            />
          ) : (
            <>
              <ul
                className={cn(
                  'grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4',
                  isFetching && 'opacity-60 transition-opacity'
                )}
              >
                {products.map((product) => (
                  <li key={product.id} className="flex">
                    <ProductCard product={product} className="w-full" />
                  </li>
                ))}
              </ul>

              {meta && meta.totalPages > 1 && (
                <div className="mt-14 flex flex-col items-center gap-3">
                  <Pagination
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                    onPageChange={(p) => update({ page: p > 1 ? String(p) : undefined })}
                  />
                  <p className="text-sm text-gray-600 tabular-nums">
                    {numberFormat.format((meta.page - 1) * meta.limit + 1)} a{' '}
                    {numberFormat.format(Math.min(meta.page * meta.limit, meta.total))} de{' '}
                    {numberFormat.format(meta.total)}
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        total={meta?.total}
        onClear={hasFilters ? clearAll : undefined}
      >
        {filterPanel}
      </FilterSheet>
    </div>
  );
}

function Crumb({ href, children }: { href?: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-1">
      <ChevronRight className="h-3.5 w-3.5 text-gray-400" aria-hidden />
      {href ? (
        <Link href={href} className="hover:text-gray-900 hover:underline">
          {children}
        </Link>
      ) : (
        <span className="text-gray-900" aria-current="page">
          {children}
        </span>
      )}
    </li>
  );
}

function priceLabel(min: string, max: string) {
  const fmt = (v: string) => `$${numberFormat.format(Number(v))}`;
  if (min && max) return `${fmt(min)} a ${fmt(max)}`;
  return min ? `Desde ${fmt(min)}` : `Hasta ${fmt(max)}`;
}

function Chip({ label, onRemove, removeLabel }: { label: string; onRemove: () => void; removeLabel: string }) {
  return (
    <span className="inline-flex h-8 max-w-full items-center gap-1 rounded-full border border-gray-300 bg-white pl-3 pr-1 text-sm text-gray-800">
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        aria-label={removeLabel}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

function SortSelect({
  value,
  onChange,
  className,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  compact?: boolean;
}) {
  return (
    <label
      className={cn(
        'relative flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 hover:border-gray-400 focus-within:border-[var(--color-primary)] focus-within:ring-4 focus-within:ring-[var(--color-primary-100)]',
        compact ? 'justify-center px-3' : 'px-3',
        className
      )}
    >
      {compact ? (
        <ArrowUpDown className="h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <span className="shrink-0 text-gray-600">Ordenar por</span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Ordenar productos"
        className={cn(
          'h-full min-w-0 appearance-none bg-transparent font-medium focus:outline-none',
          compact ? 'max-w-full truncate text-center' : 'pr-5'
        )}
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {!compact && (
        <ChevronRight className="pointer-events-none absolute right-3 h-4 w-4 rotate-90 text-gray-500" aria-hidden />
      )}
    </label>
  );
}

interface FilterPanelProps {
  tree: CategoryTree[];
  activePath: CategoryTree[];
  showAll: boolean;
  categoryHref: (category: CategoryTree | null) => string;
  minPrice: string;
  maxPrice: string;
  onPrice: (min?: string, max?: string) => void;
}

function FilterPanel({ tree, activePath, showAll, categoryHref, minPrice, maxPrice, onPrice }: FilterPanelProps) {
  const activeIds = new Set(activePath.map((c) => c.id));
  const activeId = activePath[activePath.length - 1]?.id;

  const renderLevel = (nodes: CategoryTree[], depth: number): ReactNode => (
    <ul className={cn(depth > 0 && 'ml-3 border-l border-gray-200 pl-2')}>
      {nodes.map((node) => {
        const isActive = node.id === activeId;
        const isOpen = activeIds.has(node.id) && node.children.length > 0;
        return (
          <li key={node.id}>
            <Link
              href={categoryHref(node)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex min-h-9 items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[15px] leading-snug transition-colors lg:text-sm',
                isActive
                  ? 'bg-[var(--color-primary-50)] font-semibold text-[var(--color-primary-ink)]'
                  : activeIds.has(node.id)
                    ? 'font-semibold text-gray-950 hover:bg-gray-100'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
              )}
            >
              {node.name}
              {node.children.length > 0 && !isOpen && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
              )}
            </Link>
            {isOpen && renderLevel(node.children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 px-2 text-sm font-semibold text-gray-950">Categoría</h2>
        {showAll && (
          <Link
            href={categoryHref(null)}
            className={cn(
              'flex min-h-9 items-center rounded-md px-2 py-1.5 text-[15px] lg:text-sm',
              activePath.length === 0
                ? 'bg-[var(--color-primary-50)] font-semibold text-[var(--color-primary-ink)]'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
            )}
          >
            Todas
          </Link>
        )}
        {tree.length > 0 ? (
          renderLevel(tree, 0)
        ) : (
          <div className="space-y-2 px-2 pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-3/4" />
            ))}
          </div>
        )}
      </div>

      <PriceFilter key={`${minPrice}-${maxPrice}`} minPrice={minPrice} maxPrice={maxPrice} onApply={onPrice} />
    </div>
  );
}

function PriceFilter({
  minPrice,
  maxPrice,
  onApply,
}: {
  minPrice: string;
  maxPrice: string;
  onApply: (min?: string, max?: string) => void;
}) {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);
  const clean = (v: string) => v.replace(/\D/g, '');
  const invalid = Boolean(min && max && Number(min) > Number(max));
  const changed = min !== minPrice || max !== maxPrice;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!invalid) onApply(min || undefined, max || undefined);
  };

  const field = (label: string, value: string, set: (v: string) => void) => (
    <label className="flex h-10 min-w-0 flex-1 items-center rounded-lg border border-gray-300 bg-white pl-2.5 text-sm focus-within:border-[var(--color-primary)] focus-within:ring-4 focus-within:ring-[var(--color-primary-100)]">
      <span className="text-gray-500" aria-hidden>
        $
      </span>
      <input
        inputMode="numeric"
        placeholder={label}
        aria-label={`Precio ${label.toLowerCase()}`}
        value={value}
        onChange={(e) => set(clean(e.target.value))}
        className="h-full w-full min-w-0 bg-transparent px-1.5 text-gray-900 placeholder:text-gray-500 focus:outline-none"
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="px-2">
      <h2 className="mb-3 text-sm font-semibold text-gray-950">Precio</h2>
      <div className="flex items-center gap-2">
        {field('Mínimo', min, setMin)}
        <span className="text-gray-400" aria-hidden>
          –
        </span>
        {field('Máximo', max, setMax)}
      </div>
      {invalid && <p className="mt-2 text-sm text-red-700">El mínimo es mayor que el máximo.</p>}
      <button
        type="submit"
        disabled={!changed || invalid}
        className="mt-3 h-9 w-full rounded-lg bg-gray-900 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-500"
      >
        Aplicar precio
      </button>
    </form>
  );
}

function FilterSheet({
  open,
  onClose,
  total,
  onClear,
  children,
}: {
  open: boolean;
  onClose: () => void;
  total?: number;
  onClear?: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lg:hidden" style={{ position: 'relative', zIndex: 'var(--z-drawer)' }}>
      <div className="fixed inset-0 bg-black/40 animate-in fade-in" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
        className="fixed inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-xl bg-white animate-in slide-in-from-bottom sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-96 sm:rounded-none"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-100 px-4">
          <h2 className="text-base font-semibold text-gray-950">Filtros</h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Cerrar filtros"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-5">{children}</div>
        <div className="flex shrink-0 gap-2 border-t border-gray-100 p-4">
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="h-11 rounded-lg border border-gray-300 px-4 text-[15px] font-medium text-gray-800 active:bg-gray-50"
            >
              Limpiar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-lg bg-[var(--color-primary)] text-[15px] font-semibold text-white active:bg-[var(--color-primary-dark)]"
          >
            {total === undefined ? 'Ver productos' : `Ver ${numberFormat.format(total)} ${total === 1 ? 'producto' : 'productos'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2 border-t border-gray-200 py-12">
      <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
      <p className="max-w-prose text-[15px] text-gray-700">{text}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-square" />
          <Skeleton className="mt-3 h-4 w-11/12" />
          <Skeleton className="mt-1.5 h-4 w-2/3" />
          <Skeleton className="mt-3 h-5 w-1/3" />
          <Skeleton className="mt-3 h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
