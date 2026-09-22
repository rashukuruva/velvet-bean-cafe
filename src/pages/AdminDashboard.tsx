import React, { useState, useEffect } from 'react';
import {
  Coffee,
  IndianRupee,
  ShoppingBag,
  Users,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Filter,
  Eye,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { AdminStats, MenuItem, Order, Reservation, CustomerStats } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

export const AdminDashboard: React.FC = () => {
  const { token, user } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'orders' | 'reservations' | 'customers'>('overview');
  const [loading, setLoading] = useState(true);

  // Management States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customers, setCustomers] = useState<CustomerStats[]>([]);

  // Item Modal (Add / Edit)
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'Coffee' | 'Tea' | 'Desserts' | 'Snacks'>('Coffee');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsVeg, setFormIsVeg] = useState(true);
  const [formPrepTime, setFormPrepTime] = useState('3-5 min');
  const [formBadge, setFormBadge] = useState('');
  const [savingItem, setSavingItem] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [resStats, resMenu, resOrders, resReservations, resCust] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/menu'),
        fetch('/api/orders', { headers }),
        fetch('/api/reservations', { headers }),
        fetch('/api/admin/customers', { headers })
      ]);

      if (resStats.ok) setStats(await resStats.json());
      if (resMenu.ok) setMenuItems(await resMenu.json());
      if (resOrders.ok) setOrders(await resOrders.json());
      if (resReservations.ok) setReservations(await resReservations.json());
      if (resCust.ok) setCustomers(await resCust.json());
    } catch (err) {
      console.error('Error loading admin portal:', err);
    } finally {
      setLoading(false);
    }
  };

  // Status Change handlers
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any } : o));
      }
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleUpdateReservationStatus = async (resId: number, status: string) => {
    try {
      const res = await fetch(`/api/reservations/${resId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: status as any } : r));
      }
    } catch (err) {
      alert('Failed to update reservation status');
    }
  };

  const handleToggleMenuAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          availability: !item.availability
        })
      });
      if (res.ok) {
        setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, availability: !i.availability } : i));
      }
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  const handleDeleteMenuItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMenuItems(prev => prev.filter(i => i.id !== itemId));
      }
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const openAddItemModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Coffee');
    setFormDescription('');
    setFormPrice('4.50');
    setFormImageUrl('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80');
    setFormIsVeg(true);
    setFormPrepTime('3-5 min');
    setFormBadge('New');
    setItemModalOpen(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormPrice(String(item.price));
    setFormImageUrl(item.image_url);
    setFormIsVeg(item.is_veg);
    setFormPrepTime(item.prep_time || '3-5 min');
    setFormBadge(item.badge || '');
    setItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingItem(true);
    try {
      const payload = {
        name: formName,
        category: formCategory,
        description: formDescription,
        price: parseFloat(formPrice),
        image_url: formImageUrl,
        is_veg: formIsVeg,
        prep_time: formPrepTime,
        badge: formBadge || null
      };

      const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (editingItem) {
          setMenuItems(prev => prev.map(i => i.id === editingItem.id ? data.item : i));
        } else {
          setMenuItems([data.item, ...menuItems]);
        }
        setItemModalOpen(false);
      }
    } catch (err) {
      alert('Failed to save menu item');
    } finally {
      setSavingItem(false);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Top Banner */}
      <div className="bg-[#3E2723] rounded-3xl p-6 sm:p-10 text-[#FFF8F2] shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4E342E] text-amber-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Management Console</span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold">
            Velvet Bean Café Dashboard 🫘
          </h1>
          <p className="text-xs text-[#D7CCC8]">
            Overview of live orders, table reservations, bakery stock, and loyal patrons.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { id: 'overview', label: 'Overview & Charts' },
            { id: 'menu', label: 'Menu Items' },
            { id: 'orders', label: 'Live Orders' },
            { id: 'reservations', label: 'Reservations' },
            { id: 'customers', label: 'Customer Lounge' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#FFF8F2] text-[#3E2723] shadow-xs'
                  : 'bg-[#4E342E] text-[#D7CCC8] hover:bg-[#5D4037]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. OVERVIEW & METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 4 Cute Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#D7CCC8] shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EFEBE9] text-[#4E342E] flex items-center justify-center shrink-0">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#8D6E63] uppercase">Total Customers</span>
                <h3 className="font-serif-title text-2xl font-bold text-[#3E2723]">
                  {stats?.summary.totalCustomers || 128}
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold">+14% this week</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#D7CCC8] shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EFEBE9] text-[#4E342E] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#8D6E63] uppercase">Today's Orders</span>
                <h3 className="font-serif-title text-2xl font-bold text-[#3E2723]">
                  {stats?.summary.todayOrders || 42}
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold">+8% vs yesterday</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#D7CCC8] shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EFEBE9] text-[#4E342E] flex items-center justify-center shrink-0">
                <IndianRupee className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#8D6E63] uppercase">Today's Revenue</span>
                <h3 className="font-serif-title text-2xl font-bold text-[#3E2723]">
                  ₹{stats?.summary.todayRevenue ? stats.summary.todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '34,250.00'}
                </h3>
                <span className="text-[10px] text-amber-700 font-bold">Total: ₹{stats?.summary.totalRevenue ? stats.summary.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '2,14,500.00'}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#D7CCC8] shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EFEBE9] text-[#4E342E] flex items-center justify-center shrink-0">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#8D6E63] uppercase">Active Bookings</span>
                <h3 className="font-serif-title text-2xl font-bold text-[#3E2723]">
                  {stats?.summary.activeReservations || 14}
                </h3>
                <span className="text-[10px] text-amber-700 font-bold">Lounge & Garden Patio</span>
              </div>
            </div>
          </div>

          {/* Recharts Cute Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Revenue Trend Line Graph */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#D7CCC8] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-title font-bold text-base text-[#3E2723]">
                    Weekly Revenue Trend (₹)
                  </h3>
                  <p className="text-xs text-[#8D6E63]">Daily espresso & bakery sales</p>
                </div>
                <div className="text-xs font-bold text-[#4E342E] flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>+18.4% growth</span>
                </div>
              </div>

              <div className="h-64 w-full">
                {stats?.revenueChart && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.revenueChart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <XAxis dataKey="day" stroke="#A1887F" fontSize={11} />
                      <YAxis stroke="#A1887F" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip
                        formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}
                        contentStyle={{
                          backgroundColor: '#FFF8F2',
                          borderColor: '#D7CCC8',
                          borderRadius: '16px',
                          fontSize: '12px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4E342E"
                        strokeWidth={3}
                        dot={{ fill: '#795548', r: 4 }}
                        activeDot={{ r: 6, fill: '#3E2723' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Popular Items Pie Chart */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#D7CCC8] shadow-xs space-y-4">
              <div>
                <h3 className="font-serif-title font-bold text-base text-[#3E2723]">
                  Most Loved Brews ☕
                </h3>
                <p className="text-xs text-[#8D6E63]">Share of drink orders</p>
              </div>

              <div className="h-56 w-full">
                {stats?.popularItems && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.popularItems}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="count"
                      >
                        {stats.popularItems.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFF8F2',
                          borderColor: '#D7CCC8',
                          borderRadius: '16px',
                          fontSize: '11px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5D4037]">
                {stats?.popularItems.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name} ({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Volume Bar Graph */}
            <div className="lg:col-span-12 bg-white p-6 rounded-3xl border border-[#D7CCC8] shadow-xs space-y-4">
              <h3 className="font-serif-title font-bold text-base text-[#3E2723]">
                Daily Orders by Channel (Takeaway vs Delivery)
              </h3>
              <div className="h-60 w-full">
                {stats?.ordersChart && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.ordersChart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <XAxis dataKey="day" stroke="#A1887F" fontSize={11} />
                      <YAxis stroke="#A1887F" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFF8F2',
                          borderColor: '#D7CCC8',
                          borderRadius: '16px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="takeaway" name="In-Store / Pickup" fill="#5D4037" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="delivery" name="Doorstep Delivery" fill="#A1887F" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MENU MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D7CCC8] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-serif-title font-bold text-xl text-[#3E2723]">
                Menu & Bakery Inventory
              </h2>
              <p className="text-xs text-[#8D6E63]">
                Add, edit prices, or toggle active availability of drinks and desserts.
              </p>
            </div>
            <button
              onClick={openAddItemModal}
              className="px-5 py-2.5 bg-[#4E342E] hover:bg-[#3E2723] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF8F2] text-[#5D4037] uppercase text-[10px] font-bold border-b border-[#EFEBE9]">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE9]">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FFF8F2]/50">
                    <td className="p-3 flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[#EFEBE9]"
                      />
                      <div>
                        <div className="font-bold text-[#3E2723]">{item.name}</div>
                        <div className="text-[11px] text-[#8D6E63] truncate max-w-xs">{item.description}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-[#EFEBE9] px-2.5 py-1 rounded-full text-[10px] font-semibold text-[#5D4037]">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-[#3E2723]">
                      ₹{typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(String(item.price)).toFixed(2)}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleMenuAvailability(item)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.availability
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {item.availability ? '● Available' : '○ Sold Out'}
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => openEditItemModal(item)}
                        className="p-1.5 rounded-lg bg-[#EFEBE9] hover:bg-[#D7CCC8] text-[#3E2723]"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D7CCC8] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-title font-bold text-xl text-[#3E2723]">
                Customer Orders ({orders.length})
              </h2>
              <p className="text-xs text-[#8D6E63]">
                Live queue: accept orders, update preparation stages, and confirm dispatch.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-2xl border border-[#EFEBE9] bg-[#FFF8F2]/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#3E2723]">
                      #{ord.id}
                    </span>
                    <span className="font-semibold text-xs text-[#3E2723]">
                      {ord.customer_name}
                    </span>
                    <span className="bg-[#4E342E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {ord.order_type}
                    </span>
                  </div>

                  <div className="text-xs text-[#5D4037]">
                    {ord.items && ord.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ')}
                  </div>

                  {ord.delivery_address && (
                    <div className="text-[11px] text-[#8D6E63]">
                      📍 {ord.delivery_address}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-serif-title font-extrabold text-sm text-[#3E2723] block">
                      ₹{parseFloat(String(ord.total_amount)).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#8D6E63]">{ord.payment_method}</span>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={ord.status}
                    onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                    className="bg-white border border-[#D7CCC8] rounded-xl px-3 py-1.5 text-xs font-bold text-[#3E2723] focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. RESERVATION MANAGEMENT */}
      {activeTab === 'reservations' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D7CCC8] shadow-xs space-y-6">
          <div>
            <h2 className="font-serif-title font-bold text-xl text-[#3E2723]">
              Table Bookings & Reservations
            </h2>
            <p className="text-xs text-[#8D6E63]">
              Review guest party sizes, seating preferences, and approve reservations.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF8F2] text-[#5D4037] uppercase text-[10px] font-bold border-b border-[#EFEBE9]">
                <tr>
                  <th className="p-3">Ref</th>
                  <th className="p-3">Guest Name</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Guests</th>
                  <th className="p-3">Seating Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE9]">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FFF8F2]/50">
                    <td className="p-3 font-mono font-bold text-[#795548]">#{r.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-[#3E2723]">{r.customer_name}</div>
                      <div className="text-[10px] text-[#8D6E63]">{r.customer_email}</div>
                    </td>
                    <td className="p-3 font-medium">
                      {r.reservation_date} • {r.reservation_time}
                    </td>
                    <td className="p-3 font-bold">{r.guests} Guests</td>
                    <td className="p-3 text-[#795548]">{r.seating_type}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      {r.status !== 'Confirmed' && (
                        <button
                          onClick={() => handleUpdateReservationStatus(r.id, 'Confirmed')}
                          className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-800"
                        >
                          Approve
                        </button>
                      )}
                      {r.status !== 'Rejected' && (
                        <button
                          onClick={() => handleUpdateReservationStatus(r.id, 'Rejected')}
                          className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg text-[10px] font-bold hover:bg-red-200"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. CUSTOMER MANAGEMENT */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D7CCC8] shadow-xs space-y-6">
          <div>
            <h2 className="font-serif-title font-bold text-xl text-[#3E2723]">
              Registered Café Patrons ({customers.length})
            </h2>
            <p className="text-xs text-[#8D6E63]">
              Customer profiles, loyalty activity, and preferred coffee moods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-[#EFEBE9] bg-[#FFF8F2]/60 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#EFEBE9] overflow-hidden border border-[#D7CCC8] flex items-center justify-center font-serif-title font-bold text-sm text-[#4E342E]">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      c.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-serif-title font-bold text-sm text-[#3E2723]">{c.name}</h4>
                    <p className="text-xs text-[#8D6E63]">{c.email}</p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#EFEBE9] text-xs space-y-1 text-[#5D4037]">
                  <div className="flex justify-between">
                    <span>Preferred Mood:</span>
                    <strong className="text-[#3E2723]">☕ {c.coffee_mood || 'Vanilla Latte'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Orders:</span>
                    <strong className="text-[#3E2723]">{c.total_orders || 0} orders</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Spent:</span>
                    <strong className="text-emerald-700 font-bold">₹{parseFloat(String(c.total_spent || 0)).toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Menu Item */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FFF8F2] w-full max-w-lg rounded-3xl shadow-2xl border border-[#D7CCC8] overflow-hidden">
            <div className="p-5 bg-[#4E342E] text-white flex items-center justify-between">
              <h3 className="font-serif-title font-bold text-lg">
                {editingItem ? 'Edit Menu Item' : 'Add New Café Item'}
              </h3>
              <button
                onClick={() => setItemModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#3E2723]">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Lavender Cardamom Latte"
                    className="w-full bg-white border border-[#D7CCC8] rounded-xl px-3 py-2 text-[#3E2723] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#3E2723]">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-white border border-[#D7CCC8] rounded-xl px-3 py-2 text-[#3E2723] focus:outline-none"
                  >
                    <option value="Coffee">Coffee</option>
                    <option value="Tea">Tea</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3E2723]">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Rich aromatic notes and ingredients..."
                  className="w-full bg-white border border-[#D7CCC8] rounded-xl px-3 py-2 text-[#3E2723] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#3E2723]">Price (₹) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="240.00"
                    className="w-full bg-white border border-[#D7CCC8] rounded-xl px-3 py-2 text-[#3E2723] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#3E2723]">Badge (Optional)</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. Best Seller, Seasonal"
                    className="w-full bg-white border border-[#D7CCC8] rounded-xl px-3 py-2 text-[#3E2723] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3E2723]">Image URL *</label>
                <input
                  type="url"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white border border-[#D7CCC8] rounded-xl px-3 py-2 text-[#3E2723] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="vegCheck"
                  checked={formIsVeg}
                  onChange={(e) => setFormIsVeg(e.target.checked)}
                  className="rounded text-[#4E342E]"
                />
                <label htmlFor="vegCheck" className="text-xs text-[#5D4037] font-semibold cursor-pointer">
                  Vegetarian
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="px-4 py-2 bg-stone-200 text-[#3E2723] rounded-full text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="px-5 py-2 bg-[#4E342E] hover:bg-[#3E2723] text-white rounded-full text-xs font-bold shadow-xs"
                >
                  {savingItem ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
