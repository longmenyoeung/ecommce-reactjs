import React from 'react';

/**
 * Checkout Form Component
 */
export function CheckoutForm({ onSubmit }) {
  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem' }}>Shipping Information</h3>
      <p style={{ color: 'var(--text-secondary)' }}>Please verify your shipping details to complete your order.</p>
    </div>
  );
}

export default CheckoutForm;
