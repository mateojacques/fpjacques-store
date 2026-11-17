'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock } from 'lucide-react';
import { Button, Input, Card, CardTitle, Spinner } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useUpdateProfile, useChangePassword } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/toast';
import { ApiException } from '@/lib/api';
import { safeNext } from '@/lib/utils/safe-next';
import { applyApiFieldErrors } from '@/lib/utils/account-form';
import type { UpdateProfileInput, UserProfile } from '@/types';

const profileSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Correo electrónico no válido.'),
  phone: z
    .string()
    .refine(
      (value) => value.trim() === '' || value.trim().length >= 8,
      'Ingrese el número con código de área, por ejemplo 11 2345 6789.'
    ),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria.'),
    newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const API_FIELDS: Record<string, keyof ProfileFormData> = {
  fullName: 'fullName',
  email: 'email',
  phone: 'phone',
};

function formValues(user: UserProfile): ProfileFormData {
  return {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? '',
  };
}

function toUpdateInput(data: ProfileFormData): UpdateProfileInput {
  const input: UpdateProfileInput = { fullName: data.fullName, email: data.email };
  const phone = data.phone.trim();
  if (phone) input.phone = phone;
  return input;
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const { success, error: showError } = useToast();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: user ? formValues(user) : undefined,
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Update form when user changes
  useEffect(() => {
    if (user) {
      profileForm.reset(formValues(user));
    }
  }, [user, profileForm]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?next=/perfil');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const incomplete = !user.phone;
  const errors = profileForm.formState.errors;

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync(toUpdateInput(data));
      success('Perfil actualizado');
      if (next) router.push(safeNext(next));
    } catch (err) {
      if (applyApiFieldErrors(err, profileForm.setError, API_FIELDS)) return;
      showError(
        'Error',
        err instanceof ApiException ? err.message : 'No se pudo actualizar el perfil.'
      );
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      success('Contraseña actualizada.');
      passwordForm.reset();
    } catch (err) {
      if (err instanceof ApiException) {
        showError('Error', err.message);
      } else {
        showError('Error', 'No se pudo cambiar la contraseña.');
      }
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Mi perfil</h1>

      {incomplete && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Complete el WhatsApp para enviar pedidos.
        </div>
      )}

      <div className="space-y-8">
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8" noValidate>
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                <User className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <CardTitle>Contacto</CardTitle>
            </div>

            <div className="space-y-4">
              <Input
                label="Nombre"
                autoComplete="name"
                error={errors.fullName?.message}
                {...profileForm.register('fullName')}
              />
              <Input
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...profileForm.register('email')}
              />
              <Input
                label="WhatsApp"
                type="tel"
                placeholder="11 2345 6789"
                autoComplete="tel"
                helperText="Código de área y número, sin +54. El pedido se confirma por este medio."
                error={errors.phone?.message}
                {...profileForm.register('phone')}
              />
            </div>
          </Card>

          <Button type="submit" isLoading={updateProfile.isPending}>
            Guardar cambios
          </Button>
        </form>

        {/* Change Password */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
              <Lock className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <CardTitle>Cambiar contraseña</CardTitle>
          </div>

          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              label="Contraseña actual"
              type="password"
              autoComplete="current-password"
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword')}
            />

            <Input
              label="Nueva contraseña"
              type="password"
              autoComplete="new-password"
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register('newPassword')}
            />

            <Input
              label="Confirmar nueva contraseña"
              type="password"
              autoComplete="new-password"
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register('confirmPassword')}
            />

            <Button type="submit" isLoading={changePassword.isPending}>
              Cambiar contraseña
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
