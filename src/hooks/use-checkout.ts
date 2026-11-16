import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkoutApi } from '@/lib/api';
import type { CheckoutContactInput } from '@/types';
import { useCartStore } from '@/stores/cart-store';

/**
 * Hook to save checkout contact information
 */
export function useSaveCheckoutContact() {
  return useMutation({
    mutationFn: (data: CheckoutContactInput) => checkoutApi.saveContact(data),
  });
}

/**
 * Hook to get checkout review data
 */
export function useCheckoutReview({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['checkout', 'review'],
    queryFn: () => checkoutApi.review(),
    staleTime: 0, // Always fresh
    enabled,
    // A missing profile or contact is not fixed by retrying
    retry: false,
  });
}

/**
 * Hook to confirm order
 */
export function useConfirmOrder() {
  const queryClient = useQueryClient();
  const { clearCart } = useCartStore();

  return useMutation({
    mutationFn: () => checkoutApi.confirm(),
    onSuccess: () => {
      // Clear cart after successful order
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
