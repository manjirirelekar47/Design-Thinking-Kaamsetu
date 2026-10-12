import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          let bg = 'bg-navy-800 text-white border-navy-700';
          let icon = 'ℹ️';
          if (toast.type === 'success') {
            bg = 'bg-emerald-800 text-white border-emerald-600';
            icon = '✅';
          } else if (toast.type === 'error') {
            bg = 'bg-rose-800 text-white border-rose-600';
            icon = '⚠️';
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-800 text-white border-amber-600';
            icon = '🔔';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl text-sm font-medium transition-all transform animate-in fade-in slide-in-from-top-2 duration-200 ${bg}`}
              role="alert"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg flex-shrink-0">{icon}</span>
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 text-xs px-1.5 py-0.5 rounded transition"
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
