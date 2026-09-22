import React, { useState, useEffect } from 'react';
import { Coffee, Clock, Calendar, CheckCircle2, Package, RotateCcw, AlertCircle, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { Order, Reservation } from '../types/index.ts';

interface CustomerDashboardProps {
  onNavigate: (tab: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigate }) => {
  const { user, token, updateCoffeeMood } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [moodUpdating, setMoodUpdating] = useState<boolean>(false);
  const [activeMood, setActiveMood] = useState<string>(user?.coffee_mood || 'Vanilla Bean Latte');
  const [activeTab, setActiveTab] = useState<'orders' | 'reservations'>('orders');

  const moodOptions = [
    { title: 'Vanilla Bean Latte', desc: 'Smooth, sweet & grounding', emoji: '🌾' },
    { title: 'Double Velvet Espresso', desc: 'High energy & laser focus', emoji: '⚡' },
    { title: 'Café Mocha Royale', desc: 'Decadent chocolate & cozy warmth', emoji: '🍫' },
    { title: 'Ceremonial Matcha Green', desc: 'Zen mindfulness & clean boost', emoji: '🍃' },
  ];

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resOrders, resRes] = await Promise.all([
        fetch('/api/orders/my-orders', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/reservations/my-reservations', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (resOrders.ok) {
        const orderData = await resOrders.json();
        setOrders(orderData);
      }

      if (resRes.ok) {
        const resData = await resRes.json();
        setReservations(resData);
      }
    } catch (err) {
      console.error('Failed to load customer lounge data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMood = async (mood: string) => {
    setActiveMood(mood);
    setMoodUpdating(true);
    await updateCoffeeMood(mood);
    setMoodUpdating(false);
  };

  const handleCancelReservation = async (resId: number) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const res = await fetch(`/api/reservations/${resId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReservations((prev) => prev.filter((r) => r.id !== resId));
      }
    } catch (err) {
      alert('Failed to cancel reservation');
    }
  };

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Confirmed':
        return 1;
      case 'Preparing':
        return 2;
      case 'Ready':
        return 3;
      case 'Completed':
        return 4;
      default:
        return 0;
    }
  };

  const steps = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed'];

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* 1. Welcome Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D7CCC8] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-[#EFEBE9] border-2 border-[#D7CCC8] overflow-hidden flex items-center justify-center font-serif-title text-2xl font-bold text-[#4E342E] shadow-sm">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-10 h-10 text-[#795548]" />
            )}
          </div>
          <div className="space-y-1 text-left">
            <span className="text-xs uppercase font-bold tracking-widest text-[#795548]">
              Welcome to Your Lounge
            </span>
            <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-[#3E2723]">
              {user?.name || 'Dear Coffee Lover'} ☕
            </h1>
            <p className="text-xs text-[#8D6E63]">{user?.email}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('menu')}
            className="px-6 py-2.5 bg-[#4E342E] hover:bg-[#3E2723] text-white rounded-full font-semibold text-xs transition-colors shadow-xs"
          >
            Order Coffee Now
          </button>
          <button
            onClick={() => onNavigate('reservations')}
            className="px-6 py-2.5 bg-[#FFF8F2] hover:bg-[#EFEBE9] text-[#3E2723] border border-[#D7CCC8] rounded-full font-semibold text-xs transition-colors"
          >
            Book a Table
          </button>
        </div>
      </div>

      {/* 2. Coffee Mood of the Day Card */}
      <div className="bg-gradient-to-br from-[#4E342E] to-[#3E2723] rounded-3xl p-6 sm:p-8 text-[#FFF8F2] shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#D7CCC8] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Your Coffee Aura
            </span>
            <h3 className="font-serif-title text-xl sm:text-2xl font-bold">
              Current Daily Mood: <span className="text-amber-200">{activeMood}</span>
            </h3>
          </div>
          {moodUpdating && (
            <span className="text-xs text-amber-200 animate-pulse">Saving preference...</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {moodOptions.map((opt) => (
            <button
              key={opt.title}
              onClick={() => handleSelectMood(opt.title)}
              className={`p-3.5 rounded-2xl text-left border transition-all ${
                activeMood === opt.title
                  ? 'bg-[#FFF8F2] text-[#3E2723] border-[#FFF8F2] shadow-sm font-bold'
                  : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
              }`}
            >
              <div className="text-2xl mb-1">{opt.emoji}</div>
              <div className="text-xs font-bold">{opt.title}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Orders & Reservations Switcher */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-[#D7CCC8] pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 px-3 font-serif-title font-bold text-base transition-colors relative ${
              activeTab === 'orders' ? 'text-[#3E2723]' : 'text-[#8D6E63] hover:text-[#3E2723]'
            }`}
          >
            My Orders ({orders.length})
            {activeTab === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4E342E] rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`pb-2 px-3 font-serif-title font-bold text-base transition-colors relative ${
              activeTab === 'reservations' ? 'text-[#3E2723]' : 'text-[#8D6E63] hover:text-[#3E2723]'
            }`}
          >
            My Table Reservations ({reservations.length})
            {activeTab === 'reservations' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4E342E] rounded-full"></span>
            )}
          </button>
        </div>

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {loading ? (
              <div className="p-12 text-center text-[#795548] text-xs">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EFEBE9] space-y-3">
                <Coffee className="w-10 h-10 text-[#A1887F] mx-auto" />
                <h3 className="font-serif-title text-lg font-bold text-[#3E2723]">No orders yet</h3>
                <p className="text-xs text-[#795548]">
                  Treat yourself to fresh espresso or freshly baked French pastries!
                </p>
                <button
                  onClick={() => onNavigate('menu')}
                  className="mt-2 px-6 py-2 bg-[#4E342E] text-white rounded-full text-xs font-semibold hover:bg-[#3E2723]"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              orders.map((ord) => {
                const currentStepIdx = getStatusStepIndex(ord.status);

                return (
                  <div
                    key={ord.id}
                    className="bg-white rounded-3xl p-6 border border-[#D7CCC8] shadow-xs space-y-5"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFEBE9] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#3E2723]">
                            Order #{ord.id}
                          </span>
                          <span className="bg-[#EFEBE9] text-[#5D4037] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {ord.order_type}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#8D6E63] mt-0.5 block">
                          Placed on{' '}
                          {new Date(ord.created_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                            ord.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {ord.status}
                        </span>
                        <span className="font-serif-title text-base font-extrabold text-[#3E2723]">
                          ₹{parseFloat(String(ord.total_amount)).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Live Progress Step Tracker for active orders */}
                    {ord.status !== 'Cancelled' && (
                      <div className="py-2">
                        <div className="relative flex items-center justify-between max-w-2xl mx-auto">
                          {/* Background line */}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#EFEBE9] z-0"></div>
                          {/* Active filled line */}
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#4E342E] z-0 transition-all duration-500"
                            style={{ width: `${(currentStepIdx / 4) * 100}%` }}
                          ></div>

                          {steps.map((st, sIdx) => {
                            const isDone = sIdx <= currentStepIdx;
                            const isCurrent = sIdx === currentStepIdx;
                            return (
                              <div key={st} className="relative z-10 flex flex-col items-center">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                    isDone
                                      ? 'bg-[#4E342E] text-white'
                                      : 'bg-white border-2 border-[#D7CCC8] text-[#A1887F]'
                                  } ${isCurrent ? 'ring-4 ring-[#D7CCC8]' : ''}`}
                                >
                                  {isDone ? '✓' : sIdx + 1}
                                </div>
                                <span
                                  className={`text-[10px] font-semibold mt-1.5 ${
                                    isDone ? 'text-[#3E2723]' : 'text-[#A1887F]'
                                  }`}
                                >
                                  {st}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Ordered Items List */}
                    <div className="bg-[#FFF8F2] p-4 rounded-2xl border border-[#EFEBE9] space-y-2 text-xs">
                      {ord.items && ord.items.length > 0 ? (
                        ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-[#5D4037]">
                            <span>
                              {it.quantity}x <strong>{it.item_name}</strong>
                            </span>
                            <span className="font-semibold">
                              ₹{(parseFloat(String(it.price)) * it.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-[#8D6E63]">Artisan café items</div>
                      )}
                      {ord.delivery_address && (
                        <div className="pt-2 border-t border-[#EFEBE9] text-[11px] text-[#8D6E63]">
                          <span className="font-semibold text-[#3E2723]">Fulfillment:</span>{' '}
                          {ord.delivery_address}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Reservations Tab Content */}
        {activeTab === 'reservations' && (
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-[#795548] text-xs">Loading reservations...</div>
            ) : reservations.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EFEBE9] space-y-3">
                <Calendar className="w-10 h-10 text-[#A1887F] mx-auto" />
                <h3 className="font-serif-title text-lg font-bold text-[#3E2723]">
                  No table bookings
                </h3>
                <p className="text-xs text-[#795548]">
                  Reserve a cozy lounge corner or sunlit garden patio table.
                </p>
                <button
                  onClick={() => onNavigate('reservations')}
                  className="mt-2 px-6 py-2 bg-[#4E342E] text-white rounded-full text-xs font-semibold hover:bg-[#3E2723]"
                >
                  Book a Table
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservations.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white p-6 rounded-3xl border border-[#D7CCC8] shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[#EFEBE9] pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#3E2723]">
                          Reservation #{r.id}
                        </span>
                        <h4 className="font-serif-title font-bold text-base text-[#3E2723] mt-0.5">
                          {r.seating_type}
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                          r.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Rejected' || r.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#5D4037]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#A1887F]" />
                        <span>Date: <strong>{r.reservation_date}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#A1887F]" />
                        <span>Time: <strong>{r.reservation_time}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-[#A1887F]" />
                        <span>Party Size: <strong>{r.guests} Guests</strong></span>
                      </div>
                      {r.special_request && (
                        <p className="text-[11px] text-[#8D6E63] italic pt-1">
                          "{r.special_request}"
                        </p>
                      )}
                    </div>

                    {r.status === 'Confirmed' || r.status === 'Pending' ? (
                      <div className="pt-2 border-t border-[#EFEBE9]">
                        <button
                          onClick={() => handleCancelReservation(r.id)}
                          className="text-xs text-red-600 hover:underline font-semibold"
                        >
                          Cancel Reservation
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
