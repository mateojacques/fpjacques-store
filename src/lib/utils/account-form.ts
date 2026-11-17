import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiException } from '@/lib/api';

/**
 * Put an API VALIDATION_ERROR's details on the form fields they name. `paths`
 * maps an API path (`phone`, `email`) to a form field. Returns true
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
