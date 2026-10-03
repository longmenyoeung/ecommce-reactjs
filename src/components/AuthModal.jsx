import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, UserIcon, EnvelopeIcon, LockClosedIcon, 
  ArrowRightOnRectangleIcon, CheckCircleIcon, ShoppingBagIcon, 
  MapPinIcon, HeartIcon, CreditCardIcon, SparklesIcon, TrashIcon 
} from '@heroicons/react/24/outline';
import { loginUser, registerUser } from '../services/api';
import { orderService } from '../services/order.service';
import { userService } from '../services/user.service';
import { paymentService } from '../services/payment.service';

function AuthModal({ isOpen, onClose, onAuthSuccess, user, onLogout }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

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
      } else {
        const res = await registerUser(formData.name, formData.email, formData.password);
        const token = res.token || res.access_token || res.data?.token || res.data?.access_token || 'sanctum_auth_token';
        const userData = res.user || res.data?.user || { name: formData.name, email: formData.email, role: 'user' };
        setSuccessMsg('Registration successful! Welcome to Men ICT Store.');
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
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '18px 20px',
              fontWeight: '700',
              fontSize: '0.98rem',
              color: activeTab === 'login' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'login' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              backgroundColor: activeTab === 'login' ? 'var(--bg-primary)' : 'transparent',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(null); }}
            style={{
              flex: 1,
              padding: '18px 20px',
              fontWeight: '700',
              fontSize: '0.98rem',
              color: activeTab === 'register' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'register' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              backgroundColor: activeTab === 'register' ? 'var(--bg-primary)' : 'transparent',
              transition: 'all 0.2s',
              cursor: 'pointer'
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
              cursor: 'pointer'
            }}
          >
            <XMarkIcon style={{ width: '22px', height: '22px' }} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '28px 24px' }}>
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
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                Password
              </label>
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

            {error && (
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#ef4444',
                fontSize: '0.85rem',
                lineHeight: 1.5
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
                gap: '8px'
              }}>
                <CheckCircleIcon style={{ width: '18px', height: '18px' }} />
                <span>{successMsg}</span>
              </div>
            )}

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
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1
              }}
            >
              <ArrowRightOnRectangleIcon style={{ width: '20px', height: '20px' }} />
              <span>{loading ? 'Processing...' : activeTab === 'login' ? 'Sign In to Account' : 'Complete Registration'}</span>
            </button>
          </form>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Protected by 256-bit SSL authentication and Men ICT Store security protocols.
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
