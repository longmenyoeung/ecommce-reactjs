import React from 'react';

/**
 * Sort Dropdown Component for Shop Feature
 */
export function SortDropdown({ value = 'default', onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      style={{
        padding: '9px 16px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        fontSize: '0.86rem',
        cursor: 'pointer'
      }}
    >
      <option value="default">Default Sorting</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="newest">Newest Arrivals</option>
    </select>
  );
}

export default SortDropdown;
