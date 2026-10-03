import React from 'react';

/**
 * Reusable UI Loading Spinner Component
 */
export function Loading({ text = 'Loading...', size = '40px' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '16px' }}>
      <div style={{
        width: size,
        height: size,
        border: '3px solid var(--border-color)',
        borderTopColor: 'var(--accent-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      {text && <p style={{ color: 'var(--text-secondary)', fontWeight: '600', margin: 0, fontSize: '0.9rem' }}>{text}</p>}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Loading;
