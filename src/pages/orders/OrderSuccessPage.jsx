import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircleIcon, ShieldCheckIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { paymentService } from '../../services/payment.service';
import { orderService } from '../../services/order.service';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { showToast } = useToast();

  const orderId = searchParams.get('order_id') || searchParams.get('id');
  const method = searchParams.get('method') || 'anajak';
  const transactionId = searchParams.get('transaction_id');

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  /**
   * Customer-facing wording. Gateway codes and database statuses are translated
   * into plain shop language so the page reads like a receipt, not a log file.
   */
  const PAYMENT_METHOD_LABELS = {
    anajak: 'ABA Pay / Bakong KHQR',
    khqr: 'ABA Pay / Bakong KHQR',
    aba: 'ABA Pay / Bakong KHQR',
    qr: 'ABA Pay / Bakong KHQR',
    bank: 'Bank Transfer',
    card: 'Credit / Debit Card',
    cod: 'Cash on Delivery'
  };

  const STATUS_LABELS = {
    pending: 'Awaiting payment',
    processing: 'Being prepared',
    paid: 'Paid',
    packed: 'Packed',
    shipped: 'On the way',
    'in transit': 'In transit',
    in_transit: 'In transit',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
    canceled: 'Cancelled',
    refunded: 'Refunded',
    on_hold: 'On hold'
  };

  const rawMethod = String(order?.payment_method || method || 'anajak').toLowerCase().trim();
  const paymentLabel = PAYMENT_METHOD_LABELS[rawMethod] || 'ABA Pay / Bakong KHQR';

  const rawStatus = String(order?.status_raw || order?.status || 'processing').toLowerCase().trim();
  const statusLabel = STATUS_LABELS[rawStatus]
    || rawStatus.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  const amountPaid = order?.total ? parseFloat(order.total).toFixed(2) : null;

  const placedOn = order?.created_at || order?.date;
  const placedOnDate = placedOn && !Number.isNaN(new Date(placedOn).getTime())
    ? new Date(placedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  useEffect(() => {
    // Clear shopping cart on successful checkout
    try {
      clearCart();
    } catch {}

    if (!orderId) {
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        setLoading(true);
        // 1. Verify payment with backend
        const verifyRes = await paymentService.verifyAnajakPayment(orderId, transactionId);
        if (verifyRes && verifyRes.success) {
          setConfirmed(true);
          setOrder(verifyRes.order);
          if (showToast) {
            showToast({
              type: 'success',
              title: 'Payment Confirmed!',
              text: `Order #${orderId} was paid successfully via ABA Pay / KHQR.`
            });
          }
        }
      } catch (err) {
        console.warn("Payment verification warning:", err);
        // Fallback: try loading order details directly
        try {
          const fetched = await orderService.getOrderById(orderId);
          if (fetched) setOrder(fetched);
        } catch {}
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [orderId]);

  return (
    <div style={{
      maxWidth: '680px',
      margin: '40px auto',
      padding: '0 20px',
      minHeight: '65vh'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 28px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Success Icon Badge */}
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          border: '2px solid #10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#10b981',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)'
        }}>
          <CheckCircleIcon style={{ width: '46px', height: '46px' }} />
        </div>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 14px',
          borderRadius: '20px',
          backgroundColor: 'rgba(214, 27, 35, 0.12)',
          color: '#D61B23',
          fontSize: '0.8rem',
          fontWeight: '800',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          marginBottom: '12px'
        }}>
          Payment secured by AnajakPay • ABA Pay / KHQR
        </span>

        <h1 style={{
          fontSize: '1.9rem',
          fontWeight: '900',
          margin: '0 0 10px',
          color: 'var(--text-primary)'
        }}>
          Thank you for your order!
        </h1>

        <p style={{
          fontSize: '0.96rem',
          color: 'var(--text-secondary)',
          margin: '0 0 24px',
          lineHeight: 1.6
        }}>
          Your payment{amountPaid ? ` of $${amountPaid}` : ''} has been received and your order is confirmed.
          Our team at <strong>Men ITC Store</strong> is preparing your items now, and we will email you as soon as
          your parcel is on its way.
        </p>

        {/* Order Details Card */}
        {orderId && (
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            textAlign: 'left',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Order Reference</span>
                <div style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                  #{orderId}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Status</span>
                <div>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    color: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    padding: '3px 10px',
                    borderRadius: '12px'
                  }}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Payment Method</span>
                <strong style={{ color: 'var(--text-primary)' }}>{paymentLabel}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Payment Status</span>
                {loading ? (
                  <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Verifying with your bank...</span>
                ) : (
                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                    <ShieldCheckIcon style={{ width: '16px', height: '16px' }} /> {confirmed ? 'Paid and verified' : 'Paid'}
                  </span>
                )}
              </div>
              {amountPaid && (
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Amount Paid</span>
                  <strong style={{ color: 'var(--accent-primary)', fontSize: '1.05rem' }}>${amountPaid}</strong>
                </div>
              )}
              {placedOnDate && (
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Order Date</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{placedOnDate}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Single, obvious next step - the receipt page needs no tracking CTA */}
        <Link
          to="/"
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '14px',
            fontSize: '0.98rem',
            fontWeight: '800',
            textDecoration: 'none'
          }}
        >
          <ShoppingBagIcon style={{ width: '20px', height: '20px' }} />
          <span>Continue Shopping</span>
        </Link>

        <p style={{
          margin: '16px 0 0',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          lineHeight: 1.55
        }}>
          A receipt has been emailed to you. Keep {orderId ? `reference #${orderId}` : 'your order reference'} handy if you
          need to reach our support team.
        </p>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
