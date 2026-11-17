# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Customer-facing storefront for "San Pablo" (an art supplies and books store in Argentina), built with Next.js 16 (App Router), React 19 and Tailwind CSS v4. This repo is **frontend only**. Products, cart, checkout, orders, auth and storefront configuration all come from a separate backend REST API. UI copy, routes (`/carrito`, `/productos/[sku]`, `/mis-ordenes`, …) and number/date formatting (`es-AR`, ARS) are in Spanish/Argentine locale.

## Public copy

This applies to all text a customer can read: store pages, emails, customer-facing error messages, seeded content and storefront config defaults.

Always write in neutral Spanish that is clear, plain and easy to understand. Include only the information the reader needs, and state it directly. The goal is the user's clarity, not to talk to the customer.

Never use:

- Em dashes or other signs of AI-generated writing, such as stock phrases, slogans or awkward expressions.
- Rioplatense Spanish: no voseo (`querés`, `tenés`, `escribinos`) and no regional expressions.
- Text that tries to sound close to the customer, such as greetings, enthusiasm or sales talk.

Prefer impersonal phrasing: "La disponibilidad y el plazo de entrega se confirman por WhatsApp", not "Te confirmamos disponibilidad y plazo por WhatsApp". Argentine terms needed for accuracy (CUIT, razón social, Factura A) and `es-AR` number and date formats are fine.

## Commands

```bash
npm run dev      # dev server (http://localhost:3000)
npm run build    # production build; also the main type-check (no separate tsc script)
npm run lint     # eslint (flat config: next core-web-vitals + typescript)
npx tsc --noEmit # standalone type-check
```

There is no test framework or test suite.

## Environment

- `NEXT_PUBLIC_API_URL`: backend base URL. The default is `http://localhost:3000`, the same port as `next dev`, so set it whenever the backend runs on a different port.
- `INSTAGRAM_ACCESS_TOKEN` (optional): used only by `src/app/api/instagram/feed/route.ts`. Without it the route returns an empty list.

`.env*` files are gitignored.

## Architecture

**Rendering model.** Almost every page and component is a client component (`'use client'`) that fetches data on the client with TanStack Query. The main server-side code is `src/app/layout.tsx`. Its `generateMetadata` calls `getStorefrontConfig()` (`src/lib/api/storefront-server.ts`), which uses `fetch` with `revalidate: 300` and falls back to `storefrontDefaults` on error. A few static legal/info pages are server components. The React Compiler is enabled (`reactCompiler: true` in `next.config.ts`), and `next/image` accepts any HTTPS host.

**Data layer (3 tiers):**
1. `src/lib/api/client.ts`: `apiClient`, a fetch wrapper. It reads `token` and `sessionId` from `localStorage` and sends them as `Authorization: Bearer` and `x-session-id` headers. Non-2xx responses throw `ApiException(message, status, code)`, parsed from the backend's `{ error: { code, message } }` shape.
2. `src/lib/api/*.ts`: one object per resource (`productsApi`, `cartApi`, `checkoutApi`, …), re-exported from `src/lib/api/index.ts`. Responses are typed as `ApiResponse<T>` (`{ data }`) or `PaginatedResponse<T>` (`{ data, meta }`) from `src/types/api.ts`. That file mirrors the backend's OpenAPI spec. The storefront API file also contains admin mutation endpoints that this app does not use.
3. `src/hooks/use-*.ts`: TanStack Query hooks wrapping those APIs, re-exported from `src/hooks/index.ts`. Mutations usually write the response straight into the cache with `queryClient.setQueryData` (for example, `['cart']`) instead of invalidating.

**State.**
- TanStack Query is the source of truth for server data. Defaults are set in `src/lib/providers/query-provider.tsx`: 1 min `staleTime`, no refetch on focus, 1 retry.
- Zustand stores live in `src/stores/`:
  - `auth-store` persists to `localStorage` under `auth-storage` and also mirrors the token into `localStorage.token` so `apiClient` can read it. Keep both in sync when changing auth.
  - `cart-store` holds drawer UI state (`isOpen`) plus a copy of the cart. `cart-drawer.tsx` and `carrito/page.tsx` copy it from the `['cart']` query.
- Guest carts: `getOrCreateSessionId()` (`src/lib/utils/index.ts`) creates a `guest_…` id in `localStorage.sessionId`. On login or register, `useLogin` and `useRegister` merge the guest cart into the user's cart and then remove the session id.

**Storefront config / theming.** The backend's `/api/storefront/config` endpoint drives branding, colors, hero and slim banners, FAQ, contact info (including WhatsApp) and SEO. `StorefrontProvider` exposes it through `useStorefront()` and the per-section hooks (`useBranding`, `useColors`, `useBanners`, …) in `src/lib/providers/storefront-provider.tsx`. `ThemeStyles` writes the configured colors into CSS variables (`--color-primary`, `--color-primary-dark`/`-light`/`-50`/`-100` derived with `color-mix`, `--color-accent`, `--color-text-muted`, …). Components reference these as `text-[var(--color-primary)]` and similar, so don't hard-code brand colors. `src/lib/defaults/storefront-defaults.ts` holds the fallback values used whenever the config is missing. Fonts: Karla (`font-sans`) and Literata (`.font-display`, for headings).

**Home page sections.** `useHomeSections` combines storefront carousels with slim banners. `interleaveHomeSections` (`src/lib/utils/home-sections.ts`) filters out inactive or empty items, sorts by `sortOrder` and alternates carousel, banner, carousel, and so on. The result is a discriminated union `HomeSection` (`src/types/home-sections.ts`). `HomeSectionsRenderer` renders it through a strategy registry with an exhaustive `never` check. To add a new section type, extend the union and its type guard, add a strategy, and add a branch in `renderHomeSection`.

**Checkout flow.** `/carrito` → `/checkout` (contact form, react-hook-form + zod) → `/checkout/revision` → `/checkout/confirmacion`. The backend keeps checkout state: `useSaveCheckoutContact` → `useCheckoutReview` → `useConfirmOrder`. The checkout form previously had hydration and `reset()` sync bugs in production builds. The fix (commit 874be88) uses a one-time `formInitialized` flag, `mode: 'onBlur'`, waits for auth to load, and adds explicit value syncing inside `Input`/`Textarea`. Keep these in place when editing the form, and check changes with `npm run build && npm start`, because `npm run dev` alone may not show these bugs.

**Components.** `src/components/ui/` holds the base primitives (Button, Input, Modal, Toast via `ToastProvider`, …). The other folders under `src/components/` are feature or domain components, and each folder has an `index.ts` barrel. Import from barrels (`@/components/ui`, `@/hooks`, `@/lib/api`), use the `@/*` → `src/*` path alias, and merge classes with `cn()` from `@/lib/utils`.

## Design references

`.impeccable/` is gitignored and exists only on this machine. It contains design critique notes and wireframe/reference images ("Wireframes San Pablo") from earlier redesign work. Consult it when doing visual or UX changes.
