import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

/**
 * Hero Banner Component for Home Feature
 */
export function HeroBanner({ onOpenCatalog, onOpenContact }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: '860px', margin: '0 auto 40px', padding: '10px 12px' }}>
      <span className="animate-float badge badge-accent" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 16px',
        borderRadius: 'var(--radius-full)',
        fontWeight: '800',
        fontSize: '0.78rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '20px',
        boxShadow: '0 4px 14px rgba(0, 240, 255, 0.2)'
      }}>
        <SparklesIcon style={{ width: '16px', height: '16px' }} /> Next-Gen Catalog 2026
      </span>

      <h1 style={{
        fontSize: 'clamp(2.1rem, 5vw, 4.2rem)',
        fontWeight: '900',
        lineHeight: 1.15,
        marginBottom: '20px',
        color: 'var(--text-primary)',
        letterSpacing: '-0.03em'
      }}>
        Elevate Your Lifestyle with{' '}
        <span style={{
          background: 'linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block'
        }}>
          Premium Essentials
        </span>
      </h1>

      <p style={{
        fontSize: 'clamp(0.95rem, 2.2vw, 1.15rem)',
        color: 'var(--text-secondary)',
        lineHeight: 1.65,
        marginBottom: '36px',
        maxWidth: '680px',
        margin: '0 auto 36px',
        fontWeight: '400'
      }}>
        Explore our curated inventory featuring ultra-responsive filtering, real-time stock verification, and an elevated VIP shopping experience designed for modern tech enthusiasts.
      </p>

      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => {
            if (onOpenCatalog) onOpenCatalog();
            else {
              const el = document.getElementById('catalog-products-header');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="btn btn-primary"
          style={{
            padding: '12px 28px',
            fontSize: '0.95rem',
            fontWeight: '800',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 8px 24px rgba(0, 240, 255, 0.25)',
            cursor: 'pointer'
          }}
        >
          Browse Catalog &darr;
        </button>
        <button
          type="button"
          onClick={() => {
            if (onOpenContact) onOpenContact();
          }}
          className="btn btn-secondary"
          style={{
            padding: '12px 24px',
            fontSize: '0.95rem',
            fontWeight: '700',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer'
          }}
        >
          VIP Customer Care
        </button>
      </div>
    </div>
  );
}

export default HeroBanner;
