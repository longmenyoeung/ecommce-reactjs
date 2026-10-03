import React, { useState, useRef, useEffect } from 'react';
import { 
  BellIcon, 
  TruckIcon, 
  SparklesIcon, 
  CheckCircleIcon, 
  TrashIcon, 
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export function NotificationBell({ user, notifications = [], onMarkAllRead, onMarkRead, onOpenTracking, onClearAll }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeNotifs = user ? notifications : [];
  const unreadCount = activeNotifs.filter(n => n.unread).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        className="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Tracking & Alerts Notification Center"
        style={{
          position: 'relative',
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: isOpen ? 'var(--accent-primary)' : 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          color: isOpen ? '#000' : 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.25s ease'
        }}
        onMouseOver={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.color = 'var(--accent-primary)';
          }
        }}
        onMouseOut={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
      >
        <BellIcon style={{ width: '22px', height: '22px', animation: unreadCount > 0 ? 'ring 2s infinite' : 'none' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            backgroundColor: '#EF4444',
            color: '#fff',
            fontSize: '0.68rem',
            fontWeight: '800',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.6)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Glassmorphism Notification Dropdown Panel */}
      {isOpen && (
        <div
          className="glass-panel animate-scale-up notification-dropdown-panel"
          style={{
            position: 'absolute',
            right: 0,
            top: '52px',
            width: '380px',
            maxHeight: '520px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
            border: '1px solid var(--border-color)',
            zIndex: 1500,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(128, 0, 255, 0.08) 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TruckIcon style={{ width: '20px', height: '20px', color: 'var(--accent-primary)' }} />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Tracking & Alerts
              </h4>
              {unreadCount > 0 && (
                <span className="badge badge-accent" style={{ fontSize: '0.68rem' }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--accent-primary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Mark read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  title="Clear all alerts"
                  style={{
                    color: 'var(--text-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#EF4444'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <TrashIcon style={{ width: '16px', height: '16px' }} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close alerts"
                style={{
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <XMarkIcon style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', divideY: '1px solid var(--border-color)' }}>
            {!user ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <BellIcon style={{ width: '44px', height: '44px', color: 'var(--text-muted)', margin: '0 auto 12px', opacity: 0.6 }} />
                <h5 style={{ margin: '0 0 6px', fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Sign in for Alerts
                </h5>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Please sign in to view your real-time tracking alerts and exclusive store updates.
                </p>
              </div>
            ) : activeNotifs.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <CheckCircleIcon style={{ width: '44px', height: '44px', color: '#10B981', margin: '0 auto 12px', opacity: 0.8 }} />
                <h5 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  All Caught Up!
                </h5>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  You have no new tracking alerts or store notifications right now.
                </p>
              </div>
            ) : (
              activeNotifs.map((notif) => {
                const isTracking = notif.type === 'tracking';
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (onMarkRead) onMarkRead(notif.id);
                      if (isTracking && notif.orderId && onOpenTracking) {
                        setIsOpen(false);
                        onOpenTracking(notif.orderId);
                      }
                    }}
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      backgroundColor: notif.unread ? 'rgba(0, 240, 255, 0.05)' : 'transparent',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: isTracking ? 'pointer' : 'default',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = notif.unread ? 'rgba(0, 240, 255, 0.05)' : 'transparent'}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: isTracking ? 'rgba(0, 240, 255, 0.15)' : 'rgba(128, 0, 255, 0.15)',
                      color: isTracking ? 'var(--accent-primary)' : '#8000ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {isTracking ? <TruckIcon style={{ width: '20px', height: '20px' }} /> : <SparklesIcon style={{ width: '20px', height: '20px' }} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: notif.unread ? '800' : '600', color: 'var(--text-primary)' }}>
                          {notif.title}
                        </span>
                        {notif.unread && (
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', flexShrink: 0 }} />
                        )}
                      </div>
                      <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                        {notif.text}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ClockIcon style={{ width: '12px', height: '12px' }} />
                          {notif.time || 'Just now'}
                        </span>
                        {isTracking && (
                          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                            View Live Timeline &rarr;
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Quick Action */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              ⚡ Tracking alerts refresh automatically when order status changes.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
