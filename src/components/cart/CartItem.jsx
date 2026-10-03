import React from 'react';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '../../utils/formatPrice';
import { getImageUrl } from '../../utils/imageHelper';

/**
 * Reusable Cart Item UI Component
 */
export function CartItem({ item, onUpdateQuantity, onRemove }) {
  const price = parseFloat(item.price || 0);
  const total = price * item.quantity;
  const imgUrl = getImageUrl(item.image);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)', flexShrink: 0 }}>
        {imgUrl && <img src={imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ margin: '0 0 4px', fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.name}
        </h4>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {formatPrice(price)} each
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
          style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <MinusIcon style={{ width: '14px', height: '14px' }} />
        </button>
        <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <PlusIcon style={{ width: '14px', height: '14px' }} />
        </button>
      </div>

      <div style={{ fontWeight: '800', fontSize: '0.95rem', minWidth: '60px', textAlign: 'right', fontFamily: 'Outfit' }}>
        {formatPrice(total)}
      </div>

      <button
        onClick={() => onRemove(item.id)}
        style={{ color: 'var(--danger)', cursor: 'pointer', padding: '6px' }}
      >
        <TrashIcon style={{ width: '18px', height: '18px' }} />
      </button>
    </div>
  );
}

export default CartItem;
