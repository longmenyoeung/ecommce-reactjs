import React, { useState } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import CartSummary from '../../../components/cart/CartSummary';
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

/**
 * Checkout Page Component
 */
export function Checkout({ cart = [], subtotal = 0, onCompleteOrder }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onCompleteOrder) onCompleteOrder(formData);
    }, 1200);
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '28px' }}>Secure Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '28px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>Shipping Address</h3>
          <Input label="Full Name" icon={UserIcon} required placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input label="Email Address" icon={EnvelopeIcon} type="email" required placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Input label="Phone Number" icon={PhoneIcon} required placeholder="+1 (555) 000-1234" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <Input label="Street Address" icon={MapPinIcon} required placeholder="123 Premium Way, Apt 4B" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input label="City / State" required placeholder="New York, NY" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
            <Input label="Postal / ZIP Code" required placeholder="10001" value={formData.zip} onChange={(e) => setFormData({ ...formData, zip: e.target.value })} />
          </div>
          <Button type="submit" disabled={loading} style={{ padding: '14px', marginTop: '12px' }}>
            {loading ? 'Processing Order...' : 'Place Secure Order'}
          </Button>
        </form>

        <CartSummary subtotal={subtotal} shipping={0} onCheckout={() => {}} />
      </div>
    </div>
  );
}

export default Checkout;
