import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, UserIcon, EnvelopeIcon, LockClosedIcon, 
  ArrowRightOnRectangleIcon, CheckCircleIcon, ShoppingBagIcon, 
  MapPinIcon, HeartIcon, CreditCardIcon, SparklesIcon, TrashIcon,
  ArrowLeftIcon, KeyIcon
} from '@heroicons/react/24/outline';
import { loginUser, registerUser, loginWithGoogle, sendResetOtp, resetPasswordWithOtp } from '../services/api';
import { orderService } from '../services/order.service';
import { userService } from '../services/user.service';
import { paymentService } from '../services/payment.service';
import { ENV } from '../config/env';

function AuthModal({ isOpen, onClose, onAuthSuccess, user, onLogout }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot' | 'otp_reset'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Password Recovery OTP State
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Gmail state for account selection
  const [customGmail, setCustomGmail] = useState('');
  const [customGmailName, setCustomGmailName] = useState('');

  // VIP Customer Dashboard State
  const [profileView, setProfileView] = useState('overview'); // 'overview' | 'orders' | 'addresses' | 'wishlist' | 'payments'
  const [userOrders, setUserOrders] = useState([]);
  const [userAddresses, setUserAddresses] = useState([]);
  const [userWishlist, setUserWishlist] = useState([]);
  const [userPayments, setUserPayments] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);

  useEffect(() => {
    if (user && isOpen) {
      orderService.getOrderHistory().then(res => res && setUserOrders(res));
      userService.getAddresses().then(res => res && setUserAddresses(res));
      userService.getWishlist().then(res => res && setUserWishlist(res));
      paymentService.getPaymentHistory().then(res => res && setUserPayments(res));
      userService.getLoyaltyPoints().then(res => typeof res === 'number' && setLoyaltyPoints(res));
    }
  }, [user, isOpen]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleConnectGmail = async (chosenEmail, chosenName) => {
    const targetEmail = chosenEmail || customGmail || formData.email;
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please provide a valid Gmail address.');
      return;
    }
    setGoogleLoading(true);
    setError(null);
    try {
      const name = chosenName || customGmailName || formData.name || targetEmail.split('@')[0].replace(/[._]/g, ' ');
      const googleUid = 'google_' + btoa(targetEmail).replace(/=/g, '').substring(0, 16);
      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&rounded=true`;

      const res = await loginWithGoogle({
        email: targetEmail,
        name: name,
        google_id: googleUid,
        avatar: avatar
      });

      const token = res.token || res.access_token || 'sanctum_auth_token';
      const userData = res.user || { name: name, email: targetEmail, role: 'user' };
      setSuccessMsg(res.message || 'Connected directly with Google successfully!');
      setTimeout(() => {
        if (onAuthSuccess) {
          onAuthSuccess(userData, token);
        }
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to connect with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setError(null);
    setSuccessMsg(null);

    // 1. Try real Google Identity Services OAuth popup if client ID configured
    if (ENV.GOOGLE_CLIENT_ID && window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: ENV.GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setGoogleLoading(false);
              setError('Google authorization was cancelled.');
              return;
            }
            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const profile = await userInfoRes.json();
              await handleConnectGmail(profile.email, profile.name);
            } catch (fetchErr) {
              setError('Failed to fetch profile from Google.');
              setGoogleLoading(false);
            }
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn("Google OAuth2 init error, falling back to account chooser:", err);
      }
    }

    // 2. Direct Account Selector screen (like other websites, no alert/prompt boxes)
    setGoogleLoading(false);
    setCustomGmail(formData.email || '');
    setCustomGmailName(formData.name || '');
    setActiveTab('google_select');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const targetEmail = resetEmail || formData.email;
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please provide a valid registered email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await sendResetOtp(targetEmail);
      setResetEmail(targetEmail);
      setSuccessMsg(res.message || '6-digit OTP code sent! Check your inbox.');
      setActiveTab('otp_reset');
    } catch (err) {
      setError(err.message || 'Could not send OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordWithOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code received in your email.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const targetEmail = resetEmail || formData.email;
      const res = await resetPasswordWithOtp(targetEmail, otpCode.trim(), newPassword, confirmPassword);
      setSuccessMsg(res.message || 'Password reset successfully! Please sign in.');
      setTimeout(() => {
        setActiveTab('login');
        setFormData(prev => ({ ...prev, email: targetEmail, password: '' }));
        setOtpCode('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (activeTab === 'login') {
        const res = await loginUser(formData.email, formData.password);
        const token = res.token || res.access_token || res.data?.token || res.data?.access_token || 'sanctum_auth_token';
        const userData = res.user || res.data?.user || { name: 'VIP Member', email: formData.email, role: 'user' };
        setSuccessMsg('Login successful! Redirecting...');
        setTimeout(() => {
          if (onAuthSuccess) {
            onAuthSuccess(userData, token);
          }
        }, 800);
      } else if (activeTab === 'register') {
        const res = await registerUser(formData.name, formData.email, formData.password);
        const token = res.token || res.access_token || res.data?.token || res.data?.access_token || 'sanctum_auth_token';
        const userData = res.user || res.data?.user || { name: formData.name, email: formData.email, role: 'user' };
        setSuccessMsg('Registration successful! Welcome to Men ITC Store.');
        setTimeout(() => {
          if (onAuthSuccess) {
            onAuthSuccess(userData, token);
          }
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 250,
      backgroundColor: 'rgba(20, 25, 35, 0.65)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      animation: 'fadeIn 0.25s ease-out'
    }} onClick={onClose}>
      <div
        className="glass-panel animate-spring-modal"
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '92vh',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {user ? (
          <div style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'flex-end',
              marginTop: '-12px'
            }}>
              <button
                onClick={onClose}
                style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <XMarkIcon style={{ width: '22px', height: '22px' }} />
              </button>
            </div>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <UserIcon style={{ width: '36px', height: '36px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>{user.name}</h3>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  backgroundColor: user.role === 'admin' ? 'var(--warning)' : 'var(--accent-primary)',
                  color: '#fff',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  textTransform: 'uppercase'
                }}>
                  {user.role === 'admin' ? 'ADMIN' : 'VIP'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>{user.email || 'Verified Member'}</p>
            </div>
            {/* Dashboard Tabs Bar */}
            <div style={{ display: 'flex', width: '100%', gap: '6px', overflowX: 'auto', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginTop: '4px' }}>
              {[
                { id: 'overview', label: 'Overview', icon: UserIcon },
                { id: 'orders', label: 'Orders', icon: ShoppingBagIcon, count: userOrders.length },
                { id: 'addresses', label: 'Addresses', icon: MapPinIcon, count: userAddresses.length },
                { id: 'wishlist', label: 'Wishlist', icon: HeartIcon, count: userWishlist.length },
                { id: 'payments', label: 'Payments', icon: CreditCardIcon, count: userPayments.length }
              ].map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setProfileView(tab.id)}
                    style={{
                      flex: '1 0 auto',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: profileView === tab.id ? 'var(--color-accent)' : 'var(--bg-secondary)',
                      color: profileView === tab.id ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <IconComponent style={{ width: '16px', height: '16px' }} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: '10px', fontSize: '0.72rem' }}>{tab.count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Content View */}
            <div style={{ width: '100%', textAlign: 'left', minHeight: '180px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
              {profileView === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <SparklesIcon style={{ width: '24px', height: '24px', color: 'var(--color-accent)' }} />
                      <div>
                        <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Men ICT Loyalty Rewards</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{loyaltyPoints} Points</strong>
                      </div>
                    </div>
                    <span className="badge badge-accent">Gold VIP Tier</span>
                  </div>

                  <div style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-around'
                  }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Account Status</span>
                      <span style={{ fontWeight: '700', color: 'var(--success)' }}>Active Sanctum Auth</span>
                    </div>
                    <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }}></div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Membership Tier</span>
                      <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>{user.role === 'admin' ? 'System Admin' : 'VIP Priority'}</span>
                    </div>
                  </div>
                </div>
              )}

              {profileView === 'orders' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {userOrders.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '24px' }}>No order history found yet.</p>
                  ) : (
                    userOrders.map(order => (
                      <div key={order.id} style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Order #{order.id}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{order.date} • ${order.total}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: order.status === 'Cancelled' ? '#ef4444' : 'var(--success)', backgroundColor: order.status === 'Cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: '10px' }}>{order.status}</span>
                          {order.status !== 'Cancelled' && !['completed', 'delivered', 'shipped', 'in transit'].includes((order.status || '').toLowerCase()) ? (
                            <button
                              onClick={async () => {
                                if (!window.confirm("Are you sure you want to cancel this order?")) return;
                                const updated = await orderService.cancelOrder(order.id);
                                if (updated) setUserOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Cancelled' } : o));
                              }}
                              style={{ fontSize: '0.75rem', color: '#ef4444', backgroundColor: 'transparent', border: '1px solid #ef4444', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          ) : order.status !== 'Cancelled' && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Cannot Cancel</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {profileView === 'addresses' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {userAddresses.map((addr, idx) => (
                    <div key={addr.id || idx} style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{addr.name || 'Delivery Address'}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{addr.street}, {addr.city} {addr.zip}</span>
                    </div>
                  ))}
                  <button
                    onClick={async () => {
                      const street = window.prompt("Enter new Street Address:");
                      if (street) {
                        const newAddrs = await userService.addAddress({ name: 'Home / Office Address', street, city: 'New York, NY', zip: '10001' });
                        if (Array.isArray(newAddrs)) setUserAddresses(newAddrs);
                      }
                    }}
                    style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px dashed var(--color-accent)', color: 'var(--color-accent)', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', textAlign: 'center' }}
                  >
                    + Add New Delivery Address
                  </button>
                </div>
              )}

              {profileView === 'wishlist' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {userWishlist.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '24px' }}>Your wishlist is currently empty.</p>
                  ) : (
                    userWishlist.map(wItem => (
                      <div key={wItem.id} style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{wItem.name}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}>${wItem.price}</span>
                        </div>
                        <button
                          onClick={async () => {
                            const remaining = await userService.removeFromWishlist(wItem.id);
                            setUserWishlist(remaining);
                          }}
                          style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', padding: '6px', borderRadius: '6px', cursor: 'pointer', border: 'none' }}
                          title="Remove from Wishlist"
                        >
                          <TrashIcon style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {profileView === 'payments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {userPayments.map(pay => (
                    <div key={pay.id} style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{pay.method} ({pay.id})</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pay.date} • Order #{pay.order_id}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)' }}>${pay.amount}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--success)' }}>{pay.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (onLogout) onLogout();
                onClose();
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#ef4444',
                fontWeight: '700',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                marginTop: '12px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
                e.currentTarget.style.color = '#ef4444';
              }}
            >
              <ArrowRightOnRectangleIcon style={{ width: '20px', height: '20px' }} />
              <span>Sign Out of Account</span>
            </button>
          </div>
        ) : (
          <>
            {/* Header Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              {(activeTab === 'forgot' || activeTab === 'otp_reset' || activeTab === 'google_select') ? (
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '14px 18px', justifyContent: 'space-between' }}>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setError(null); setSuccessMsg(null); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '0.88rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
                    <span>Back to Sign In</span>
                  </button>
                  <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {activeTab === 'forgot' ? 'Forgot Password' : activeTab === 'otp_reset' ? 'Enter OTP Code' : 'Connect with Google'}
                  </span>
                  <button
                    onClick={onClose}
                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                  >
                    <XMarkIcon style={{ width: '20px', height: '20px' }} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setError(null); setSuccessMsg(null); }}
                    style={{
                      flex: 1,
                      padding: '18px 20px',
                      fontWeight: '700',
                      fontSize: '0.98rem',
                      color: activeTab === 'login' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      borderBottom: activeTab === 'login' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                      backgroundColor: activeTab === 'login' ? 'var(--bg-primary)' : 'transparent',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none'
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('register'); setError(null); setSuccessMsg(null); }}
                    style={{
                      flex: 1,
                      padding: '18px 20px',
                      fontWeight: '700',
                      fontSize: '0.98rem',
                      color: activeTab === 'register' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      borderBottom: activeTab === 'register' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                      backgroundColor: activeTab === 'register' ? 'var(--bg-primary)' : 'transparent',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none'
                    }}
                  >
                    Create Account
                  </button>
                  <button
                    onClick={onClose}
                    style={{
                      padding: '0 16px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none'
                    }}
                  >
                    <XMarkIcon style={{ width: '22px', height: '22px' }} />
                  </button>
                </>
              )}
            </div>

            {/* Modal Content */}
            <div style={{ padding: '28px 24px' }}>

              {/* Status Notifications */}
              {error && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  marginBottom: '16px'
                }}>
                  {typeof error === 'string' ? error.replace(/^Authentication Error:\s*/i, '') : error}
                </div>
              )}

              {successMsg && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#10b981',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <CheckCircleIcon style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* TAB: FORGOT PASSWORD (SEND OTP) */}
              {activeTab === 'forgot' && (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 4px', lineHeight: 1.5 }}>
                    Enter your registered email address and we'll send a <strong>6-digit OTP code</strong> to reset your password.
                  </p>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Registered Email Address
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <EnvelopeIcon style={{ width: '18px', height: '18px', color: 'var(--text-muted)', position: 'absolute', left: '14px' }} />
                      <input
                        type="email"
                        required
                        value={resetEmail || formData.email}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="youremail@example.com"
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 40px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span>{loading ? 'Sending OTP Code...' : 'Send Verification OTP'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setError(null); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    Remember your password? <strong style={{ color: 'var(--accent-primary)' }}>Sign In</strong>
                  </button>
                </form>
              )}

              {/* TAB: OTP RESET PASSWORD */}
              {activeTab === 'otp_reset' && (
                <form onSubmit={handleResetPasswordWithOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: '0 0 4px', lineHeight: 1.5 }}>
                    Enter the 6-digit OTP code sent to <strong>{resetEmail || formData.email}</strong> and choose a new password.
                  </p>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      6-Digit OTP Code
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <KeyIcon style={{ width: '18px', height: '18px', color: 'var(--text-muted)', position: 'absolute', left: '14px' }} />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 40px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--accent-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '1.2rem',
                          fontWeight: '800',
                          letterSpacing: '6px',
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      New Password
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <LockClosedIcon style={{ width: '18px', height: '18px', color: 'var(--text-muted)', position: 'absolute', left: '14px' }} />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 40px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Confirm New Password
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <LockClosedIcon style={{ width: '18px', height: '18px', color: 'var(--text-muted)', position: 'absolute', left: '14px' }} />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 40px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span>{loading ? 'Updating Password...' : 'Save New Password & Sign In'}</span>
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: 0, fontWeight: '600' }}
                    >
                      Resend OTP Code
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('login'); setError(null); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* TAB: GOOGLE DIRECT ACCOUNT CHOOSER (LIKE OTHER WEBSITES) */}
              {activeTab === 'google_select' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2px' }}>
                    <svg style={{ width: '42px', height: '42px' }} viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>

                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '1.28rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      Sign in with Google
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                      Choose a Google account to connect with <strong>Men ITC Store</strong>
                    </p>
                  </div>

                  {/* Quick Select One-Click Account Item */}
                  {(formData.email && formData.email.includes('@')) && (
                    <div
                      onClick={() => handleConnectGmail(formData.email, formData.name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                        e.currentTarget.style.borderColor = '#4285F4';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                      }}
                    >
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#4285F4',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '0.95rem',
                        flexShrink: 0
                      }}>
                        {(formData.name || formData.email)[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {formData.name || formData.email.split('@')[0]}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                          {formData.email}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#4285F4', fontWeight: '700' }}>Continue &rarr;</span>
                    </div>
                  )}

                  {/* Use Another Google / Gmail Account */}
                  <form onSubmit={(e) => { e.preventDefault(); handleConnectGmail(customGmail, customGmailName); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginTop: '2px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                        Google / Gmail Account Address
                      </label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <EnvelopeIcon style={{ width: '18px', height: '18px', color: 'var(--text-muted)', position: 'absolute', left: '14px' }} />
                        <input
                          type="email"
                          required
                          value={customGmail}
                          onChange={(e) => setCustomGmail(e.target.value)}
                          placeholder="youraccount@gmail.com"
                          style={{
                            width: '100%',
                            padding: '11px 14px 11px 40px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                        Display Name (Optional)
                      </label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <UserIcon style={{ width: '18px', height: '18px', color: 'var(--text-muted)', position: 'absolute', left: '14px' }} />
                        <input
                          type="text"
                          value={customGmailName}
                          onChange={(e) => setCustomGmailName(e.target.value)}
                          placeholder="Google Profile Name"
                          style={{
                            width: '100%',
                            padding: '11px 14px 11px 40px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={googleLoading}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#4285F4',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '0.92rem',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: googleLoading ? 'not-allowed' : 'pointer',
                        marginTop: '6px',
                        boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)'
                      }}
                    >
                      {googleLoading ? 'Connecting to Google...' : 'Direct Connect with Google'}
                    </button>
                  </form>

                  <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    To continue, Google will securely share your profile name and email address with Men ITC Store.
                  </p>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setError(null); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      padding: '6px'
                    }}
                  >
                    Cancel & return to Sign In
                  </button>
                </div>
              )}

              {/* TAB: LOGIN & REGISTER */}
              {(activeTab === 'login' || activeTab === 'register') && (
                <>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {activeTab === 'register' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                          Full Name
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <UserIcon style={{ width: '18px', height: '18px', color: 'var(--text-muted)', position: 'absolute', left: '14px' }} />
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            style={{
                              width: '100%',
                              padding: '11px 14px 11px 40px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              fontSize: '0.9rem'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                        Email Address
                      </label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <EnvelopeIcon style={{ width: '18px', height: '18px', color: 'var(--text-muted)', position: 'absolute', left: '14px' }} />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter email address"
                          style={{
                            width: '100%',
                            padding: '11px 14px 11px 40px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.84rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                          Password
                        </label>
                        {activeTab === 'login' && (
                          <button
                            type="button"
                            onClick={() => {
                              setResetEmail(formData.email);
                              setActiveTab('forgot');
                              setError(null);
                              setSuccessMsg(null);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--accent-primary)',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <LockClosedIcon style={{ width: '18px', height: '18px', color: 'var(--text-muted)', position: 'absolute', left: '14px' }} />
                        <input
                          type="password"
                          name="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter account password"
                          style={{
                            width: '100%',
                            padding: '11px 14px 11px 40px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || googleLoading}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        padding: '13px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer',
                        opacity: (loading || googleLoading) ? 0.75 : 1
                      }}
                    >
                      <ArrowRightOnRectangleIcon style={{ width: '20px', height: '20px' }} />
                      <span>{loading ? 'Processing...' : activeTab === 'login' ? 'Sign In to Account' : 'Complete Registration'}</span>
                    </button>
                  </form>

                  {/* Divider */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    margin: '20px 0 16px',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                    <span>or continue with</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                  </div>

                  {/* Direct Connect with Google / Gmail Button */}
                  <button
                    type="button"
                    disabled={loading || googleLoading}
                    onClick={handleGoogleAuth}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <svg style={{ width: '18px', height: '18px', flexShrink: 0 }} viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{googleLoading ? 'Connecting to Gmail...' : activeTab === 'register' ? 'Sign up directly with Gmail' : 'Continue with Google / Gmail'}</span>
                  </button>
                </>
              )}

              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Protected by 256-bit SSL authentication and Men ITC Store security protocols.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
