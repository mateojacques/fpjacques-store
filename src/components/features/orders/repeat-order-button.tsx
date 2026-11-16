'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { useCart } from '@/hooks/use-cart';
import { useRepeatOrder } from '@/hooks/use-orders';
import { ApiException } from '@/lib/api';

interface RepeatOrderButtonProps {
  orderId: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Put a past order's products back in the cart, at today's prices. A cart that
 * already has products is replaced only after confirming.
 */
export function RepeatOrderButton({ orderId, size = 'sm' }: RepeatOrderButtonProps) {
  const router = useRouter();
  const { data: cartData } = useCart();
  const repeatOrder = useRepeatOrder();
  const { error: showError } = useToast();
  const [confirming, setConfirming] = useState(false);

  const cartHasItems = (cartData?.data?.items.length ?? 0) > 0;

  const repeat = async () => {
    setConfirming(false);
    try {
      await repeatOrder.mutateAsync(orderId);
      router.push('/carrito');
    } catch (err) {
      showError(
        'Error',
        err instanceof ApiException ? err.message : 'No se pudo repetir el pedido.'
      );
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size={size}
        isLoading={repeatOrder.isPending}
        onClick={() => (cartHasItems ? setConfirming(true) : repeat())}
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Repetir pedido
      </Button>

      <Modal isOpen={confirming} onClose={() => setConfirming(false)} title="Repetir pedido" size="sm">
        <p className="text-sm text-gray-700">
          El carrito tiene productos. ¿Reemplazarlos por los de este pedido?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={repeat}>
            Reemplazar
          </Button>
        </div>
      </Modal>
    </>
  );
}
