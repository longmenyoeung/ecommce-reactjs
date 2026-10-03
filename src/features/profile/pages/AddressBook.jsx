import React from 'react';

/**
 * Address Book Page Component
 */
export function AddressBook({ addresses = [] }) {
  return (
    <div className="glass-card" style={{ padding: '28px', borderRadius: 'var(--radius-lg)', maxWidth: '640px', margin: '30px auto' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '1.3rem', fontWeight: '800' }}>Address Book</h3>
      {addresses.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No addresses saved yet. Your shipping address will be saved here during checkout.</p>
      ) : (
        addresses.map((addr, idx) => (
          <div key={idx} style={{ padding: '14px 0', borderBottom: '1px solid var(--border-color)' }}>
            <p style={{ fontWeight: '700', margin: '0 0 4px' }}>{addr.name}</p>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{addr.street}, {addr.city} {addr.zip}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default AddressBook;
