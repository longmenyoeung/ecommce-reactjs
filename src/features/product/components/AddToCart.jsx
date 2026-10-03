import React, { useState } from 'react';
import Button from '../../../components/common/Button';
import { ShoppingBagIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

/**
 * Add To Cart Action Component for Product Feature
 */
export function AddToCart({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    if (onAddToCart && product) {
      for (let i = 0; i < quantity; i++) {
        onAddToCart(product);
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '14px', marginTop: '20px', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '6px 12px', border: '1px solid var(--border-color)' }}>
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}
        >
          <MinusIcon style={{ width: '16px', height: '16px' }} />
        </button>
        <span style={{ fontWeight: '700', minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}
        >
          <PlusIcon style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      <Button onClick={handleAdd} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px' }}>
        <ShoppingBagIcon style={{ width: '20px', height: '20px' }} />
        <span>Add to Bag</span>
      </Button>
    </div>
  );
}

export default AddToCart;
