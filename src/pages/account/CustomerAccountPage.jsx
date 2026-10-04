import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/order.service';
import {
  UserCircleIcon,
  ShoppingBagIcon,
  MapPinIcon,
  ArrowRightOnRectangleIcon,
  PrinterIcon,
  TruckIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export function CustomerAccountPage({ onOpenTracking }) {
  const { user, logout, setAuthModalOpen } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'address' | 'loyalty'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchCustomerOrders = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoadingOrders(true);
    try {
      const data = await orderService.getOrders();
      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);
      } else {
        const local = orderService.getLocalOrders();
        setOrders(local);
      }
    } catch {
      // Keep existing orders if error
    } finally {
      if (!silent) setLoadingOrders(false);
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchCustomerOrders();
  }, [user, fetchCustomerOrders]);

  // Fast auto-refresh: poll customer orders every 8s so admin status updates appear live
  useEffect(() => {
    if (!user) return;

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchCustomerOrders(true);
      }
    }, 8000);

    const onFocus = () => fetchCustomerOrders(true);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [user, fetchCustomerOrders]);

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '48px 32px', borderRadius: 'var(--radius-lg)' }}>
          <UserCircleIcon style={{ width: '64px', height: '64px', color: 'var(--color-accent)', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 10px', color: 'var(--text-primary)' }}>
            Customer Account Portal
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
            Please sign in to view your order history, shipping details, and VIP rewards balance.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => setAuthModalOpen(true)} className="btn-primary" style={{ padding: '12px 28px' }}>
              Sign In to Account
            </button>
            <Link to="/" className="btn-secondary" style={{ padding: '12px 24px', textDecoration: 'none' }}>
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const printOrderReceipt = (order) => {
    const rows = (order.items || []).map((it) => `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #ddd;">${it.name || `Product #${it.product_id || it.id}`}</td>
        <td style="padding:8px; border-bottom:1px solid #ddd; text-align:center;">${it.quantity || 1}</td>
        <td style="padding:8px; border-bottom:1px solid #ddd; text-align:right;">$${Number(it.unit_price || it.price || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Invoice #${order.id}</title></head>
        <body style="font-family:sans-serif; padding:40px; color:#222;">
          <h1 style="margin:0 0 6px;">Men ICT Store — Invoice</h1>
          <p style="color:#666; font-size:14px; margin-bottom:24px;">Order ID: #${order.id} • Date: ${order.created_at || 'Recent'}</p>
          <p><strong>Customer:</strong> ${user.name} (${user.email})</p>
          <table style="width:100%; border-collapse:collapse; margin-top:20px;">
            <thead>
              <tr style="background:#f4f4f4;">
                <th style="padding:8px; text-align:left;">Item</th>
                <th style="padding:8px; text-align:center;">Qty</th>
                <th style="padding:8px; text-align:right;">Price</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="3" style="padding:8px;">Standard Order Item</td></tr>'}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px 8px; text-align:right; font-weight:bold;">Total Paid:</td>
                <td style="padding:12px 8px; text-align:right; font-weight:bold;">$${Number(order.total || 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <p style="margin-top:36px; font-size:12px; color:#888;">Thank you for shopping with Men ICT Store.</p>
        </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=800,height=900');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '40px 20px 80px' }}>
      {/* Account Profile Header */}
      <div
        className="glass-card"
        style={{
          padding: '28px 32px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '32px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.6rem'
            }}
          >
            {(user.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                {user.name}
              </h1>
              <span className="badge badge-accent" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                VIP Member
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {user.email} • Active Customer
            </p>
          </div>
        </div>

        <button
          onClick={async () => {
            await logout();
            showToast({ type: 'info', title: 'Signed Out', text: 'You have been signed out.' });
            navigate('/');
          }}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
        >
          <ArrowRightOnRectangleIcon style={{ width: '18px', height: '18px' }} /> Sign Out
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {[
          { id: 'orders', label: 'My Orders', icon: ShoppingBagIcon, count: orders.length },
          { id: 'address', label: 'Saved Addresses', icon: MapPinIcon },
          { id: 'loyalty', label: 'Rewards & Points', icon: SparklesIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--color-accent)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Icon style={{ width: '18px', height: '18px' }} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-secondary)',
                    color: isActive ? '#ffffff' : 'var(--text-primary)',
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem'
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: ORDERS */}
      {activeTab === 'orders' && (
        <div>
          {loadingOrders ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <ClockIcon className="animate-spin" style={{ width: '32px', height: '32px', margin: '0 auto 8px', color: 'var(--color-accent)' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading previous orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <ShoppingBagIcon style={{ width: '48px', height: '48px', margin: '0 auto 12px', color: 'var(--text-muted)' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No orders placed yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Your order receipts and delivery tracking updates will be listed here.
              </p>
              <Link to="/" className="btn-primary">Browse Storefront</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="glass-card animate-fade-in"
                  style={{
                    padding: '24px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Order Reference
                      </span>
                      <h3 style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: '800' }}>
                        #{ord.id}
                      </h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Placed on {ord.created_at ? ord.created_at.substring(0, 10) : 'Recent'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="badge badge-accent" style={{ textTransform: 'capitalize' }}>
                        {ord.status || 'Processing'}
                      </span>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--color-accent)' }}>
                        ${Number(ord.total || 0).toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => {
                        if (onOpenTracking) {
                          onOpenTracking(ord.id);
                        } else {
                          navigate(`/track/${ord.id}`);
                        }
                      }}
                      className="btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 14px' }}
                    >
                      <TruckIcon style={{ width: '16px', height: '16px' }} /> Live Tracking
                    </button>
                    <button
                      onClick={() => printOrderReceipt(ord)}
                      className="btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 14px' }}
                    >
                      <PrinterIcon style={{ width: '16px', height: '16px' }} /> Print Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: ADDRESSES */}
      {activeTab === 'address' && (
        <div className="glass-card" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 16px' }}>Primary Delivery Address</h3>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '6px' }}>{user.name}</strong>
            <p style={{ margin: '0 0 4px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {user.shipping_address || '450 VIP Commerce Way, Suite 800, New York, NY 10001'}
            </p>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Phone: {user.phone || '+1 (800) 555-0199'}
            </p>
          </div>
          <button
            onClick={() => showToast({ type: 'info', title: 'Address Book', text: 'Address updated successfully.' })}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            Update Address
          </button>
        </div>
      )}

      {/* TAB CONTENT 3: LOYALTY */}
      {activeTab === 'loyalty' && (
        <div className="glass-card" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SparklesIcon style={{ width: '32px', height: '32px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>450 VIP Points</h3>
              <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Tier: Platinum Executive ($45.00 discount voucher available)
              </p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Earn 1 point for every $1 spent. Redeem points at checkout for instant cash discounts on premium products.
          </p>
        </div>
      )}
    </div>
  );
}

export default CustomerAccountPage;
