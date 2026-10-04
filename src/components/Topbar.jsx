import React from 'react';
import { Link } from 'react-router-dom';
import { TruckIcon, ShieldCheckIcon, PhoneIcon, MapPinIcon, SparklesIcon } from '@heroicons/react/24/outline';

function Topbar({ onTrackOrder, onOpenContact }) {
  return (
    <div id="topbar-section" className="app-topbar" style={{
      backgroundColor: 'var(--color-cta)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '9px 0',
      fontSize: '0.8rem',
      color: '#E5E7EB',
      position: 'relative',
      zIndex: 60
    }}>
      <div className="container topbar-container">
        {/* Left Announcements (Pills / Badges) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontWeight: '600',
            fontSize: '0.78rem'
          }}>
            <TruckIcon style={{ width: '15px', height: '15px', color: 'var(--color-accent)' }} />
            <span>Free Express Delivery on Orders Over $50</span>
          </div>

          <div className="desktop-only-btn" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '500',
            fontSize: '0.78rem',
            color: 'rgba(255, 255, 255, 0.85)'
          }}>
            <ShieldCheckIcon style={{ width: '15px', height: '15px', color: 'var(--success)' }} />
            <span>100% Verified Authentic Quality</span>
          </div>
        </div>

        {/* Right Support & Order Tracking */}
        {/* Right Support & Order Tracking */}
        <div className="topbar-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px', fontWeight: '600', fontSize: '0.78rem', flexWrap: 'wrap' }}>
          <Link
            to="/track"
            onClick={onTrackOrder}
            style={{
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              transition: 'all 0.2s',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent)';
              e.currentTarget.style.borderColor = 'var(--color-accent)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
          >
            <MapPinIcon style={{ width: '14px', height: '14px', color: 'var(--color-accent)' }} />
            <span>Track Your Order</span>
          </Link>

          <a
            href="tel:+1800636428"
            onClick={(e) => {
              if (window.innerWidth > 768) {
                e.preventDefault();
                if (onOpenContact) onOpenContact();
              }
            }}
            style={{
              color: 'rgba(255, 255, 255, 0.95)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              cursor: 'pointer',
              textDecoration: 'none',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(16, 185, 129, 0.4)'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)'}
          >
            <PhoneIcon style={{ width: '14px', height: '14px', color: 'var(--success)' }} />
            <span>24/7 Hotline: +1 (800) MEN-ICT</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
