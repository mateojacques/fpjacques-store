'use client';

import { Info } from 'lucide-react';
import { useStorefront } from '@/lib/providers';
import { storefrontDefaults } from '@/lib/defaults/storefront-defaults';
import { cn } from '@/lib/utils';

type Notice = 'availability' | 'minimumOrder';

interface OrderingNoticesProps {
  show: Notice[];
  className?: string;
}

/**
 * The store-wide ordering lines edited from the dashboard. An empty line is
 * not shown, so an unset minimum order leaves nothing behind.
 */
export function OrderingNotices({ show, className }: OrderingNoticesProps) {
  const { config } = useStorefront();
  const ordering = config?.ordering ?? storefrontDefaults.ordering!;

  const lines = show
    .map((notice) =>
      notice === 'availability' ? ordering.availabilityNotice : ordering.minimumOrderNotice
    )
    .map((line) => line?.trim())
    .filter((line): line is string => Boolean(line));

  if (lines.length === 0) return null;

  return (
    <div className={cn('space-y-1 text-sm text-gray-600', className)}>
      {lines.map((line) => (
        <p key={line} className="flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" aria-hidden="true" />
          <span>{line}</span>
        </p>
      ))}
    </div>
  );
}
