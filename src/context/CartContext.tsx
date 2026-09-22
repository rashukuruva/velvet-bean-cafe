import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem, Order } from '../types/index.ts';
import { useAuth } from './AuthContext.tsx';
import confetti from 'canvas-confetti';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem, qty?: number) => void;
  removeFromCart: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  couponCode: string;
  appliedCoupon: string | null;
  couponError: string | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  lastPlacedOrder: Order | null;
  setLastPlacedOrder: (order: Order | null) => void;
  submitOrder: (details: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address?: string;
    order_type: 'Delivery' | 'Pickup';
    payment_method: string;
    notes?: string;
  }) => Promise<{ success: boolean; order?: Order; error?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('velvet_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  useEffect(() => {
    localStorage.setItem('velvet_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (menuItem: MenuItem, qty: number = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.menu_item_id === menuItem.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      }
      return [
        ...prev,
        {
          menu_item_id: menuItem.id,
          name: menuItem.name,
          category: menuItem.category,
          price: typeof menuItem.price === 'string' ? parseFloat(menuItem.price) : menuItem.price,
          quantity: qty,
          image_url: menuItem.image_url
        }
      ];
    });
  };

  const removeFromCart = (menuItemId: number) => {
    setItems((prev) => prev.filter((i) => i.menu_item_id !== menuItemId));
  };

  const updateQuantity = (menuItemId: number, delta: number) => {
    setItems((prev) => {
      return prev
        .map((i) => {
          if (i.menu_item_id === menuItemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  // Pricing calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon === 'COZYBEAN10') {
    discount = subtotal * 0.10;
  } else if (appliedCoupon === 'FREESHIP') {
    discount = 50.00;
  } else if (appliedCoupon === 'FIRSTCUP') {
    discount = subtotal * 0.15;
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.05 * 100) / 100; // 5% GST for café / restaurant in India
  const deliveryFee = items.length > 0 ? 50.00 : 0;
  const total = Math.round((taxableAmount + tax + deliveryFee) * 100) / 100;

  const applyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'COZYBEAN10' || clean === 'FREESHIP' || clean === 'FIRSTCUP') {
      setAppliedCoupon(clean);
      setCouponError(null);
      return true;
    } else {
      setCouponError('Invalid promo code. Try COZYBEAN10 or FIRSTCUP');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#795548', '#A1887F', '#D7CCC8', '#EFEBE9', '#BCAAA4']
      });
    } catch {
      // Confetti fallback
    }
  };

  const submitOrder = async (details: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address?: string;
    order_type: 'Delivery' | 'Pickup';
    payment_method: string;
    notes?: string;
  }) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload = {
        items,
        customer_name: details.customer_name,
        customer_email: details.customer_email,
        customer_phone: details.customer_phone,
        delivery_address: details.delivery_address,
        order_type: details.order_type,
        payment_method: details.payment_method,
        coupon_code: appliedCoupon,
        notes: details.notes
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to place order' };
      }

      triggerConfetti();
      setLastPlacedOrder(data.order);
      clearCart();
      return { success: true, order: data.order };
    } catch (err) {
      return { success: false, error: 'Network error while placing order.' };
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        discount,
        tax,
        deliveryFee,
        total,
        couponCode,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        lastPlacedOrder,
        setLastPlacedOrder,
        submitOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
