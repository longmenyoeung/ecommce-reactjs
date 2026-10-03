import React from 'react';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';

/**
 * Reusable UI Empty State Component
 */
export function Empty({ title = 'No Items Found', description = 'We could not find anything matching your criteria.', icon: Icon = CubeTransparentIcon, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 20px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)', margin: '24px 0' }}>
      <Icon style={{ width: '56px', height: '56px', color: 'var(--text-muted)', marginBottom: '16px' }} />
      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 0 20px', fontSize: '0.92rem' }}>{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export default Empty;
