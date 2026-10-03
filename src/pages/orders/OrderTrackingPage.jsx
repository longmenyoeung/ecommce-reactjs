import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { shipmentService } from '../../services/shipment.service';
import { orderService } from '../../services/order.service';
import { useToast } from '../../context/ToastContext';
import {
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export function OrderTrackingPage() {
  const { orderId: paramOrderId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [inputVal, setInputVal] = useState(paramOrderId || '');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  const executeTrack = async (searchId, silent = false) => {
    if (!searchId || !String(searchId).trim()) return;
    const cleanId = String(searchId).trim();

    try {
      if (!silent) setLoading(true);
      setError(null);
      setSearched(true);

      // 1. Try public real-time track endpoint
      const result = await shipmentService.trackShipment(cleanId);
      if (result && (result.id || result.order_id)) {
        setTrackingData(result);
        return;
      }

      // 2. Try customer order details
      const order = await orderService.getOrderById(cleanId);
      if (order && (order.id || order.order_id)) {
        setTrackingData({
          order_id: order.id || order.order_id,
          id: order.id || order.order_id,
          tracking_number: order.tracking_number || `FX-${cleanId}`,
          status: order.status || 'Processing',
          status_raw: order.status_raw || 'processing',
          carrier: order.carrier || 'FedEx Priority Express',
          estimated_delivery: order.estimated_delivery || 'Estimated in 2 business days',
          location: 'Regional Distribution Center',
          payment_method: order.payment_method || 'CARD',
          total: order.total || 0,
          date: order.date || date('Y-m-d'),
          checkpoints: order.checkpoints || [],
          items: order.items || []
        });
        return;
      }

      if (!silent) {
        setError(`No active order or shipment found for "${cleanId}". Please check your order reference.`);
      }
    } catch (err) {
      console.error('Tracking query failed:', err);
      if (!silent) {
        setError(`Unable to locate tracking details for "${cleanId}". Please try again.`);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (paramOrderId) {
      setInputVal(paramOrderId);
      executeTrack(paramOrderId);
    }
  }, [paramOrderId]);

  // Fast auto-refresh: poll tracking status every 8 seconds if tracking active order
  useEffect(() => {
    const activeSearch = paramOrderId || inputVal;
    if (!activeSearch || !searched) return;

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        executeTrack(activeSearch, true);
      }
    }, 8000);

    const onFocus = () => executeTrack(activeSearch, true);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [paramOrderId, inputVal, searched]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      showToast({
        type: 'info',
        title: 'Input Required',
        text: 'Please enter an Order ID or Tracking Number.'
      });
      return;
    }
    navigate(`/track/${encodeURIComponent(inputVal.trim())}`);
    executeTrack(inputVal.trim());
  };

  const steps = [
    { title: 'Order Placed & Confirmed', desc: 'Payment securely verified' },
    { title: 'Packed at Warehouse', desc: 'Quality inspection passed' },
    { title: 'In Transit with Courier', desc: 'On way to local facility' },
    { title: 'Out for Delivery', desc: 'Courier assigned to route' },
    { title: 'Delivered', desc: 'Signed & safely delivered' }
  ];

  const getStepIndex = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('deliver') || s.includes('complete')) return 4;
    if (s.includes('out')) return 3;
    if (s.includes('transit') || s.includes('shipped')) return 2;
    if (s.includes('process') || s.includes('pack')) return 1;
    return 0;
  };

  const activeStep = trackingData ? getStepIndex(trackingData.status) : 0;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '40px 20px 80px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
          <ArrowLeftIcon style={{ width: '16px', height: '16px' }} /> Return to Shop
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}
        >
          <TruckIcon style={{ width: '28px', height: '28px' }} />
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 10px', color: 'var(--text-primary)' }}>
          Track Your Delivery
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', fontSize: '0.95rem' }}>
          Enter your Order ID (e.g. 10245 or ORD-10245) to monitor live shipping milestones.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '40px' }}>
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            gap: '12px'
          }}
        >
          <MagnifyingGlassIcon style={{ width: '24px', height: '24px', color: 'var(--text-muted)', marginLeft: '8px' }} />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter Order ID or Tracking Number..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              padding: '8px 0'
            }}
          />
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)' }}>
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>
      </form>

      {/* Error View */}
      {error && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--danger)',
            backgroundColor: 'var(--danger-bg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '32px'
          }}
        >
          <ExclamationCircleIcon style={{ width: '28px', height: '28px', color: 'var(--danger)', flexShrink: 0 }} />
          <span style={{ color: 'var(--danger)', fontSize: '0.95rem' }}>{error}</span>
        </div>
      )}

      {/* Tracking Result Card */}
      {trackingData && (
        <div
          className="glass-card animate-fade-in"
          style={{
            padding: '32px 28px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              paddingBottom: '24px',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '32px'
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tracking Code
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                #{trackingData.tracking_number || trackingData.order_id}
              </h3>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-accent" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                {trackingData.status || 'In Transit'}
              </span>
              <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Carrier: {trackingData.carrier || 'Express Courier'}
              </p>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
            {steps.map((step, idx) => {
              const isPast = idx <= activeStep;
              const isCurrent = idx === activeStep;

              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: isPast ? 'var(--color-accent)' : 'var(--bg-secondary)',
                      color: isPast ? '#ffffff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: isCurrent ? '3px solid rgba(59, 130, 246, 0.4)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isPast ? <CheckCircleIcon style={{ width: '20px', height: '20px' }} /> : idx + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '1.05rem',
                        fontWeight: isCurrent ? '800' : '600',
                        color: isPast ? 'var(--text-primary)' : 'var(--text-muted)'
                      }}
                    >
                      {step.title}
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderTrackingPage;
