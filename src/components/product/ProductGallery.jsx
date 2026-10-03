import React, { useState } from 'react';

/**
 * Reusable Product Gallery Component with interactive zoom and thumbnails
 */
export function ProductGallery({ images = [], productName }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeImage = images[selectedIndex] || images[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="glass-card" style={{ width: '100%', height: '380px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-tertiary)' }}>
        {activeImage ? (
          <img src={activeImage} alt={productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>No Image Available</span>
        )}
      </div>
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: `2px solid ${selectedIndex === idx ? 'var(--accent-primary)' : 'transparent'}`,
                cursor: 'pointer',
                flexShrink: 0,
                padding: 0,
                backgroundColor: 'var(--bg-tertiary)'
              }}
            >
              <img src={img} alt={`${productName} thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
