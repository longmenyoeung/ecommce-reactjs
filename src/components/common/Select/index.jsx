import React from 'react';

/**
 * Reusable UI Select Component
 */
export function Select({ label, options = [], value, onChange, name, style = {} }) {
  return (
    <div style={{ marginBottom: '14px', ...style }}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
          {label}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '11px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          fontSize: '0.9rem'
        }}
      >
        {options.map((opt, i) => (
          <option key={i} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Select;
