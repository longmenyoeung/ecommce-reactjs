import React from 'react';

/**
 * Footer Layout Component
 */
export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      padding: '40px 0',
      marginTop: 'auto',
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-secondary)',
      fontSize: '0.88rem'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'Outfit', fontSize: '1.1rem' }}>
            Men ICT Store <span style={{ color: 'var(--accent-primary)' }}>•</span> Premium Essentials
          </span>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>
            © 2026 Men ICT E-Commerce. All rights reserved. Next-Gen Performance.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '24px', fontWeight: '600' }}>
          <a href="#privacy" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</a>
          <a href="#terms" style={{ color: 'var(--text-secondary)' }}>Terms of Service</a>
          <a href="#support" style={{ color: 'var(--text-secondary)' }}>Priority Support</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
