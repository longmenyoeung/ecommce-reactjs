import React, { useState } from 'react';
import { authService } from '../../../services/auth.service';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

/**
 * Register Page Component
 */
export function Register({ onSuccess }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authService.register(formData.name, formData.email, formData.password);
      if (onSuccess && res.user) onSuccess(res.user, res.token);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '1.4rem', fontWeight: '800', textAlign: 'center', color: 'var(--text-primary)' }}>Create Account</h2>
      <Input
        label="Full Name"
        icon={UserIcon}
        required
        placeholder="Admin"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <Input
        label="Email Address"
        icon={EnvelopeIcon}
        type="email"
        required
        placeholder="Admin123@gmail.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <Input
        label="Password"
        icon={LockClosedIcon}
        type="password"
        required
        placeholder="Create a strong password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      {error && <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}
      <Button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
        {loading ? 'Registering...' : 'Sign Up'}
      </Button>
    </form>
  );
}

export default Register;
