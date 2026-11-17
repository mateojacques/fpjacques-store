"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button, Input, Textarea, Card } from "@/components/ui";
import { useSaveCheckoutContact } from "@/hooks/use-checkout";
import { useCart } from "@/hooks/use-cart";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/ui/toast";
import { ApiException } from "@/lib/api";
import { CHECKOUT_LOGIN_PATH } from "@/lib/utils/safe-next";
import { CheckoutSteps } from "@/components/features/checkout/checkout-steps";
import {
  UnavailableItemsNotice,
  countUnavailableItems,
} from "@/components/features/cart";

const contactSchema = z.object({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Correo electrónico no válido."),
  phone: z.string().min(8, "Ingrese el número con código de área, por ejemplo 11 2345 6789."),
  address: z.string().min(10, "La dirección debe tener al menos 10 caracteres."),
  customerNotes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function CheckoutContactPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  // Fetch the cart again on arrival, so availability is checked before the form shows
  const {
    data: cartData,
    isLoading: cartLoading,
    isFetchedAfterMount: cartChecked,
  } = useCart({ fresh: true });
  const saveContact = useSaveCheckoutContact();
  const { error: showError } = useToast();

  // Track if component has mounted (for hydration)
  const [hasMounted, setHasMounted] = useState(false);
  // Track if form has been initialized with user data
  const [formInitialized, setFormInitialized] = useState(false);

  const cart = cartData?.data;
  const isEmpty = !cart?.items || cart.items.length === 0;
  const unavailableCount = countUnavailableItems(cart);

  // Create initial form values only once after auth is loaded
  const initialFormValues = useMemo<ContactFormData>(() => {
    return {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: "",
      customerNotes: "",
    };
  }, [user?.fullName, user?.email, user?.phone]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setError,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur", // Changed from default to validate only on blur initially
    defaultValues: initialFormValues,
  });

  // Get form values for controlled component fallback
  const formValues = watch();

  // Set mounted state on client side
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Update form with user data after auth loading completes
  // Only do this once to avoid conflicts with user interactions
  useEffect(() => {
    if (hasMounted && !authLoading && !formInitialized) {
      // Reset the form with the correct values from user profile
      reset(initialFormValues, {
        keepValues: false,
        keepDirty: false,
        keepTouched: false,
      });
      setFormInitialized(true);
    }
  }, [hasMounted, authLoading, formInitialized, initialFormValues, reset]);

  // Ordering needs an account: send a visitor to log in or sign up first
  useEffect(() => {
    if (hasMounted && !authLoading && !isAuthenticated) {
      router.replace(CHECKOUT_LOGIN_PATH);
    }
  }, [hasMounted, authLoading, isAuthenticated, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && isEmpty) {
      router.push("/carrito");
    }
  }, [cartLoading, isEmpty, router]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      await saveContact.mutateAsync(data);
      router.push("/checkout/revision");
    } catch (err) {
      if (err instanceof ApiException) {
        const phoneError = err.details?.find((detail) => detail.path === "phone");
        if (phoneError) {
          setError("phone", { message: phoneError.message });
          return;
        }
        showError("Error", err.message);
      } else {
        showError("Error", "No se pudieron guardar los datos.");
      }
    }
  };

  // Show loading while component is mounting or auth/cart is loading
  // Wait for form to be properly initialized
  if (
    !hasMounted ||
    !formInitialized ||
    authLoading ||
    !isAuthenticated ||
    cartLoading ||
    !cartChecked
  ) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-gray-300" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          El carrito está vacío
        </h1>
        <Link href="/productos">
          <Button className="mt-6">Ver productos</Button>
        </Link>
      </div>
    );
  }

  if (unavailableCount > 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <CheckoutSteps currentStep={1} />
        <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-6">
          Revise el carrito
        </h1>
        <UnavailableItemsNotice count={unavailableCount} />
        <Link href="/carrito" className="inline-block mt-6">
          <Button>Ir al carrito</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <CheckoutSteps currentStep={1} />

      <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-6">
        Datos de contacto
      </h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre completo"
              placeholder="Nombre y apellido"
              error={errors.fullName?.message}
              {...register("fullName")}
            />

            <Input
              label="Correo electrónico"
              type="email"
              placeholder="nombre@ejemplo.com"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <Input
            label="WhatsApp"
            type="tel"
            placeholder="11 2345 6789"
            helperText="Código de área y número, sin +54. El pedido se confirma por este medio."
            error={errors.phone?.message}
            {...register("phone")}
          />

          <Textarea
            label="Dirección de entrega"
            placeholder="Calle, número, localidad y provincia"
            error={errors.address?.message}
            {...register("address")}
          />

          <Textarea
            label="Notas adicionales (opcional)"
            placeholder="Instrucciones para el pedido"
            {...register("customerNotes")}
          />

          <div className="flex justify-between pt-4">
            <Link href="/carrito">
              <Button variant="outline" type="button">
                Volver al carrito
              </Button>
            </Link>
            <Button type="submit" isLoading={saveContact.isPending}>
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
