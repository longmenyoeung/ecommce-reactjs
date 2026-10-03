import React, { useState } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { LockClosedIcon } from '@heroicons/react/24/outline';

/**
 * Reset Password Page Component
 */
export function ResetPassword({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', textAlign: 'center' }}>Set New Password</h2>
      <Input label="New Password" icon={LockClosedIcon} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      <Input label="Confirm New Password" icon={LockClosedIcon} type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}
      <Button type="submit" style={{ width: '100%', padding: '12px' }}>Save New Password</Button>
    </form>
  );
}

export default ResetPassword;
