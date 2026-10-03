import React, { useState } from 'react';
import Button from '../../../components/common/Button';

/**
 * Price Range Filter Component for Shop Feature
 */
export function PriceFilter({ onApply }) {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleApply = (e) => {
    e.preventDefault();
    if (onApply) onApply(parseFloat(minPrice || 0), parseFloat(maxPrice || 999999));
  };

  return (
    <form onSubmit={handleApply} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <input
        type="number"
        placeholder="Min $"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        style={{ width: '80px', padding: '8px 10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
      />
      <span>-</span>
      <input
        type="number"
        placeholder="Max $"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        style={{ width: '80px', padding: '8px 10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
      />
      <Button type="submit" variant="secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>Filter</Button>
    </form>
  );
}

export default PriceFilter;
