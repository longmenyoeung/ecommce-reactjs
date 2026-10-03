import React from 'react';

/**
 * Reusable UI Input Component
 */
export function Input({
  label,
  icon: Icon,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  style = {},
  ...props
}) {
  return (
    <div style={{ marginBottom: '14px', ...style }}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && <Icon style={{ width: '18px', height: '18px', color: 'var(--text-muted)', position: 'absolute', left: '14px' }} />}
        <input
          type={type}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: Icon ? '11px 14px 11px 40px' : '11px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-secondary)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border-color)'}`,
            color: 'var(--text-primary)',
            fontSize: '0.9rem'
          }}
          {...props}
        />
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.78rem', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}

export default Input;
