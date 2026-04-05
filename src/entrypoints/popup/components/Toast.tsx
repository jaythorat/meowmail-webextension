import { useState, useEffect, useCallback } from 'preact/hooks';

export type ToastType = 'error' | 'success' | 'info';

export interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
const listeners = new Set<(toast: ToastData) => void>();

export function showToast(message: string, type: ToastType = 'error') {
  const toast: ToastData = { id: ++toastId, message, type };
  for (const fn of listeners) fn(toast);
}

const COLORS: Record<ToastType, string> = {
  error: 'bg-danger/15 border-danger/30 text-danger',
  success: 'bg-success/15 border-success/30 text-success',
  info: 'bg-info/15 border-info/30 text-info',
};

const ToastItem = ({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 200);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      class={`
        px-3 py-2 rounded-lg border text-xs font-mono
        transition-all duration-200
        ${COLORS[toast.type]}
        ${exiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `}
      style="animation: slide-down 0.2s ease-out"
    >
      {toast.message}
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handler = (toast: ToastData) => {
      setToasts((prev) => [...prev.slice(-2), toast]); // keep max 3
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div class="fixed bottom-12 left-3 right-3 z-50 flex flex-col gap-1.5 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} class="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
