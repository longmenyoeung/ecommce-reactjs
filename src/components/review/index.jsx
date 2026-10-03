import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

/**
 * Product Review Card Component
 */
export function ReviewCard({ name, rating = 5, comment, date }) {
  return (
    <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{name}</span>
        <div style={{ display: 'flex', color: 'var(--warning)' }}>
          {Array.from({ length: rating }).map((_, i) => (
            <StarIcon key={i} style={{ width: '16px', height: '16px' }} />
          ))}
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{comment}</p>
      {date && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>{date}</span>}
    </div>
  );
}

export default ReviewCard;
