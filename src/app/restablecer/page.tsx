'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card, Spinner } from '@/components/ui';
import { useResetPassword } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/toast';
import { ApiException } from '@/lib/api';

const INVALID_LINK = 'El enlace no es válido o venció. Solicite uno nuevo.';

const resetSchema = z
  .object({
    newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token');
  const resetPassword = useResetPassword();
  const { success, error: showError } = useToast();
  const [invalidMessage, setInvalidMessage] = useState<string | null>(
    token ? null : INVALID_LINK
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!token) return;
    try {
      await resetPassword.mutateAsync({ token, newPassword: data.newPassword });
      success('Contraseña actualizada.');
      router.push('/login');
    } catch (err) {
      if (err instanceof ApiException && err.code === 'INVALID_RESET_TOKEN') {
        setInvalidMessage(err.message);
        return;
      }
      showError(
        'Error',
        err instanceof ApiException ? err.message : 'No se pudo cambiar la contraseña.'
      );
    }
  };

  return (
    <Card className="w-full max-w-md" padding="lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Contraseña nueva</h1>
      </div>

      {invalidMessage ? (
        <div className="space-y-6 text-center">
          <p className="text-sm text-gray-700" role="alert">
            {invalidMessage}
          </p>
          <Link href="/recuperar">
            <Button className="w-full" size="lg">
              Solicitar un enlace nuevo
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <Input
            label="Nueva contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            label="Confirmar nueva contraseña"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={resetPassword.isPending}
          >
            Guardar contraseña
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<Spinner size="lg" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
