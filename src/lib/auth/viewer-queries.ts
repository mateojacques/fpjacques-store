import type { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { clearSessionId } from '@/lib/utils';

/** Queries whose prices depend on who is logged in. */
const PRICED_KEYS = [['products'], ['product'], ['carousel'], ['carousels'], ['cart']] as const;

/** Queries that belong to one user and must not outlive their session. */
const PRIVATE_KEYS = [['orders'], ['order'], ['profile'], ['checkout']] as const;

/**
 * Run after login, sign-up or logout: refetch every price for the new viewer
 * and drop the previous user's private data.
 */
export function resetViewerQueries(queryClient: QueryClient): void {
  for (const queryKey of PRIVATE_KEYS) {
    queryClient.cancelQueries({ queryKey });
    queryClient.removeQueries({ queryKey });
  }
  for (const queryKey of PRICED_KEYS) {
    queryClient.invalidateQueries({ queryKey });
  }
}

/**
 * Log out on this device: clear the token and user, the cart drawer, the guest
 * session, and every query that showed this user's prices or data.
 */
export function endSession(queryClient: QueryClient): void {
  useAuthStore.getState().logout();
  const cart = useCartStore.getState();
  cart.closeCart();
  cart.clearCart();
  cart.setRepeatSkipped([]);
  clearSessionId();
  resetViewerQueries(queryClient);
  // Don't keep showing the user's cart while the guest cart loads
  queryClient.resetQueries({ queryKey: ['cart'] });
}
