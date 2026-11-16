'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card } from '@/components/ui';
import { useForgotPassword } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/toast';
import { ApiException } from '@/lib/api';

const forgotSchema = z.object({
  email: z.string().email('Correo electrónico no válido.'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const { error: showError } = useToast();
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      const response = await forgotPassword.mutateAsync(data);
      setSentMessage(response.data.message);
    } catch (err) {
      showError(
        'Error',
        err instanceof ApiException ? err.message : 'No se pudo enviar el enlace.'
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Restablecer la contraseña</h1>
          {!sentMessage && (
            <p className="mt-2 text-sm text-gray-600">
              Se enviará un enlace al correo electrónico de la cuenta.
            </p>
          )}
        </div>

        {sentMessage ? (
          <p className="text-center text-sm text-gray-700" role="status">
            {sentMessage}
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="nombre@ejemplo.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={forgotPassword.isPending}
            >
              Enviar enlace
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </Card>
    </div>
  );
}
