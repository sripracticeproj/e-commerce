'use client';

import React, { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

type ToastListener = (message: string, type: ToastType, duration?: number) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  success(message: string, duration?: number) {
    listeners.forEach(l => l(message, 'success', duration));
  },
  error(message: string, duration?: number) {
    listeners.forEach(l => l(message, 'error', duration));
  },
  info(message: string, duration?: number) {
    listeners.forEach(l => l(message, 'info', duration));
  },
  warning(message: string, duration?: number) {
    listeners.forEach(l => l(message, 'warning', duration));
  }
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (message: string, type: ToastType, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts(prev => [...prev, { id, message, type, duration }]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    };

    listeners.add(handleToast);
    return () => {
      listeners.delete(handleToast);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`p-4 rounded-xl shadow-2xl border flex items-start justify-between pointer-events-auto animate-slideIn bg-zinc-900/95 backdrop-blur-md transition-all duration-300 ${
            t.type === 'success' ? 'border-emerald-500/30 text-emerald-400' :
            t.type === 'error' ? 'border-rose-500/30 text-rose-450' :
            t.type === 'warning' ? 'border-amber-500/30 text-amber-400' :
            'border-zinc-700/50 text-zinc-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-base shrink-0 select-none">
              {t.type === 'success' && '✨'}
              {t.type === 'error' && '🛑'}
              {t.type === 'warning' && '⚠️'}
              {t.type === 'info' && 'ℹ️'}
            </span>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold leading-relaxed break-words">{t.message}</p>
            </div>
          </div>
          <button
            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            className="text-zinc-500 hover:text-zinc-300 transition-colors ml-4 text-xs font-bold leading-none select-none p-1"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
