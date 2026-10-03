import React from 'react';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

/**
 * Reusable UI Breadcrumb Navigation Component
 */
export function Breadcrumb({ items = [], onNavigate }) {
  return (
    <nav aria-label="breadcrumb" style={{ margin: '16px 0', fontSize: '0.85rem' }}>
      <ol style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
        <li>
          <button
            onClick={() => onNavigate && onNavigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '500' }}
          >
            <HomeIcon style={{ width: '15px', height: '15px' }} />
            <span>Home</span>
          </button>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <li><ChevronRightIcon style={{ width: '13px', height: '13px', color: 'var(--text-muted)' }} /></li>
              <li>
                {isLast || !item.path ? (
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{item.label}</span>
                ) : (
                  <button
                    onClick={() => onNavigate && onNavigate(item.path)}
                    style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '500' }}
                  >
                    {item.label}
                  </button>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
