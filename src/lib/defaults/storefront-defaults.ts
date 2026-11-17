import type { StorefrontConfig } from '@/types';

/**
 * Default storefront configuration values
 * Used as fallback when API data is unavailable
 */
export const storefrontDefaults: StorefrontConfig = {
  version: '1.0',
  lastUpdated: new Date().toISOString(),
  
  branding: {
    storeName: 'FP Jacques',
    tagline: '',
    headerLogoUrl: '',
    footerLogoUrl: '',
    faviconUrl: '',
  },
  
  colors: {
    primary: '#e1161f',
    secondary: '#0b0b0b',
    accent: '#701216',
    background: '#ffffff',
    text: '#1a202c',
    textMuted: '#718096',
  },
  
  banners: {
    hero: [],
    slim: [],
  },
  
  faq: [],
  
  contact: {
    whatsappNumber: '+5491123456789',
    email: '',
    phone: '',
    address: '',
    socialLinks: {
      whatsapp: '',
    },
  },
  
  seo: {
    metaTitle: 'FP Jacques',
    metaDescription: 'Tienda online de FP Jacques.',
    ogImage: '',
  },

  ordering: {
    availabilityNotice: 'La disponibilidad y el plazo de entrega se confirman por WhatsApp.',
    minimumOrderNotice: '',
  },

  legal: {
    termsMarkdown: '',
  },
};

/**
 * Get a specific section with defaults merged
 */
export function withDefaults<K extends keyof StorefrontConfig>(
  section: K,
  data: StorefrontConfig[K] | undefined
): StorefrontConfig[K] {
  if (!data) return storefrontDefaults[section];
  return data;
}
