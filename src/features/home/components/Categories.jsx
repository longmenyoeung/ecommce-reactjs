import React from 'react';

/**
 * Categories Bar Component for Home Feature
 */
export function Categories({ categories = [], activeCategory, onSelectCategory }) {
  return (
    <div className="category-scroll-bar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '12px 0', margin: '20px 0' }}>
      {categories.map((cat, i) => (
        <button
          key={i}
          onClick={() => onSelectCategory && onSelectCategory(cat)}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontWeight: '600',
            fontSize: '0.88rem',
            whiteSpace: 'nowrap',
            backgroundColor: activeCategory === cat ? 'var(--color-cta)' : 'var(--bg-tertiary)',
            color: activeCategory === cat ? '#ffffff' : 'var(--text-primary)',
            border: `1px solid ${activeCategory === cat ? 'var(--color-cta)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            transition: 'all 0.25s'
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default Categories;
