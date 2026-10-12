import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        let bg = 'bg-slate-900 text-white border-slate-800';
        let Icon = Info;
        let iconColor = 'text-yellow-400';

        if (toast.type === 'success') {
          bg = 'bg-emerald-900 text-white border-emerald-700';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'error') {
          bg = 'bg-rose-900 text-white border-rose-700';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-900 text-white border-amber-700';
          Icon = AlertTriangle;
          iconColor = 'text-yellow-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-2xl text-xs sm:text-sm font-bold transition-all transform animate-in fade-in slide-in-from-top-2 duration-200 ${bg}`}
            role="alert"
          >
            <div className="flex items-center gap-2.5">
              <Icon size={18} className={`flex-shrink-0 ${iconColor}`} />
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="opacity-70 hover:opacity-100 p-1 text-slate-300 hover:text-white transition"
              aria-label="Close notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
