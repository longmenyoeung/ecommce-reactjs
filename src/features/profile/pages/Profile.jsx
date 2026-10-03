import React from 'react';
import Button from '../../../components/common/Button';

/**
 * Profile Page Component
 */
export function Profile({ user, onLogout, onEditProfile }) {
  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '720px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#fff', fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 4px', color: 'var(--text-primary)' }}>{user ? user.name : 'VIP Member'}</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 24px' }}>{user ? user.email : 'member@menictstore.com'}</p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
          <Button onClick={onEditProfile || (() => {})}>Edit Profile</Button>
          <Button variant="secondary" onClick={onLogout || (() => {})}>Sign Out</Button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
