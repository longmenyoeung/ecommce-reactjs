import React, { useState } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { EnvelopeIcon, KeyIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { sendResetOtp, resetPasswordWithOtp } from '../../../services/api';

/**
 * Forgot Password & OTP Reset Page Component
 */
export function ForgotPassword({ onCancel, onLoginRedirect }) {
  const [step, setStep] = useState(1); // 1: send OTP, 2: enter OTP & new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setLoading(true);
    try {
      const res = await sendResetOtp(email);
      setSuccess(res.message || 'OTP code sent! Please check your email inbox.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await resetPasswordWithOtp(email, otp.trim(), password, confirmPassword);
      setSuccess(res.message || 'Password successfully updated! You can now log in.');
      setStep(3); // success view
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', textAlign: 'center' }}>
        {step === 1 ? 'Reset Password' : step === 2 ? 'Verify OTP & Set Password' : 'Password Reset Complete'}
      </h2>

      {error && (
        <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-bg)', color: 'var(--success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircleIcon style={{ width: '18px', height: '18px', flexShrink: 0 }} />
          <span>{success}</span>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Enter your registered email address below. We will send a 6-digit OTP code to verify your identity.
          </p>
          <Input label="Email Address" icon={EnvelopeIcon} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" disabled={loading} style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Sending OTP Code...' : 'Send Verification OTP'}
          </Button>
          {onCancel && <Button variant="secondary" onClick={onCancel} style={{ width: '100%', padding: '10px' }}>Back to Sign In</Button>}
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Enter the 6-digit verification code sent to <strong>{email}</strong> and your new password.
          </p>
          <Input 
            label="6-Digit OTP Code" 
            icon={KeyIcon} 
            type="text" 
            required 
            maxLength={6} 
            value={otp} 
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
            placeholder="123456" 
          />
          <Input label="New Password" icon={LockClosedIcon} type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input label="Confirm New Password" icon={LockClosedIcon} type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <Button type="submit" disabled={loading} style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Saving...' : 'Reset Password & Sign In'}
          </Button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="ghost" onClick={handleSendOtp} disabled={loading} style={{ padding: '4px', fontSize: '0.82rem' }}>
              Resend OTP
            </Button>
            {onCancel && <Button variant="secondary" onClick={onCancel} style={{ padding: '8px 12px' }}>Back to Sign In</Button>}
          </div>
        </form>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Your account password has been successfully reset. You can now sign in using your new credentials.
          </p>
          <Button onClick={onLoginRedirect || onCancel} style={{ width: '100%', padding: '12px' }}>
            Go to Sign In
          </Button>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
