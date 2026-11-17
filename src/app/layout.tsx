import type { Metadata } from 'next';
import { Literata, Karla } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import { Providers } from './providers';
import { Header, Footer, CartDrawer, WhatsAppButton } from '@/components/layout';
import { getStorefrontConfig } from '@/lib/api/storefront-server';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
      default: seo.metaTitle || (branding.tagline ? `${branding.storeName} - ${branding.tagline}` : branding.storeName),
      template: `%s | ${branding.storeName}`,
    },
    description: seo.metaDescription || branding.tagline || branding.storeName,
    keywords: ['tienda', 'productos', branding.storeName.toLowerCase()],
    openGraph: {
      title: seo.metaTitle || branding.storeName,
      description: seo.metaDescription || branding.tagline || branding.storeName,
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
      type: 'website',
    },
    icons: {
      icon: branding.faviconUrl || '/logo.jpg',
      apple: '/logo.jpg',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font variables on <html>: globals.css reads them in :root (--font-sans, --font-display)
    <html lang="es" className={`${literata.variable} ${karla.variable}`}>
      <body className="antialiased bg-gray-50">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
          <WhatsAppButton />
        </Providers>
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}
