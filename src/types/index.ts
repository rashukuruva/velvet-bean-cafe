export type Role = 'customer' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatar_url?: string;
  coffee_mood?: string;
  created_at?: string;
  total_orders?: number;
  total_reservations?: number;
}

export interface MenuItem {
  id: number;
  name: string;
  category: 'Coffee' | 'Tea' | 'Desserts' | 'Snacks';
  description: string;
  price: number | string;
  image_url: string;
  rating: number | string;
  is_veg: boolean;
  availability: boolean;
  prep_time?: string;
  calories?: number;
  badge?: string;
  created_at?: string;
}

export interface CartItem {
  menu_item_id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  menu_item_id?: number;
  item_name: string;
  quantity: number;
  price: number | string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

export interface Order {
  id: number;
  user_id?: number | null;
  total_amount: number | string;
  subtotal: number | string;
  discount: number | string;
  tax: number | string;
  coupon_code?: string;
  status: OrderStatus;
  payment_status: string;
  payment_method: string;
  order_type: 'Delivery' | 'Pickup';
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  delivery_address?: string;
  notes?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface Reservation {
  id: number;
  user_id?: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  seating_type: string;
  special_request?: string;
  status: 'Confirmed' | 'Pending' | 'Rejected' | 'Cancelled' | 'Completed';
  created_at: string;
}

export interface Review {
  id: number;
  user_id?: number | null;
  user_name: string;
  menu_item_id?: number | null;
  menu_item_name?: string;
  rating: number;
  comment: string;
  avatar_url?: string;
  created_at: string;
}

export interface AdminStats {
  summary: {
    totalCustomers: number;
    todayOrders: number;
    todayRevenue: number;
    totalRevenue: number;
    activeReservations: number;
  };
  revenueChart: Array<{
    day: string;
    date: string;
    revenue: number;
    orders: number;
  }>;
  ordersChart: Array<{
    day: string;
    orders: number;
    takeaway: number;
    delivery: number;
  }>;
  popularItems: Array<{
    name: string;
    count: number;
    color: string;
    percentage: number;
  }>;
}

export interface CustomerStats {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  coffee_mood: string;
  created_at: string;
  total_orders: number;
  total_spent: number;
  total_reservations: number;
}
