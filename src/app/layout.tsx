import type { Metadata } from 'next';
import { Literata, Karla } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header, Footer, CartDrawer, WhatsAppButton } from '@/components/layout';
import { getStorefrontConfig } from '@/lib/api/storefront-server';

const literata = Literata({
  subsets: ['latin'],
  variable: '--font-literata',
  display: 'swap',
});

const karla = Karla({
  subsets: ['latin'],
  variable: '--font-karla',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();
  const { branding, seo } = config;

  return {
    title: {
      default: seo.metaTitle || `${branding.storeName} - ${branding.tagline}`,
      template: `%s | ${branding.storeName}`,
    },
    description: seo.metaDescription || `${branding.tagline}. Tu tienda favorita.`,
    keywords: ['arte', 'libreria', 'tienda', 'productos', 'creatividad', branding.storeName.toLowerCase()],
    openGraph: {
      title: seo.metaTitle || branding.storeName,
      description: seo.metaDescription || branding.tagline,
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
      type: 'website',
    },
    icons: branding.faviconUrl ? { icon: branding.faviconUrl } : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${literata.variable} ${karla.variable} antialiased bg-gray-50`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
