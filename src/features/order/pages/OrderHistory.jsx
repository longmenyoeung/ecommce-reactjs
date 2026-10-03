import React from 'react';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDate } from '../../../utils/formatDate';
import Empty from '../../../components/common/Empty';

/**
 * Order History Page Component
 */
export function OrderHistory({ orders = [] }) {
  if (!orders || orders.length === 0) {
    return <Empty title="No Past Orders" description="You have not placed any orders yet. Start shopping our premium essentials!" />;
  }

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '24px' }}>Order History</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {orders.map((order, i) => (
          <div key={i} className="glass-card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>Order #{order.id || (1000 + i)}</span>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Placed on {formatDate(order.date || new Date())}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--success-bg)', color: 'var(--success)', fontSize: '0.8rem', fontWeight: '700' }}>
                {order.status || 'Delivered'}
              </span>
              <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--accent-primary)', fontFamily: 'Outfit' }}>
                {formatPrice(order.total || 149.99)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderHistory;
