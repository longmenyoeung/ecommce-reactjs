import React, { useState } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

/**
 * Edit Profile Page Component
 */
export function EditProfile({ user, onSave }) {
  const [formData, setFormData] = useState({
    name: user ? user.name : '',
    email: user ? user.email : ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '28px', borderRadius: 'var(--radius-lg)', maxWidth: '540px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: '800' }}>Edit Profile</h3>
      <Input label="Full Name" icon={UserIcon} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
      <Input label="Email Address" icon={EnvelopeIcon} type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
      <Button type="submit" style={{ padding: '12px', marginTop: '8px' }}>Save Changes</Button>
    </form>
  );
}

export default EditProfile;
