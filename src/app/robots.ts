import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fpjacques.go10.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/carrito', '/checkout', '/mis-ordenes', '/perfil', '/login', '/registro'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
