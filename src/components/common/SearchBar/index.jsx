import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Reusable UI SearchBar Component
 */
export function SearchBar({ value, onChange, placeholder = 'Search products...', onClear }) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
      <MagnifyingGlassIcon style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--text-muted)' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 36px 10px 42px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          fontSize: '0.9rem',
          outline: 'none',
          transition: 'border-color 0.25s'
        }}
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
        >
          <XMarkIcon style={{ width: '16px', height: '16px' }} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
