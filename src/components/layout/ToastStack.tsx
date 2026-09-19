import { useUIStore } from '@/store/uiStore';

export function ToastStack() {
  const { toasts, dismissToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 md:bottom-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="toast-enter flex items-center justify-between gap-3 rounded-control border border-border bg-surface-raised px-4 py-3 shadow-glass"
        >
          <span className="text-sm text-ink">{toast.message}</span>
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                dismissToast(toast.id);
              }}
              className="shrink-0 text-sm font-semibold text-accent"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
