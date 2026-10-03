import React from 'react';
import { XMarkIcon, SparklesIcon, ShieldCheckIcon, CubeIcon, TrophyIcon, HeartIcon } from '@heroicons/react/24/outline';

function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      backgroundColor: 'rgba(20, 25, 35, 0.6)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.25s ease-out'
    }} onClick={onClose}>
      <div
        className="glass-panel animate-spring-modal"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '88vh',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--bg-primary)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-cta)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(30, 30, 30, 0.15)'
            }}>
              <SparklesIcon style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                About Men ICT <span style={{ color: 'var(--accent-primary)' }}>Store</span>
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Redefining Modern E-Commerce Since 2026
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)'
            }}
          >
            <XMarkIcon style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <span style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-accent-bg)',
              color: 'var(--color-accent)',
              fontWeight: '700',
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px'
            }}>
              Our Mission
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '14px', lineHeight: 1.25 }}>
              Curating Premium Essentials for Your Modern Lifestyle
            </h3>
            <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Men ICT Store is built on a simple philosophy: everyday products should be extraordinary. We partner directly with world-class manufacturers to bring you curated electronics, footwear, apparel, and premium accessories without unnecessary markups.
            </p>
          </div>

          {/* Core Pillars */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              gap: '14px'
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--accent-primary)', border: '1px solid var(--border-color)' }}>
                <ShieldCheckIcon style={{ width: '24px', height: '24px' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  100% Verified Quality
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Every single product in our catalog undergoes multi-stage inspection to guarantee authentic performance and durability.
                </p>
              </div>
            </div>

            <div style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              gap: '14px'
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-accent)', border: '1px solid var(--border-color)' }}>
                <TrophyIcon style={{ width: '24px', height: '24px' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Ultra-Responsive Experience
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Powered by high-speed Laravel APIs and a modern React storefront for instantaneous filtering and ordering.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Banner */}
          <div style={{
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-cta)',
            color: '#fff',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            textAlign: 'center',
            gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', display: 'block', fontFamily: 'Outfit' }}>10k+</span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>Happy Customers</span>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.15)', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', display: 'block', fontFamily: 'Outfit' }}>99.9%</span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>On-Time Delivery</span>
            </div>
            <div>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', display: 'block', fontFamily: 'Outfit' }}>24/7</span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>Dedicated Support</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '20px 32px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '10px 24px' }}
          >
            Explore Catalog
          </button>
        </div>
      </div>
    </div>
  );
}

export default AboutModal;
