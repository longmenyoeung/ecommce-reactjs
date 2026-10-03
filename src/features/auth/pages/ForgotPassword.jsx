import React, { useState } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

/**
 * Forgot Password Page Component
 */
export function ForgotPassword({ onCancel }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', textAlign: 'center' }}>Reset Password</h2>
      {submitted ? (
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', borderRadius: 'var(--radius-md)' }}>
          If an account exists with {email}, password recovery instructions have been sent!
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>Enter your registered email address below to receive recovery instructions.</p>
          <Input label="Email Address" icon={EnvelopeIcon} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" style={{ width: '100%', padding: '12px' }}>Send Recovery Link</Button>
          {onCancel && <Button variant="secondary" onClick={onCancel} style={{ width: '100%', padding: '10px' }}>Back to Sign In</Button>}
        </form>
      )}
    </div>
  );
}

export default ForgotPassword;
