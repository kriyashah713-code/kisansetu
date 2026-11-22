import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast, t } = useKisanSetu();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full md:bottom-6 pointer-events-none"
    >
      {toasts.map((toast) => {
        const icon =
          toast.variant === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#216B43] shrink-0 mt-0.5" />
          ) : toast.variant === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
          ) : toast.variant === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-[#143A28] shrink-0 mt-0.5" />
          );

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 bg-white border border-[#DEDAD0] rounded-xl p-3.5 shadow-lg text-[#17231B]"
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-snug">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-[#546358] mt-0.5 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label={t('common.dismissNotification')}
              className="p-1 text-[#6A786E] hover:text-[#17231B] rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
