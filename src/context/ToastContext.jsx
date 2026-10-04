import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircleIcon, InformationCircleIcon, XMarkIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  // Tracks the pending auto-dismiss timeout so a NEW toast can cancel the
  // previous toast's timer. Without this, an earlier toast dismissed the newer
  // one early: the checkout -> payment -> order-confirmed chain fires several
  // toasts a few seconds apart, and the newest notification disappeared long
  // before its own 4.5s window was over.
  const dismissTimerRef = useRef(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback((options) => {
    if (!options) return;
    const toastObj = typeof options === 'string'
      ? { type: 'info', title: 'Notification', text: options }
      : {
          type: options.type || 'info',
          title: options.title || 'Notice',
          text: options.text || options.message || ''
        };
    setToast(toastObj);

    // Auto-dismiss after 4.5s (always restarted from now, never inherited
    // from a toast that was already on screen).
    clearDismissTimer();
    dismissTimerRef.current = setTimeout(() => {
      setToast(null);
      dismissTimerRef.current = null;
    }, 4500);
  }, [clearDismissTimer]);

  const dismissToast = useCallback(() => {
    clearDismissTimer();
    setToast(null);
  }, [clearDismissTimer]);

  // Clear any pending timer if the provider unmounts.
  useEffect(() => clearDismissTimer, [clearDismissTimer]);

  return (
    <ToastContext.Provider value={{ toast, showToast, dismissToast }}>
      {children}
      {toast && (
        <div
          className="glass-panel animate-fade-in floating-toast"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999999,
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            maxWidth: '400px'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              backgroundColor:
                toast.type === 'success'
                  ? 'var(--success-bg, rgba(16, 185, 129, 0.15))'
                  : toast.type === 'remove' || toast.type === 'error'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'var(--bg-secondary)',
              color:
                toast.type === 'success'
                  ? 'var(--success, #10b981)'
                  : toast.type === 'remove' || toast.type === 'error'
                  ? 'var(--color-accent, #ef4444)'
                  : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {toast.type === 'success' ? (
              <CheckCircleIcon style={{ width: '22px', height: '22px' }} />
            ) : toast.type === 'remove' ? (
              <TrashIcon style={{ width: '20px', height: '20px' }} />
            ) : toast.type === 'error' ? (
              <ExclamationTriangleIcon style={{ width: '22px', height: '22px' }} />
            ) : (
              <InformationCircleIcon style={{ width: '22px', height: '22px' }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {toast.title}
            </h5>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {toast.text}
            </p>
          </div>
          <button
            onClick={dismissToast}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '4px',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            aria-label="Dismiss toast"
          >
            <XMarkIcon style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      )}
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
