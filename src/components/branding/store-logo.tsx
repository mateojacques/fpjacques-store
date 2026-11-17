'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useBranding } from '@/lib/providers';
import { storefrontDefaults } from '@/lib/defaults/storefront-defaults';
import { Skeleton } from '@/components/ui';

/** Bundled logo, used when no logo was uploaded in Apariencia. */
export const DEFAULT_LOGO_URL = '/logo.jpg';

interface StoreLogoProps {
  variant?: 'header' | 'footer';
  className?: string;
}

export function StoreLogo({ variant = 'header', className = '' }: StoreLogoProps) {
  const { branding, isLoading } = useBranding();
  
  const configuredLogoUrl = variant === 'header'
    ? branding?.headerLogoUrl
    : branding?.footerLogoUrl;
  const isDefaultLogo = !configuredLogoUrl;
  const logoUrl = configuredLogoUrl || DEFAULT_LOGO_URL;
  
  const storeName = branding?.storeName ?? storefrontDefaults.branding.storeName;

  // Smaller on phones, where the header also holds the menu, account and cart.
  // The bundled logo is square, so it gets a square box of the same height.
  const logoBoxClassName = isDefaultLogo
    ? variant === 'header' ? 'size-[43px] md:size-[56px] rounded-md' : 'size-[72px] rounded-md'
    : variant === 'header' ? 'w-[124px] h-[43px] md:w-[160px] md:h-[56px]' : 'w-[160px] h-[56px]';

  if (isLoading) {
    return <Skeleton className={`${logoBoxClassName} ${className}`} />;
  }

  const content = (
    <span className={`relative block ${logoBoxClassName} overflow-hidden ${className}`}>
      <Image
        src={logoUrl}
        alt={storeName}
        fill
        sizes={isDefaultLogo ? '72px' : '(max-width: 767px) 124px, 160px'}
        className="object-cover object-center"
        priority={variant === 'header'}
      />
    </span>
  );

  return (
    <Link
      href="/"
      aria-label={storeName}
      className={`inline-flex items-center ${variant === 'header' ? 'h-8' : 'h-10'} shrink-0`}
    >
      {content}
    </Link>
  );
}
