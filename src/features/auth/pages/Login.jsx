import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

/**
 * Login Page Component
 */
export function Login({ onSuccess }) {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await login(formData.email, formData.password);
      if (onSuccess && res.user) onSuccess(res.user, res.token);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '1.4rem', fontWeight: '800', textAlign: 'center', color: 'var(--text-primary)' }}>Welcome Back</h2>
      <Input
        label="Email Address"
        icon={EnvelopeIcon}
        type="email"
        required
        placeholder="admin07@gmail.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <Input
        label="Password"
        icon={LockClosedIcon}
        type="password"
        required
        placeholder="Enter your password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      {error && <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}
      <Button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
}

export default Login;
