'use client';

import { useContact } from '@/lib/providers';
import { WhatsAppIcon } from '@/components/branding';

export function WhatsAppButton() {
  const { contact, isLoading } = useContact();

  const whatsappNumber = contact?.whatsappNumber;

  if (isLoading || !whatsappNumber?.trim()) {
    return null;
  }

  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const href = `https://wa.me/${cleanNumber}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear en WhatsApp"
      style={{ zIndex: 'var(--z-floating)' }}
      className="fixed bottom-6 right-6 flex items-center gap-2.5 rounded-full bg-[var(--color-whatsapp)] px-3 py-3 text-white shadow-[0_4px_8px_rgb(0_0_0/0.18)] transition-[background-color,transform] duration-200 hover:bg-[var(--color-whatsapp-dark)] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-whatsapp)] focus-visible:ring-offset-2 group"
    >
      <WhatsAppIcon className="h-6 w-6 flex-shrink-0" />
    </a>
  );
}
