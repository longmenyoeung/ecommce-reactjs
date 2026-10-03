import React, { useState } from 'react';
import Button from '../common/Button';

/**
 * Reusable Coupon & Discount Input Box Component
 */
export function CouponBox({ onApplyCoupon }) {
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim() && onApplyCoupon) {
      onApplyCoupon(code.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
      <input
        type="text"
        placeholder="Enter promo code (e.g., MAMA2026)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{
          flex: 1,
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          fontSize: '0.88rem'
        }}
      />
      <Button type="submit" variant="secondary" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
        Apply
      </Button>
    </form>
  );
}

export default CouponBox;
