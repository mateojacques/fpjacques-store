'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input, Card, Select, Spinner } from '@/components/ui';
import { useRegister } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/toast';
import { ApiException } from '@/lib/api';
import { safeNext } from '@/lib/utils/safe-next';
import { applyApiFieldErrors, ivaStatusOptions } from '@/lib/utils/account-form';
import type { IvaStatus } from '@/types';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
    email: z.string().email('Correo electrónico no válido.'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirmPassword: z.string(),
    phone: z.string().min(8, 'Ingrese un número de WhatsApp válido, con código de área.'),
    institutionName: z
      .string()
      .trim()
      .min(2, 'El nombre de la institución debe tener al menos 2 caracteres.'),
    cuit: z.string().optional(),
    legalName: z.string().max(255, 'La razón social es demasiado larga.').optional(),
    ivaStatus: z.string().optional(),
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
  institutionName: 'institutionName',
  cuit: 'cuit',
  legalName: 'legalName',
  ivaStatus: 'ivaStatus',
};

const blankToUndefined = (value?: string) => (value && value.trim() ? value.trim() : undefined);

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

  const billingError = errors.cuit || errors.legalName || errors.ivaStatus;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        institutionName: data.institutionName,
        cuit: blankToUndefined(data.cuit),
        legalName: blankToUndefined(data.legalName),
        ivaStatus: blankToUndefined(data.ivaStatus) as IvaStatus | undefined,
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
          Cuenta de la institución, para ver precios mayoristas y enviar pedidos.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Institución"
          type="text"
          placeholder="Nombre de la escuela, biblioteca u organización"
          error={errors.institutionName?.message}
          {...register('institutionName')}
        />

        <Input
          label="Nombre de contacto"
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
          placeholder="11 5512 3456"
          autoComplete="tel"
          helperText="El pedido se confirma por este medio."
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

        <details className="rounded-lg border border-gray-200 p-4" open={Boolean(billingError)}>
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Datos de facturación (opcional)
          </summary>
          <div className="mt-4 space-y-4">
            <Input
              label="CUIT"
              type="text"
              inputMode="numeric"
              placeholder="20-12345678-6"
              error={errors.cuit?.message}
              {...register('cuit')}
            />
            <Input
              label="Razón social"
              type="text"
              error={errors.legalName?.message}
              {...register('legalName')}
            />
            <Select
              label="Condición frente al IVA"
              options={ivaStatusOptions}
              error={errors.ivaStatus?.message}
              {...register('ivaStatus')}
            />
          </div>
        </details>

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
