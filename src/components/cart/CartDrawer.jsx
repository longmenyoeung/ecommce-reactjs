import React from 'react';
import CoreCartDrawer from '../../CartDrawer';

/**
 * CartDrawer Re-export / Layer wrapper
 */
export function CartDrawer(props) {
  return <CoreCartDrawer {...props} />;
}

export default CartDrawer;
