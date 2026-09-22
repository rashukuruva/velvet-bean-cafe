import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2, Coffee, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface CartDrawerProps {
  onNavigateToDashboard?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateToDashboard }) => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    tax,
    deliveryFee,
    total,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    submitOrder,
    lastPlacedOrder
  } = useCart();

  const { user } = useAuth();

  const [inputCoupon, setInputCoupon] = useState('');
  const [orderType, setOrderType] = useState<'Delivery' | 'Pickup'>('Delivery');
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState('42 Maple Blossom Ave, Apt 3B');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Sync user info if available
  React.useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon) return;
    const ok = applyCoupon(inputCoupon);
    if (ok) setInputCoupon('');
  };

  const handleStartCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    setOrderSuccess(false);
  };

  const handleFinalOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (!customerName.trim() || !customerEmail.trim()) {
      setCheckoutError('Please provide your name and email address.');
      return;
    }

    if (orderType === 'Delivery' && !deliveryAddress.trim()) {
      setCheckoutError('Please provide a delivery address.');
      return;
    }

    setIsSubmitting(true);
    const res = await submitOrder({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      delivery_address: orderType === 'Delivery' ? deliveryAddress : 'In-Store Pickup',
      order_type: orderType,
      payment_method: paymentMethod,
      notes: orderNotes
    });

    setIsSubmitting(false);
    if (res.success) {
      setOrderSuccess(true);
    } else {
      setCheckoutError(res.error || 'Failed to place order. Please try again.');
    }
  };

  return (
    <>
      {/* 1. Slide-over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#FFF8F2] shadow-2xl flex flex-col border-l border-[#D7CCC8]">
              {/* Header */}
              <div className="p-5 bg-[#4E342E] text-[#FFF8F2] flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-[#D7CCC8]" />
                  <h3 className="font-serif-title font-bold text-lg">Your Coffee Basket</h3>
                  <span className="bg-[#795548] text-xs px-2 py-0.5 rounded-full font-medium">
                    {items.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#795548]">
                    <div className="w-16 h-16 rounded-full bg-[#EFEBE9] flex items-center justify-center mb-3">
                      <Coffee className="w-8 h-8 text-[#A1887F]" />
                    </div>
                    <p className="font-serif-title text-lg font-semibold text-[#3E2723]">Your basket is empty</p>
                    <p className="text-sm text-[#8D6E63] mt-1 max-w-xs">
                      The aroma of fresh espresso awaits! Browse our menu and pick your favorite drink or sweet pastry.
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-5 px-5 py-2.5 bg-[#4E342E] text-[#FFF8F2] rounded-full text-sm font-semibold hover:bg-[#3E2723] transition-colors shadow-sm"
                    >
                      Explore Menu
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.menu_item_id}
                      className="flex items-center gap-3.5 bg-white p-3 rounded-2xl border border-[#EFEBE9] shadow-xs"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#EFEBE9]"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-[#3E2723] truncate">{item.name}</h4>
                        <p className="text-xs text-[#795548] font-semibold mt-0.5">
                          ₹{(item.price * item.quantity).toFixed(2)}
                          <span className="text-[11px] text-[#A1887F] font-normal ml-1">
                            (₹{item.price.toFixed(2)} each)
                          </span>
                        </p>
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.menu_item_id, -1)}
                            className="w-6 h-6 rounded-md bg-[#EFEBE9] text-[#4E342E] flex items-center justify-center hover:bg-[#D7CCC8] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-[#3E2723] px-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menu_item_id, 1)}
                            className="w-6 h-6 rounded-md bg-[#EFEBE9] text-[#4E342E] flex items-center justify-center hover:bg-[#D7CCC8] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.menu_item_id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Summary & Checkout Trigger */}
              {items.length > 0 && (
                <div className="p-5 bg-white border-t border-[#D7CCC8] space-y-3.5 shadow-lg">
                  {/* Coupon Box */}
                  <div>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-medium">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                          Promo <strong className="font-mono">{appliedCoupon}</strong> applied!
                        </span>
                        <button
                          onClick={removeCoupon}
                          className="text-red-600 hover:underline text-xs ml-2 font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Promo code (try COZYBEAN10)"
                          value={inputCoupon}
                          onChange={(e) => setInputCoupon(e.target.value)}
                          className="flex-1 bg-[#FFF8F2] border border-[#D7CCC8] rounded-xl px-3 py-1.5 text-xs text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                        />
                        <button
                          type="submit"
                          className="bg-[#5D4037] text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-[#4E342E] transition-colors"
                        >
                          Apply
                        </button>
                      </form>
                    )}
                    {couponError && <p className="text-red-600 text-[11px] mt-1">{couponError}</p>}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-1.5 text-xs text-[#5D4037]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount</span>
                        <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Estimated Tax (5% GST)</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service / Delivery</span>
                      <span>₹{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-[#EFEBE9] pt-2 flex justify-between text-sm font-bold text-[#3E2723]">
                      <span>Total Amount</span>
                      <span className="text-[#4E342E]">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    id="cart-proceed-checkout-btn"
                    onClick={handleStartCheckout}
                    className="w-full bg-[#4E342E] hover:bg-[#3E2723] text-[#FFF8F2] py-3 rounded-full font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Aesthetic Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FFF8F2] w-full max-w-lg rounded-3xl shadow-2xl border border-[#D7CCC8] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-[#4E342E] text-[#FFF8F2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-[#D7CCC8]" />
                <h3 className="font-serif-title font-bold text-lg">
                  {orderSuccess ? 'Order Confirmed!' : 'Complete Your Order'}
                </h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {orderSuccess ? (
                /* Cute Animated Confirmation Screen */
                <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 mx-auto rounded-full bg-[#EFEBE9] flex items-center justify-center shadow-inner relative">
                    <Coffee className="w-10 h-10 text-[#4E342E] animate-bounce" />
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 absolute bottom-0 right-0 bg-white rounded-full" />
                  </div>

                  <div>
                    <h4 className="font-serif-title text-2xl font-bold text-[#3E2723]">
                      Your coffee is on its way! ☕🤎
                    </h4>
                    <p className="text-sm text-[#795548] mt-1">
                      Our baristas are preparing your freshly brewed goodness with lots of love.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#D7CCC8] text-xs space-y-2 text-left text-[#5D4037]">
                    <div className="flex justify-between">
                      <span className="text-[#8D6E63]">Order Reference:</span>
                      <strong className="font-mono text-[#3E2723]">#{lastPlacedOrder?.id || 1024}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8D6E63]">Estimated Arrival:</span>
                      <strong className="text-[#3E2723]">15 - 20 minutes</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8D6E63]">Recipient:</span>
                      <span className="font-semibold text-[#3E2723]">{customerName}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#EFEBE9] pt-1.5 font-bold text-sm text-[#3E2723]">
                      <span>Total Paid:</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        if (onNavigateToDashboard) onNavigateToDashboard();
                      }}
                      className="flex-1 bg-[#4E342E] hover:bg-[#3E2723] text-white py-2.5 rounded-full text-xs font-bold transition-colors shadow-sm"
                    >
                      Track in Coffee Lounge
                    </button>
                    <button
                      onClick={() => setIsCheckoutOpen(false)}
                      className="flex-1 bg-white border border-[#D7CCC8] text-[#3E2723] py-2.5 rounded-full text-xs font-semibold hover:bg-[#EFEBE9] transition-colors"
                    >
                      Done & Return to Menu
                    </button>
                  </div>
                </div>
              ) : (
                /* Checkout Form */
                <form onSubmit={handleFinalOrder} className="space-y-4 text-xs">
                  {checkoutError && (
                    <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
                      {checkoutError}
                    </div>
                  )}

                  {/* Delivery vs Pickup option */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#3E2723] text-xs">Fulfillment Option</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderType('Delivery')}
                        className={`py-2 rounded-xl font-medium border text-xs transition-all ${
                          orderType === 'Delivery'
                            ? 'bg-[#4E342E] text-white border-[#4E342E] shadow-xs'
                            : 'bg-white text-[#5D4037] border-[#D7CCC8] hover:bg-[#EFEBE9]'
                        }`}
                      >
                        🚚 Doorstep Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('Pickup')}
                        className={`py-2 rounded-xl font-medium border text-xs transition-all ${
                          orderType === 'Pickup'
                            ? 'bg-[#4E342E] text-white border-[#4E342E] shadow-xs'
                            : 'bg-white text-[#5D4037] border-[#D7CCC8] hover:bg-[#EFEBE9]'
                        }`}
                      >
                        🛍️ In-Café Pickup
                      </button>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-medium text-[#3E2723]">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Clara Higgins"
                        className="w-full bg-white border border-[#D7CCC8] rounded-xl px-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-[#3E2723]">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="clara@example.com"
                        className="w-full bg-white border border-[#D7CCC8] rounded-xl px-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-[#3E2723]">Phone Number</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white border border-[#D7CCC8] rounded-xl px-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                    />
                  </div>

                  {orderType === 'Delivery' && (
                    <div className="space-y-1">
                      <label className="font-medium text-[#3E2723]">Delivery Address *</label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Apartment, Street address, City"
                        className="w-full bg-white border border-[#D7CCC8] rounded-xl px-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                      />
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#3E2723]">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['UPI / GPay / PhonePe', 'Credit/Debit Card', 'Cash on Delivery'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-2 px-1 rounded-xl text-[11px] font-medium border text-center transition-all ${
                            paymentMethod === m
                              ? 'bg-[#5D4037] text-white border-[#5D4037]'
                              : 'bg-white text-[#5D4037] border-[#D7CCC8] hover:bg-[#EFEBE9]'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Special barista notes */}
                  <div className="space-y-1">
                    <label className="font-medium text-[#3E2723]">Barista Note (Optional)</label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g. Extra hot, oat milk preferred, gate code #402"
                      className="w-full bg-white border border-[#D7CCC8] rounded-xl px-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                    />
                  </div>

                  {/* Order Summary Recap */}
                  <div className="bg-white p-3 rounded-2xl border border-[#EFEBE9] space-y-1.5">
                    <div className="flex justify-between font-medium text-[#5D4037]">
                      <span>Items total ({items.length})</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#8D6E63]">
                      <span>Tax & Fees</span>
                      <span>₹{(tax + (orderType === 'Delivery' ? deliveryFee : 0)).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-[#EFEBE9] pt-1.5 flex justify-between font-bold text-sm text-[#3E2723]">
                      <span>Final Total:</span>
                      <span className="text-[#4E342E]">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    id="checkout-confirm-order-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#4E342E] hover:bg-[#3E2723] disabled:opacity-50 text-[#FFF8F2] py-3 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Brewing your order... ☕</span>
                    ) : (
                      <>
                        <span>Place Order • ₹{total.toFixed(2)}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
