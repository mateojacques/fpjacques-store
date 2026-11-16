import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import type { IvaStatus } from '@/types';
import { ApiException } from '@/lib/api';

export const ivaStatusLabels: Record<IvaStatus, string> = {
  responsable_inscripto: 'Responsable inscripto',
  monotributo: 'Monotributo',
  exento: 'Exento',
  consumidor_final: 'Consumidor final',
};

/** The four statuses plus an empty choice, so the field can stay unset or be cleared. */
export const ivaStatusOptions = [
  { value: '', label: 'Sin especificar' },
  ...(Object.keys(ivaStatusLabels) as IvaStatus[]).map((value) => ({
    value,
    label: ivaStatusLabels[value],
  })),
];

/** CUIT as it's usually read: 20-12345678-6. */
export function formatCuit(cuit: string): string {
  return /^\d{11}$/.test(cuit) ? `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}` : cuit;
}

/**
 * Put an API VALIDATION_ERROR's details on the form fields they name. `paths`
 * maps an API path (`cuit`, `institution.cuit`) to a form field. Returns true
 * when at least one detail landed on a field.
 */
export function applyApiFieldErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  paths: Record<string, Path<T>>
): boolean {
  if (!(err instanceof ApiException) || err.code !== 'VALIDATION_ERROR' || !err.details) {
    return false;
  }
  let applied = false;
  for (const detail of err.details) {
    const field = paths[detail.path];
    if (field) {
      setError(field, { type: 'server', message: detail.message });
      applied = true;
    }
  }
  return applied;
}
