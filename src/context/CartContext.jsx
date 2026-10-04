import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { cartService } from '../services/cart.service';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync with localStorage & cartService on items change
  useEffect(() => {
    try {
      localStorage.setItem('nexus_cart', JSON.stringify(cartItems));
      cartService.saveCart(cartItems);
    } catch (e) {
      console.error('Failed to sync cart:', e);
    }
  }, [cartItems]);

  // Load from backend on mount
  useEffect(() => {
    cartService.getCart().then((remoteItems) => {
      if (remoteItems && remoteItems.length > 0) {
        setCartItems(remoteItems);
      }
    }).catch(() => {});
  }, []);

  const addToCart = useCallback((product, qty = 1) => {
    if (!product) return { success: false, message: 'Invalid product' };

    const requestedQty = Math.max(1, Number(qty) || 1);
    const availableStock = (product.stock !== undefined && product.stock !== null) 
      ? Number(product.stock) 
      : 999;

    if (availableStock <= 0) {
      return {
        success: false,
        message: `Sorry, "${product.name}" is currently out of stock.`
      };
    }

    let checkResult = { success: true };

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      const newTotal = currentQty + requestedQty;

      if (newTotal > availableStock) {
        const canAdd = Math.max(0, availableStock - currentQty);
        let msg = '';
        if (currentQty === 0) {
          msg = `Only ${availableStock} item(s) available in stock. You requested ${requestedQty}.`;
        } else if (canAdd > 0) {
          msg = `Only ${availableStock} in stock! You already have ${currentQty} in cart (can add at most ${canAdd} more).`;
        } else {
          msg = `Only ${availableStock} item(s) available in stock. You already have all ${availableStock} in your cart.`;
        }
        checkResult = {
          success: false,
          stock: availableStock,
          currentQty,
          canAdd,
          message: msg
        };
        return prev;
      }

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + requestedQty, stock: availableStock }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: parseFloat(product.price || 0),
          image: product.image,
          category: product.category?.name || product.category || 'General',
          stock: availableStock,
          quantity: requestedQty
        }
      ];
    });

    return checkResult;
  }, []);

  const updateQuantity = useCallback((id, newQuantity) => {
    let checkResult = { success: true };

    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const availableStock = (item.stock !== undefined && item.stock !== null)
              ? Number(item.stock)
              : 999;
            const targetQty = Number(newQuantity);

            if (targetQty > item.quantity && targetQty > availableStock) {
              checkResult = {
                success: false,
                stock: availableStock,
                currentQty: item.quantity,
                message: `Cannot add more. Only ${availableStock} unit(s) available in stock.`
              };
              return item;
            }

            return targetQty > 0 ? { ...item, quantity: Math.min(targetQty, availableStock) } : null;
          }
          return item;
        })
        .filter(Boolean)
    );

    return checkResult;
  }, []);

  const getProductInCartQty = useCallback((productId) => {
    const item = cartItems.find((it) => it.id === productId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    try {
      localStorage.removeItem('nexus_cart');
      cartService.clearCart();
    } catch (e) {
      console.error('Failed to clear cart:', e);
    }
  }, []);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + (parseFloat(item.price || 0) * (item.quantity || 1)),
      0
    );
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCartCount,
        cartSubtotal,
        getProductInCartQty
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
