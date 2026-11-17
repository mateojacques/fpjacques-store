'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useId, useRef, useState, type FormEvent } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderSearchProps {
  className?: string;
  onSearch?: () => void;
}

/**
 * The store's one search box. On the catalogue it shows the current query, so
 * refining a search starts from what was typed.
 */
export function HeaderSearch({ className, onSearch }: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const urlQuery = pathname === '/productos' ? (searchParams.get('search') ?? '') : '';
  const [query, setQuery] = useState(urlQuery);

  // Follow the URL when it changes elsewhere (clearing a filter, going back)
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setQuery(urlQuery);
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    // Keep the catalogue's category and sort, start from page 1
    const params = new URLSearchParams(pathname === '/productos' ? searchParams.toString() : '');
    params.delete('page');
    if (q) params.set('search', q);
    else params.delete('search');
    const qs = params.toString();
    router.push(qs ? `/productos?${qs}` : '/productos');
    inputRef.current?.blur();
    onSearch?.();
  };

  return (
    <form role="search" onSubmit={submit} className={cn('flex w-full', className)}>
      <div className="relative min-w-0 flex-1">
        <label htmlFor={inputId} className="sr-only">
          Buscar productos
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
          aria-hidden
        />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Buscar por nombre o código"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            'h-11 w-full min-w-0 rounded-lg border border-gray-300 bg-gray-50 pl-11 text-base text-gray-900 transition-[background-color,border-color,box-shadow] duration-150 md:h-12 md:rounded-r-none md:text-[15px]',
            'placeholder:text-gray-500 hover:border-gray-400',
            'focus:border-[var(--color-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-100)]',
            query ? 'pr-11' : 'pr-4'
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-900"
            aria-label="Borrar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="hidden h-12 shrink-0 items-center rounded-r-lg bg-[var(--color-primary)] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary-100)] md:flex"
      >
        Buscar
      </button>
    </form>
  );
}

/** Same footprint as HeaderSearch, for the moment before the URL is readable. */
export function HeaderSearchFallback({ className }: { className?: string }) {
  return (
    <div className={cn('flex w-full', className)}>
      <div className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 md:h-12 md:rounded-r-none" />
      <div className="hidden h-12 w-[6.25rem] shrink-0 rounded-r-lg bg-[var(--color-primary)] md:block" />
    </div>
  );
}
