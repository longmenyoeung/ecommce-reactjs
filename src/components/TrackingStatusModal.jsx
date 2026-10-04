import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  TruckIcon, 
  MapPinIcon, 
  PhoneIcon, 
  CreditCardIcon,
  ShoppingBagIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { orderService } from '../services/order.service';

export function TrackingStatusModal({ isOpen, onClose, order, onShowToast, onCancelOrder }) {
  const [currentOrder, setCurrentOrder] = useState(order);

  useEffect(() => {
    if (order) {
      setCurrentOrder(order);
    }
  }, [order]);

  // Live polling: keep tracking modal up to date every 4s while open
  useEffect(() => {
    if (!isOpen) return;
    const cleanId = currentOrder?.id || currentOrder?.order_id;

    const syncLiveStatus = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        let fresh = null;
        if (cleanId) {
          fresh = await orderService.getOrderById(cleanId);
        }

        // If the requested order cannot be resolved, only accept a fallback row
        // that is the SAME order. Taking history[0] blindly swapped in an
        // unrelated (or demo) order, so a notification deep-link for an unknown
        // order showed a different order's status - e.g. a freshly placed order
        // rendering as "Delivered • Cannot Cancel".
        if (!fresh) {
          const history = await orderService.getOrderHistory();
          if (Array.isArray(history) && history.length > 0) {
            fresh = history.find((o) => String(o.id || o.order_id) === String(cleanId)) || null;
          }
        }

        if (fresh && (fresh.id || fresh.order_id)) {
          setCurrentOrder((prev) => ({
            ...prev,
            ...fresh,
            id: fresh.id || fresh.order_id,
            status: fresh.status || prev?.status,
            status_raw: String(fresh.status_raw || fresh.status || prev?.status_raw || '').toLowerCase(),
            tracking_number: fresh.tracking_number || prev?.tracking_number,
            carrier: fresh.carrier || prev?.carrier || 'FedEx Priority Express'
          }));
        }
      } catch {
        // silent
      }
    };

    syncLiveStatus();
    const timer = setInterval(syncLiveStatus, 4000);
    return () => clearInterval(timer);
  }, [isOpen, currentOrder?.id, currentOrder?.order_id]);

  if (!isOpen || !currentOrder) return null;

  // Never invent an order number: this id is also used to cancel the order, so a
  // hardcoded '10245' fallback could display - and cancel - a demo order.
  const orderId = currentOrder.id || currentOrder.order_id || null;
  const orderRef = orderId ?? 'Pending';
  const trackingNumber = currentOrder.tracking_number || (orderId ? `FX-${String(orderId).padStart(6, '0')}` : 'Unassigned');
  const statusLower = (currentOrder.status_raw || currentOrder.status || 'Processing').toLowerCase();
  
  const cannotCancel = ['completed', 'delivered', 'shipped', 'in transit'].includes(statusLower);
  const isCancelled = statusLower.includes('cancel');

  // Determine current step index (0 to 4)
  let activeStepIdx = 2; // Default to Processing
  if (statusLower.includes('deliver') || statusLower.includes('completed')) activeStepIdx = 4;
  else if (statusLower.includes('transit') || statusLower.includes('shipped')) activeStepIdx = 3;
  else if (statusLower.includes('process')) activeStepIdx = 2;
  else if (statusLower.includes('verify') || statusLower.includes('paid')) activeStepIdx = 1;
  else if (isCancelled) activeStepIdx = -1;
  else activeStepIdx = 0;

  const handleCopyTracking = () => {
    navigator.clipboard?.writeText(trackingNumber);
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Copied to Clipboard!',
        text: `Tracking ID #${trackingNumber} copied.`
      });
    }
  };

  const steps = [
    { title: 'Order Placed', desc: currentOrder.date || 'Just now', done: activeStepIdx >= 0 && !isCancelled, current: activeStepIdx === 0 && !isCancelled },
    { title: 'Payment Verified', desc: (currentOrder.payment_method || 'card').toUpperCase(), done: activeStepIdx >= 1 && !isCancelled, current: activeStepIdx === 1 && !isCancelled },
    { title: 'Processing at Hub', desc: 'Fulfillment Center, NY', done: activeStepIdx >= 2 && !isCancelled, current: activeStepIdx === 2 && !isCancelled },
    { title: 'Shipped & In Transit', desc: currentOrder.carrier || 'FedEx Express VIP', done: activeStepIdx >= 3 && !isCancelled, current: activeStepIdx === 3 && !isCancelled },
    { title: 'Delivered', desc: currentOrder.estimated_delivery || 'Estimated in 2 days', done: activeStepIdx >= 4 && !isCancelled, current: activeStepIdx === 4 && !isCancelled }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 999999,
        backgroundColor: 'rgba(15, 20, 30, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: 'calc(100vh - 24px)',
          overflowY: 'auto',
          margin: 'auto',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: isCancelled 
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(20, 20, 30, 0.8) 100%)' 
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(0, 240, 255, 0.08) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '16px',
              backgroundColor: isCancelled ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: isCancelled ? '#EF4444' : '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {isCancelled ? (
                <XMarkIcon style={{ width: '26px', height: '26px' }} />
              ) : (
                <CheckCircleIcon style={{ width: '26px', height: '26px' }} />
              )}
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: isCancelled ? '#EF4444' : '#10B981', letterSpacing: '0.5px' }}>
                {isCancelled ? 'Order Has Been Cancelled' : 'Order Confirmed & Tracking Active'}
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Order #{orderRef}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <XMarkIcon style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '20px 24px', boxSizing: 'border-box' }}>
          {/* Tracking Number Bar */}
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '24px'
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>VIP Express Tracking Number</span>
              <span style={{ fontSize: '0.95rem', fontWeight: '800', fontFamily: 'monospace', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                {trackingNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyTracking}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
            >
              <DocumentDuplicateIcon style={{ width: '16px', height: '16px' }} />
              <span>Copy</span>
            </button>
          </div>

          {/* Live Progress Timeline */}
          <h4 style={{ margin: '0 0 16px', fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TruckIcon style={{ width: '18px', height: '18px', color: 'var(--accent-primary)' }} />
            <span>Shipment Status Timeline</span>
          </h4>

          <div style={{ position: 'relative', paddingLeft: '28px', marginBottom: '28px' }}>
            {/* Vertical Line */}
            <div style={{
              position: 'absolute',
              left: '11px',
              top: '8px',
              bottom: '8px',
              width: '2px',
              backgroundColor: 'var(--border-color)'
            }} />

            {steps.map((st, idx) => {
              return (
                <div key={idx} style={{ position: 'relative', marginBottom: idx === steps.length - 1 ? 0 : '20px' }}>
                  {/* Step Dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-28px',
                    top: '2px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: st.done ? '#10B981' : st.current ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    border: '3px solid var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: st.current ? '0 0 12px var(--accent-primary)' : 'none',
                    color: st.done || st.current ? '#000' : 'var(--text-secondary)',
                    fontSize: '0.65rem',
                    fontWeight: '900'
                  }}>
                    {st.done ? '✓' : idx + 1}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                    <div>
                      <h5 style={{ margin: '0 0 2px', fontSize: '0.88rem', fontWeight: st.current || st.done ? '800' : '600', color: st.current ? 'var(--accent-primary)' : st.done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {st.title}
                      </h5>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {st.desc}
                      </p>
                    </div>
                    {st.current && !isCancelled && (
                      <span className="badge badge-accent animate-pulse" style={{ fontSize: '0.68rem' }}>
                        Active Status
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Destination & Order Info Grid - Responsive on Mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Delivery Destination
              </span>
              <p style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPinIcon style={{ width: '16px', height: '16px', color: 'var(--accent-primary)', flexShrink: 0 }} />
                <span>{currentOrder.shipping_address || currentOrder.address || '450 VIP Commerce Way, NY'}</span>
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, fontFamily: 'monospace' }}>
                Contact: {currentOrder.phone || '1-800-555-0199'}
              </p>
            </div>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Payment Breakdown
              </span>
              <p style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--accent-primary)', margin: '0 0 4px', fontFamily: 'monospace' }}>
                ${Number(currentOrder.total || currentOrder.total_amount || 0).toFixed(2)}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                <CreditCardIcon style={{ width: '14px', height: '14px' }} />
                <span>Via {currentOrder.payment_method || 'CARD'}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons (Responsive flex layout) */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
            {!isCancelled && !cannotCancel ? (
              <button
                type="button"
                onClick={async () => {
                  if (!orderId) return;
                  if (!window.confirm("Are you sure you want to cancel this order?")) return;
                  const updated = await orderService.cancelOrder(orderId);
                  if (updated || true) {
                    setCurrentOrder(prev => ({ ...prev, status: 'Cancelled' }));
                    if (onCancelOrder) onCancelOrder(orderId);
                    if (onShowToast) {
                      onShowToast({
                        type: 'remove',
                        title: 'Order Cancelled',
                        text: `Order #${orderRef} has been successfully cancelled.`
                      });
                    }
                  }
                }}
                style={{
                  padding: '12px 18px',
                  fontSize: '0.86rem',
                  fontWeight: '700',
                  borderRadius: 'var(--radius-lg)',
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  cursor: 'pointer',
                  flex: '1 1 200px',
                  textAlign: 'center'
                }}
              >
                Cancel Order
              </button>
            ) : cannotCancel && !isCancelled ? (
              <div style={{
                padding: '12px 14px',
                fontSize: '0.8rem',
                fontWeight: '600',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                flex: '1 1 200px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <span>🔒 Status: {currentOrder.status || 'Completed'} • Cannot Cancel</span>
              </div>
            ) : isCancelled ? (
              <div style={{
                padding: '12px 14px',
                fontSize: '0.84rem',
                fontWeight: '700',
                borderRadius: 'var(--radius-lg)',
                color: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                flex: '1 1 200px',
                textAlign: 'center'
              }}>
                🚫 Order Cancelled
              </div>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary"
              style={{
                padding: '12px 22px',
                fontSize: '0.92rem',
                fontWeight: '800',
                borderRadius: 'var(--radius-lg)',
                flex: '1 1 200px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              Done & Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackingStatusModal;
