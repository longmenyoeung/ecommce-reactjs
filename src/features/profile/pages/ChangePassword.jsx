import React, { useState } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { LockClosedIcon } from '@heroicons/react/24/outline';

/**
 * Change Password Page Component
 */
export function ChangePassword({ onUpdate }) {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdate) onUpdate(newPass);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '28px', borderRadius: 'var(--radius-lg)', maxWidth: '540px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: '800' }}>Change Password</h3>
      <Input label="Current Password" icon={LockClosedIcon} type="password" required value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} />
      <Input label="New Password" icon={LockClosedIcon} type="password" required value={newPass} onChange={(e) => setNewPass(e.target.value)} />
      <Button type="submit" style={{ padding: '12px', marginTop: '8px' }}>Update Password</Button>
    </form>
  );
}

export default ChangePassword;
