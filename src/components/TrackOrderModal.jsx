import React, { useState } from 'react';
import {
  XMarkIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export function TrackOrderModal({ isOpen, onClose, onTrack }) {
  const [orderId, setOrderId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    onTrack(orderId.trim());
    setOrderId('');
    onClose();
  };

  const handleQuickDemo = (demoId) => {
    onTrack(demoId);
    setOrderId('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(15, 20, 30, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '32px 28px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-primary)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
          aria-label="Close modal"
        >
          <XMarkIcon style={{ width: '22px', height: '22px' }} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px'
            }}
          >
            <TruckIcon style={{ width: '28px', height: '28px' }} />
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Track Your Order
          </h3>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Enter your order or tracking number to view real-time delivery status.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              gap: '10px'
            }}
          >
            <MagnifyingGlassIcon style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              autoFocus
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 10245 or ORD-10245"
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!orderId.trim()}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              justifyContent: 'center',
              fontWeight: '700',
              opacity: orderId.trim() ? 1 : 0.6
            }}
          >
            Locate Shipment
          </button>
        </form>

        {/* Quick sample chips */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Quick demo tracking:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleQuickDemo('10245')}
              className="badge"
              style={{
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)'
              }}
            >
              #10245 (Express In-Transit)
            </button>
            <button
              onClick={() => handleQuickDemo('10248')}
              className="badge"
              style={{
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)'
              }}
            >
              #10248 (Processing)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackOrderModal;
