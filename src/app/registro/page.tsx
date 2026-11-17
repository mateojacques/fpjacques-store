'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input, Card, Spinner } from '@/components/ui';
import { useRegister } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/toast';
import { ApiException } from '@/lib/api';
import { safeNext } from '@/lib/utils/safe-next';
import { applyApiFieldErrors } from '@/lib/utils/account-form';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
    email: z.string().email('Correo electrónico no válido.'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirmPassword: z.string(),
    phone: z.string().min(8, 'Ingrese el número con código de área, por ejemplo 11 2345 6789.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const API_FIELDS: Record<string, keyof RegisterFormData> = {
  fullName: 'fullName',
  email: 'email',
  password: 'password',
  phone: 'phone',
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const registerMutation = useRegister();
  const { success, error: showError } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });
      success('Cuenta creada');
      router.push(safeNext(next));
    } catch (err) {
      if (applyApiFieldErrors(err, setError, API_FIELDS)) return;
      showError(
        'Error',
        err instanceof ApiException ? err.message : 'No se pudo crear la cuenta.'
      );
    }
  };

  return (
    <Card className="w-full max-w-md" padding="lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
        <p className="mt-2 text-sm text-gray-600">
          La cuenta se usa para enviar pedidos y ver su estado.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Nombre"
          type="text"
          placeholder="Nombre y apellido"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Correo electrónico"
          type="email"
          placeholder="nombre@ejemplo.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="WhatsApp"
          type="tel"
          placeholder="11 2345 6789"
          autoComplete="tel"
          helperText="Código de área y número, sin +54. El pedido se confirma por este medio."
          error={errors.phone?.message}
          {...register('phone')}
        />

        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <Input
          label="Confirmar contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repetir contraseña"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full" size="lg" isLoading={registerMutation.isPending}>
          Crear cuenta
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Cuenta existente:{' '}
          <Link
            href={next ? `/login?next=${encodeURIComponent(safeNext(next))}` : '/login'}
            className="font-medium text-[var(--color-primary)] hover:opacity-80"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<Spinner size="lg" />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
