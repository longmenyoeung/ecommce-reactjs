import React from 'react';
import ReviewCard from '../../../components/review';

/**
 * Product Review Section Component for Product Feature
 */
export function ProductReview({ reviews = [] }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div style={{ marginTop: '24px', padding: '16px 0', borderTop: '1px solid var(--border-color)' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '1.05rem' }}>Customer Reviews</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '24px', padding: '16px 0', borderTop: '1px solid var(--border-color)' }}>
      <h4 style={{ margin: '0 0 16px', fontSize: '1.05rem' }}>Customer Reviews ({reviews.length})</h4>
      {reviews.map((rev, i) => (
        <ReviewCard key={i} {...rev} />
      ))}
    </div>
  );
}

export default ProductReview;
