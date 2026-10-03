import React from 'react';
import { formatPrice } from '../../utils/formatPrice';
import Button from '../common/Button';

/**
 * Reusable Cart Summary UI Component
 */
export function CartSummary({ subtotal = 0, discount = 0, shipping = 0, onCheckout }) {
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
      <h3 style={{ margin: '0 0 18px', fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>Order Summary</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <span>Subtotal</span>
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
            <span>Discount</span>
            <span style={{ fontWeight: '600' }}>-{formatPrice(discount)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <span>Estimated Shipping</span>
          <span style={{ fontWeight: '600', color: shipping === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
            {shipping === 0 ? 'FREE' : formatPrice(shipping)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <span style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-primary)' }}>Total</span>
        <span style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--accent-primary)', fontFamily: 'Outfit' }}>{formatPrice(total)}</span>
      </div>

      <Button onClick={onCheckout} style={{ width: '100%', padding: '14px' }}>
        Proceed to Checkout
      </Button>
    </div>
  );
}

export default CartSummary;
