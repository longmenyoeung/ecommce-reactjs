import React from 'react';

/**
 * Authentication Screens Layout Wrapper
 */
export function AuthLayout({ children, title = 'Authentication' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '24px'
    }}>
      <div className="glass-panel animate-spring-modal" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '32px',
        borderRadius: 'var(--radius-lg)'
      }}>
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
