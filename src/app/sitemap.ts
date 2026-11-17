import type { MetadataRoute } from 'next';
import type { PaginatedResponse, Product } from '@/types';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fpjacques.go10.dev';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const STATIC_ROUTES = [
  '/',
  '/productos',
  '/categorias',
  '/contacto',
  '/faq',
  '/envios',
  '/devoluciones',
  '/terminos',
  '/privacidad',
];

async function fetchProductSkus(): Promise<string[]> {
  const skus: string[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await fetch(`${API_URL}/api/products?limit=100&page=${page}`, {
      next: { revalidate },
    });
    if (!response.ok) {
      throw new Error(`Products request failed: ${response.status}`);
    }

    const body: PaginatedResponse<Product> = await response.json();
    skus.push(...body.data.map((product) => product.sku));
    totalPages = body.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  return skus;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_ROUTES.map((path) => ({ url: `${SITE_URL}${path}` }));

  try {
    const skus = await fetchProductSkus();
    return [
      ...staticEntries,
      ...skus.map((sku) => ({ url: `${SITE_URL}/productos/${encodeURIComponent(sku)}` })),
    ];
  } catch {
    return staticEntries;
  }
}
