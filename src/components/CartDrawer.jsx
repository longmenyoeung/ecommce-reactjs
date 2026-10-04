import React, { useState } from 'react';
import { getImageUrl, getFallbackImageUrl } from '../utils/imageHelper';
import { 
  ShoppingCartIcon, 
  ShoppingBagIcon, 
  TrashIcon, 
  ArrowRightIcon, 
  XMarkIcon, 
  PhotoIcon,
  SparklesIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { orderService } from '../services/order.service';
import { userService } from '../services/user.service';

function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onClearCart, user, onOpenAuth, onShowToast, onOpenCheckout }) {
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0);
  const tax = Math.max(0, (subtotal - discountAmount) * 0.08); // 8% tax estimate after discount
  const total = Math.max(0, subtotal - discountAmount + tax);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await userService.applyCoupon(couponCode, subtotal);
      if (res && (res.discount !== undefined || res.discount_amount !== undefined)) {
        const disc = Number(res.discount || res.discount_amount || 0);
        setDiscountAmount(disc);
        if (onShowToast) onShowToast({ type: 'success', title: 'Coupon Applied!', text: res.message || `-$${disc.toFixed(2)} discount applied.` });
      }
    } catch (err) {
      if (onShowToast) onShowToast({ type: 'remove', title: 'Coupon Error', text: err.message || 'Invalid coupon code' });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      onClose();
      if (onOpenAuth) onOpenAuth();
      if (onShowToast) {
        onShowToast({
          type: 'remove',
          title: 'Authentication Required',
          text: 'Please sign in or create an account to proceed to checkout.'
        });
      }
      return;
    }
    if (onOpenCheckout) {
      onOpenCheckout({
        items: cartItems,
        discountAmount,
        couponCode
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 3500,
      backgroundColor: 'rgba(20, 25, 35, 0.65)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.25s ease-out'
    }} onClick={onClose}>
      <div
        className="glass-panel animate-slide-in cart-drawer-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          maxHeight: '100dvh',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          borderLeft: '1px solid var(--border-color)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)'
            }}>
              <ShoppingCartIcon style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Your Cart
              </h2>
            </div>
            <span className="badge badge-accent" style={{ marginLeft: '4px' }}>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'var(--color-accent)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <XMarkIcon style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Cart Items List */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          backgroundColor: 'var(--bg-primary)'
        }}>
          {cartItems.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '16px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                border: '2px dashed var(--border-color)'
              }}>
                <ShoppingBagIcon style={{ width: '42px', height: '42px' }} />
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.2rem', fontWeight: '700' }}>
                  Your cart is empty
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Looks like you haven't added any items from our catalog yet.
                </p>
              </div>
              <button onClick={onClose} className="btn-primary" style={{ marginTop: '8px' }}>
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const imgUrl = getImageUrl(item.image) || getFallbackImageUrl(item.image);
              const itemTotal = (parseFloat(item.price || 0) * item.quantity).toFixed(2);
              return (
                <div
                  key={item.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  {/* Item Thumbnail */}
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-tertiary)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)'
                  }}>
                    {imgUrl ? (
                      <img src={imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <PhotoIcon style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }} />
                    )}
                  </div>

                  {/* Item Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
                        ${parseFloat(item.price || 0).toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          • Total: ${itemTotal}
                        </span>
                      )}
                    </div>
                    {item.stock !== undefined && item.stock !== null && (
                      <div style={{ fontSize: '0.72rem', marginTop: '2px', color: item.quantity >= item.stock ? '#ef4444' : 'var(--text-muted)', fontWeight: item.quantity >= item.stock ? '600' : 'normal' }}>
                        {item.quantity >= item.stock ? `Max stock in bag (${item.stock} avail)` : `In stock: ${item.stock}`}
                      </div>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-primary)', padding: '4px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      style={{ width: '26px', height: '26px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '20px', textAlign: 'center', color: 'var(--text-primary)' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        const res = onUpdateQuantity(item.id, item.quantity + 1);
                        if (res && !res.success) {
                          onShowToast?.({
                            type: 'remove',
                            title: 'Stock Limit Reached',
                            text: res.message || `Only ${item.stock} item(s) available in stock.`
                          });
                        }
                      }}
                      style={{ 
                        width: '26px', 
                        height: '26px', 
                        borderRadius: 'var(--radius-full)', 
                        backgroundColor: 'var(--bg-secondary)', 
                        color: 'var(--text-primary)', 
                        fontSize: '0.9rem', 
                        fontWeight: 'bold', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        opacity: (item.stock !== undefined && item.quantity >= item.stock) ? 0.4 : 1,
                        cursor: (item.stock !== undefined && item.quantity >= item.stock) ? 'not-allowed' : 'pointer'
                      }}
                      title={item.stock !== undefined && item.quantity >= item.stock ? `Stock limit reached (${item.stock})` : "Increase quantity"}
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    style={{ 
                      color: 'var(--text-muted)', 
                      width: '34px', 
                      height: '34px', 
                      borderRadius: 'var(--radius-sm)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      transition: 'all 0.2s' 
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = 'var(--color-accent)';
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-bg)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Remove item"
                  >
                    <TrashIcon style={{ width: '18px', height: '18px' }} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer / Checkout */}
        {cartItems.length > 0 && (
          <div
            className="cart-drawer-footer"
            style={{
              padding: '16px 20px max(24px, env(safe-area-inset-bottom, 24px)) 20px',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flexShrink: 0
            }}
          >
            {/* Coupon Box (POST /api/coupons/apply) */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Promo Code (e.g. VIP2026)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem'
                  }}
                />
                <TicketIcon style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
              </div>
              <button
                type="submit"
                disabled={applyingCoupon || !couponCode.trim()}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {applyingCoupon ? '...' : 'Apply'}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--success)' }}>
                <span>Coupon Discount ({couponCode})</span>
                <span style={{ fontWeight: '700' }}>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <span>Estimated Tax (8%)</span>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>${tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', paddingTop: '10px', borderTop: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
              <span>Total</span>
              <span style={{ fontFamily: 'Outfit', fontSize: '1.45rem', color: 'var(--text-primary)' }}>${total.toFixed(2)}</span>
            </div>

            {!user && (
              <div style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#ef4444',
                fontSize: '0.8rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>🔒 Sign in or register required before checkout.</span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isSubmittingOrder}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px 18px',
                minHeight: '50px',
                fontSize: '1rem',
                fontWeight: '800',
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isSubmittingOrder ? 0.7 : 1,
                cursor: isSubmittingOrder ? 'wait' : 'pointer'
              }}
            >
              <span>{isSubmittingOrder ? 'Processing Order...' : user ? `Proceed to Checkout • $${total.toFixed(2)}` : 'Sign In to Checkout'}</span>
              <ArrowRightIcon style={{ width: '20px', height: '20px' }} />
            </button>
            <button
              onClick={onClearCart}
              style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', textDecoration: 'underline', cursor: 'pointer', transition: 'color 0.2s', padding: '2px 0' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
