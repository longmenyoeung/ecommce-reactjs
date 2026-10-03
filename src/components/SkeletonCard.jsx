import React from 'react';

function SkeletonCard() {
  return (
    <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Image Skeleton */}
      <div className="skeleton" style={{ width: '100%', height: '220px', borderRadius: 'var(--radius-md)' }} />
      
      {/* Badge & Title Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: 'var(--radius-full)' }} />
        <div className="skeleton" style={{ width: '70px', height: '20px', borderRadius: 'var(--radius-full)' }} />
      </div>
      
      <div className="skeleton" style={{ width: '80%', height: '24px', borderRadius: '4px' }} />
      <div className="skeleton" style={{ width: '100%', height: '16px', borderRadius: '4px' }} />
      <div className="skeleton" style={{ width: '60%', height: '16px', borderRadius: '4px' }} />

      {/* Price & Button Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px' }}>
        <div className="skeleton" style={{ width: '80px', height: '28px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '120px', height: '40px', borderRadius: 'var(--radius-full)' }} />
      </div>
    </div>
  );
}

export default SkeletonCard;
