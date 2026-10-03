import React from 'react';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDate } from '../../../utils/formatDate';

/**
 * Order Detail Page Component
 */
export function OrderDetail({ order }) {
  if (!order) return null;

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '1.5rem', fontWeight: '800' }}>Order #{order.id} Details</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Placed on {formatDate(order.date || new Date())}</p>
        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px' }}>
          <h4 style={{ margin: '0 0 12px' }}>Total Amount: <span style={{ color: 'var(--accent-primary)' }}>{formatPrice(order.total || 0)}</span></h4>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
