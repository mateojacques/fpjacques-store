"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Button, Card, Spinner } from "@/components/ui";
import { CheckoutSteps } from "@/components/features/checkout/checkout-steps";
import { useCheckoutReview, useConfirmOrder } from "@/hooks/use-checkout";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";
import { ApiException } from "@/lib/api";

export default function CheckoutReviewPage() {
  const router = useRouter();
  const { data, isLoading, error } = useCheckoutReview();
  const confirmOrder = useConfirmOrder();
  const { success, error: showError } = useToast();
  const queryClient = useQueryClient();

  // Send the customer where the problem can be fixed, and say why
  const leaveReview = (err: unknown) => {
    if (err instanceof ApiException && err.code === "PRODUCTS_UNAVAILABLE") {
      showError(
        "Productos no disponibles",
        "Quite del carrito los productos marcados como no disponibles para continuar.",
      );
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      router.push("/carrito");
      return;
    }
    if (err instanceof ApiException && err.code === "CONTACT_NOT_PROVIDED") {
      router.push("/checkout");
      return;
    }
    showError(
      "Error",
      err instanceof ApiException
        ? err.message
        : "No se pudo cargar la revisión del pedido.",
    );
    router.push("/checkout");
  };

  useEffect(() => {
    if (!isLoading && error) {
      leaveReview(error);
    }
    // Run once per failed load; leaveReview is recreated each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, error]);

  const handleConfirmOrder = async () => {
    try {
      const result = await confirmOrder.mutateAsync();
      success(
        "Pedido enviado",
        `Número de pedido: ${result.data.orderNumber}`,
      );
      router.push(
        `/checkout/confirmacion?orderNumber=${result.data.orderNumber}`,
      );
    } catch (err) {
      if (err instanceof ApiException && err.code === "PRODUCTS_UNAVAILABLE") {
        leaveReview(err);
      } else if (err instanceof ApiException) {
        showError("Error", err.message);
      } else {
        showError("Error", "No se pudo enviar el pedido.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const review = data?.data;
  if (!review) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <CheckoutSteps currentStep={2} />

      <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-6">
        Revisar pedido
      </h1>

      <div className="space-y-6">
        {/* Contact Information */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Datos de contacto
            </h2>
            <Link
              href="/checkout"
              className="text-sm text-[var(--color-primary)] hover:opacity-80"
            >
              Editar
            </Link>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-gray-500">Nombre</dt>
                <dd className="font-medium text-gray-900">
                  {review.contact.fullName}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-gray-500">Correo electrónico</dt>
                <dd className="font-medium text-gray-900">
                  {review.contact.email}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-gray-500">WhatsApp</dt>
                <dd className="font-medium text-gray-900">
                  {review.contact.phone}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-gray-500">Dirección de entrega</dt>
                <dd className="font-medium text-gray-900">
                  {review.contact.address}
                </dd>
              </div>
            </div>
          </dl>

          {review.contact.customerNotes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <dt className="text-sm text-gray-500">Notas</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {review.contact.customerNotes}
              </dd>
            </div>
          )}
        </Card>

        {/* Order Items */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Productos
          </h2>

          <ul className="divide-y divide-gray-200">
            {review.items.map((item) => (
              <li key={item.productId} className="py-4 flex gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ShoppingBag className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(item.unitPrice)} x {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatPrice(item.totalPrice)}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        {/* Order Summary */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h2>

          <div className="flex justify-between text-base font-semibold">
            <span className="text-gray-900">Total estimado</span>
            <span className="text-[var(--color-primary)]">
              {formatPrice(review.total)}
            </span>
          </div>
        </Card>

        <p className="text-sm text-gray-600">
          Los precios, la disponibilidad, el pago y la entrega se confirman por
          WhatsApp después de enviar el pedido.
        </p>

        {/* Actions */}
        <div className="flex justify-between">
          <Link href="/checkout">
            <Button variant="outline" type="button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <Button
            onClick={handleConfirmOrder}
            isLoading={confirmOrder.isPending}
          >
            Enviar pedido
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
