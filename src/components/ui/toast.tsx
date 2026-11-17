'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: ToastAction;
  /** Toasts with the same key replace each other instead of stacking. */
  key?: string;
  /** Free data for keyed toasts that build on the previous one. */
  meta?: Record<string, unknown>;
}

type ToastInput = Omit<Toast, 'id'>;

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: ToastInput) => void;
  /**
   * Shows the toast for `key`, or updates it if it's still on screen. `build`
   * gets the toast being replaced, so it can add to it.
   */
  upsertToast: (key: string, build: (previous: Toast | undefined) => Omit<ToastInput, 'key'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const DURATION_MS = 5000;
const MAX_VISIBLE = 3;

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconStyles = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-amber-600',
  info: 'text-sky-600',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const Icon = toastIcons[toast.type];

  return (
    <div
      className="pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 text-gray-900 shadow-[0_4px_8px_rgb(0_0_0/0.08)] animate-in slide-in-from-bottom"
      role={toast.type === 'error' ? 'alert' : 'status'}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', iconStyles[toast.type])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.message && <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">{toast.message}</p>}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              onRemove();
            }}
            className="mt-2 text-sm font-semibold text-[var(--color-primary-ink)] underline-offset-4 hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="-m-1 flex-shrink-0 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        aria-label="Cerrar aviso"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  /** Id of the toast currently shown for each key. */
  const keyIds = useRef(new Map<string, string>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const removeToast = useCallback((id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    keyIds.current.forEach((toastId, key) => {
      if (toastId === id) keyIds.current.delete(key);
    });
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const scheduleRemoval = useCallback(
    (id: string) => {
      clearTimeout(timers.current.get(id));
      timers.current.set(
        id,
        setTimeout(() => removeToast(id), DURATION_MS)
      );
    },
    [removeToast]
  );

  const addToast = useCallback(
    (toast: ToastInput) => {
      const id = Math.random().toString(36).substring(2);
      setToasts((prev) => [...prev, { ...toast, id }].slice(-MAX_VISIBLE));
      scheduleRemoval(id);
    },
    [scheduleRemoval]
  );

  const upsertToast = useCallback<ToastContextValue['upsertToast']>(
    (key, build) => {
      const id = keyIds.current.get(key) ?? Math.random().toString(36).substring(2);
      keyIds.current.set(key, id);
      setToasts((prev) => {
        const previous = prev.find((t) => t.id === id);
        const next: Toast = { ...build(previous), key, id };
        // Keep its place if it's on screen, so the stack doesn't jump
        return previous
          ? prev.map((t) => (t.id === id ? next : t))
          : [...prev, next].slice(-MAX_VISIBLE);
      });
      scheduleRemoval(id);
    },
    [scheduleRemoval]
  );

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  // Sits above the floating WhatsApp button, full width on phones
  const toastContainer =
    toasts.length > 0 &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        className="pointer-events-none fixed inset-x-4 bottom-24 flex flex-col gap-2 sm:inset-x-auto sm:right-6 sm:w-96"
        style={{ zIndex: 'var(--z-toast)' }}
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>,
      document.body
    );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, upsertToast, removeToast, success, error, warning, info }}
    >
      {children}
      {toastContainer}
    </ToastContext.Provider>
  );
}
