import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * Reusable UI Pagination Component
 */
export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '36px 0' }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-icon"
        style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
      >
        <ChevronLeftIcon style={{ width: '18px', height: '18px' }} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            fontWeight: '700',
            fontSize: '0.9rem',
            backgroundColor: currentPage === page ? 'var(--color-cta)' : 'var(--bg-tertiary)',
            color: currentPage === page ? '#ffffff' : 'var(--text-primary)',
            border: `1px solid ${currentPage === page ? 'var(--color-cta)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            transition: 'all 0.25s'
          }}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-icon"
        style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
      >
        <ChevronRightIcon style={{ width: '18px', height: '18px' }} />
      </button>
    </div>
  );
}

export default Pagination;
