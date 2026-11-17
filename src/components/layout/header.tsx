'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoreLogo } from '@/components/branding';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useLogout } from '@/hooks/use-auth';
import { useCategories } from '@/hooks';
import type { CategoryTree } from '@/types';
import { HeaderSearch, HeaderSearchFallback } from './header-search';

const helpLinks = [
  { name: 'Entregas', href: '/envios' },
  { name: 'Devoluciones', href: '/devoluciones' },
  { name: 'Contacto', href: '/contacto' },
];

/** Publishes the header's height as --header-height, for sticky content below it. */
function useHeaderHeightVar() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      document.documentElement.style.setProperty('--header-height', `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export function Header() {
  const pathname = usePathname();
  const headerRef = useHeaderHeightVar();
  // Remembers the page the menu was opened on, so navigating closes it
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const itemCount = useCartStore((s) => s.cart?.itemCount ?? 0);

  const { data: categoriesData } = useCategories();
  const rootCategories = (categoriesData?.data ?? []).filter((c) => !c.parentId);

  const firstName = user?.fullName?.split(' ')[0];

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 border-b border-gray-200 bg-white"
        style={{ zIndex: 'var(--z-header)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main row */}
          <div className="flex h-[60px] items-center gap-2 md:h-[76px] md:gap-6 lg:gap-10">
            <button
              type="button"
              onClick={() => setMenuPath(pathname)}
              className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-gray-800 hover:bg-gray-100 md:hidden"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              <Menu className="h-6 w-6" />
            </button>

            <StoreLogo variant="header" />

            <Suspense fallback={<HeaderSearchFallback className="hidden md:flex md:max-w-2xl" />}>
              <HeaderSearch className="hidden md:flex md:max-w-2xl" />
            </Suspense>

            <div className="ml-auto flex items-center gap-1 md:gap-3">
              {isAuthenticated ? (
                <AccountMenu firstName={firstName} />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex h-11 items-center gap-2 rounded-lg px-2.5 text-[15px] font-medium text-gray-800 hover:bg-gray-100"
                  >
                    <User className="h-5 w-5 md:hidden" aria-hidden />
                    <span className="sr-only md:not-sr-only">Ingresar</span>
                  </Link>
                  <Link
                    href="/registro"
                    className="hidden h-11 items-center gap-2 whitespace-nowrap rounded-lg bg-[var(--color-primary-50)] px-4 text-[15px] font-semibold text-[var(--color-primary-ink)] ring-1 ring-inset ring-[var(--color-primary-100)] transition-colors hover:bg-[var(--color-primary-100)] lg:flex"
                  >
                    <UserPlus className="h-[18px] w-[18px]" aria-hidden />
                    Crear cuenta
                  </Link>
                </>
              )}

              <button
                type="button"
                onClick={toggleCart}
                className="relative -mr-2 flex h-11 items-center gap-2 rounded-lg px-2.5 text-gray-800 hover:bg-gray-100 md:mr-0"
                aria-label={itemCount > 0 ? `Carrito, ${itemCount} productos` : 'Carrito'}
              >
                <ShoppingCart className="h-6 w-6" aria-hidden />
                <span className="hidden text-[15px] font-medium">Carrito</span>
                {itemCount > 0 && (
                  <span className="absolute left-6 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-xs font-semibold tabular-nums text-white ring-2 ring-white">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search on phones: always visible, full width */}
          <div className="pb-3 md:hidden">
            <Suspense fallback={<HeaderSearchFallback />}>
              <HeaderSearch />
            </Suspense>
          </div>
        </div>

        {/* Browse row on desktop */}
        <nav aria-label="Categorías" className="hidden border-t border-gray-100 md:block">
          <div className="mx-auto flex h-11 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
            <ul className="-mx-3 flex min-w-0 flex-1 items-center overflow-x-auto [scrollbar-width:none]">
              <li>
                <NavLink href="/productos" active={pathname === '/productos'}>
                  Todos los productos
                </NavLink>
              </li>
              {rootCategories.map((category) => (
                <li key={category.id}>
                  <NavLink
                    href={`/categorias/${category.slug}`}
                    active={pathname === `/categorias/${category.slug}`}
                  >
                    {category.name}
                  </NavLink>
                </li>
              ))}
              <li>
                <NavLink href="/categorias" active={pathname === '/categorias'}>
                  Todas las categorías
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuPath(null)}
        categories={rootCategories}
        pathname={pathname}
        firstName={firstName}
        isAuthenticated={isAuthenticated}
      />
    </>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex h-11 items-center whitespace-nowrap px-3 text-sm font-medium transition-colors',
        'after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors',
        active
          ? 'text-gray-900 after:bg-[var(--color-primary)]'
          : 'text-gray-600 after:bg-transparent hover:text-gray-900 hover:after:bg-gray-300'
      )}
    >
      {children}
    </Link>
  );
}

function AccountMenu({ firstName }: { firstName?: string }) {
  const pathname = usePathname();
  // Remembers the page it was opened on, so navigating closes it
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (value: boolean) => setOpenPath(value ? pathname : null);
  const ref = useRef<HTMLDivElement>(null);
  const logout = useLogout();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const itemClass =
    'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-11 items-center gap-2 rounded-lg px-2.5 text-[15px] font-medium text-gray-800 hover:bg-gray-100"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <User className="h-5 w-5" aria-hidden />
        <span className="hidden max-w-[10rem] truncate md:inline">{firstName ?? 'Mi cuenta'}</span>
        <ChevronDown
          className={cn('hidden h-4 w-4 transition-transform md:block', open && 'rotate-180')}
          aria-hidden
        />
        <span className="sr-only md:hidden">Mi cuenta</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-[0_4px_8px_rgb(0_0_0/0.06)] animate-in fade-in"
          style={{ zIndex: 'var(--z-overlay)' }}
        >
          <Link href="/perfil" role="menuitem" className={itemClass}>
            <User className="h-4 w-4 text-gray-500" aria-hidden />
            Mi perfil
          </Link>
          <Link href="/mis-ordenes" role="menuitem" className={itemClass}>
            <Package className="h-4 w-4 text-gray-500" aria-hidden />
            Mis pedidos
          </Link>
          <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className={itemClass}
          >
            <LogOut className="h-4 w-4 text-gray-500" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  categories: CategoryTree[];
  pathname: string;
  firstName?: string;
  isAuthenticated: boolean;
}

function MobileMenu({ open, onClose, categories, pathname, firstName, isAuthenticated }: MobileMenuProps) {
  const logout = useLogout();

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

  const rowClass = (active: boolean) =>
    cn(
      'flex min-h-12 items-center justify-between gap-3 px-5 text-base',
      active ? 'font-semibold text-[var(--color-primary-ink)]' : 'text-gray-800 active:bg-gray-100'
    );

  return (
    <div className="md:hidden" style={{ position: 'relative', zIndex: 'var(--z-drawer)' }}>
      <div className="fixed inset-0 bg-black/40 animate-in fade-in" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        className="fixed inset-y-0 left-0 flex w-[88vw] max-w-sm flex-col bg-white animate-in slide-in-from-left"
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-gray-100 px-4">
          <StoreLogo variant="header" />
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Cerrar menú"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain pb-8">
          {/* Account */}
          {isAuthenticated ? (
            <div className="border-b border-gray-100 py-2">
              <p className="px-5 pb-1 pt-3 text-sm text-gray-500">
                Sesión iniciada{firstName ? ` como ${firstName}` : ''}
              </p>
              <Link href="/perfil" className={rowClass(pathname === '/perfil')}>
                Mi perfil
              </Link>
              <Link href="/mis-ordenes" className={rowClass(pathname.startsWith('/mis-ordenes'))}>
                Mis pedidos
              </Link>
            </div>
          ) : (
            <div className="border-b border-gray-100 p-5">
              <p className="text-[15px] font-semibold text-gray-900">Cuenta</p>
              <p className="mt-1 text-sm text-gray-600">
                Para enviar pedidos se necesita una cuenta.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="flex h-11 items-center justify-center rounded-lg border border-gray-300 text-[15px] font-medium text-gray-800 active:bg-gray-50"
                >
                  Ingresar
                </Link>
                <Link
                  href="/registro"
                  className="flex h-11 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[15px] font-semibold text-white active:bg-[var(--color-primary-dark)]"
                >
                  Abrir cuenta
                </Link>
              </div>
            </div>
          )}

          {/* Browse */}
          <div className="border-b border-gray-100 py-2">
            <p className="px-5 pb-1 pt-3 text-sm font-semibold text-gray-900">Productos</p>
            <Link href="/productos" className={rowClass(pathname === '/productos')}>
              Todos los productos
              <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categorias/${category.slug}`}
                className={rowClass(pathname === `/categorias/${category.slug}`)}
              >
                {category.name}
                <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />
              </Link>
            ))}
            <Link href="/categorias" className={rowClass(pathname === '/categorias')}>
              Todas las categorías
              <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />
            </Link>
          </div>

          {/* Help */}
          <div className="py-2">
            <p className="px-5 pb-1 pt-3 text-sm font-semibold text-gray-900">Ayuda</p>
            {helpLinks.map((link) => (
              <Link key={link.href} href={link.href} className={rowClass(pathname === link.href)}>
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="mt-2 flex min-h-12 w-full items-center gap-3 px-5 text-left text-base text-gray-800 active:bg-gray-100"
              >
                <LogOut className="h-5 w-5 text-gray-500" aria-hidden />
                Cerrar sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
