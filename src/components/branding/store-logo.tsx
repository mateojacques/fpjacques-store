'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useBranding } from '@/lib/providers';
import { storefrontDefaults } from '@/lib/defaults/storefront-defaults';
import { Skeleton } from '@/components/ui';

interface StoreLogoProps {
  variant?: 'header' | 'footer';
  className?: string;
}

export function StoreLogo({ variant = 'header', className = '' }: StoreLogoProps) {
  const { branding, isLoading } = useBranding();
  
  const logoUrl = variant === 'header' 
    ? branding?.headerLogoUrl 
    : branding?.footerLogoUrl;
  
  const storeName = branding?.storeName ?? storefrontDefaults.branding.storeName;

  // Smaller on phones, where the header also holds the menu, account and cart
  const logoBoxClassName =
    variant === 'header' ? 'w-[124px] h-[43px] md:w-[160px] md:h-[56px]' : 'w-[160px] h-[56px]';

  if (isLoading) {
    return <Skeleton className={`${logoBoxClassName} ${className}`} />;
  }

  const content = logoUrl ? (
    <span className={`relative block ${logoBoxClassName} overflow-hidden ${className}`}>
      <Image
        src={logoUrl}
        alt={storeName}
        fill
        sizes="(max-width: 767px) 124px, 160px"
        className="object-cover object-center"
        priority={variant === 'header'}
      />
    </span>
  ) : (
    <span
      className={`font-display font-semibold ${
        variant === 'header'
          ? 'text-xl text-[var(--color-primary)]'
          : 'text-2xl text-white'
      } ${logoBoxClassName} ${className} overflow-hidden whitespace-nowrap text-ellipsis`}
    >
      {storeName}
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
