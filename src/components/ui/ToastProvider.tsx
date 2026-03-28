"use client";

import React, { createContext, useCallback, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'achievement';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const TYPE_STYLES: Record<ToastType, { border: string; icon: string }> = {
  success:     { border: 'var(--color-gold)',   icon: '✦' },
  achievement: { border: 'var(--color-gold)',   icon: '🏆' },
  error:       { border: '#C0392B',              icon: '⚠' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        alignItems: 'center',
        pointerEvents: 'none',
        width: 'max-content',
        maxWidth: '90vw',
      }}>
        <AnimatePresence>
          {toasts.map(toast => {
            const style = TYPE_STYLES[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'linear-gradient(135deg, #4A2C1A 0%, #3E2318 100%)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-heavy)',
                  borderLeft: `4px solid ${style.border}`,
                  color: 'var(--color-parchment)',
                  fontFamily: 'var(--font-body-stack)',
                  fontSize: 'var(--text-sm)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'auto',
                }}
              >
                <span style={{ fontSize: 'var(--text-base)' }}>{style.icon}</span>
                <span>{toast.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
