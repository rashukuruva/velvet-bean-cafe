import { Router, Response } from 'express';
import { getDb } from '../../database/db.ts';
import { authenticateToken, optionalAuth, requireAdmin, AuthRequest } from '../auth.ts';

const router = Router();

// Place a new order
router.post('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      items,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      order_type,
      payment_method,
      coupon_code,
      notes
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    if (!customer_name) {
      return res.status(400).json({ error: 'Customer name is required.' });
    }

    const db = await getDb();

    // Calculate subtotal from items
    let subtotal = 0;
    for (const it of items) {
      subtotal += parseFloat(it.price) * parseInt(it.quantity, 10);
    }

    // Apply Coupon
    let discount = 0;
    if (coupon_code) {
      const code = String(coupon_code).toUpperCase().trim();
      if (code === 'COZYBEAN10') {
        discount = subtotal * 0.10; // 10% off
      } else if (code === 'FREESHIP') {
        discount = 2.50;
      } else if (code === 'FIRSTCUP') {
        discount = subtotal * 0.15; // 15% off
      }
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * 0.08 * 100) / 100; // 8% café tax
    const deliveryFee = order_type === 'Delivery' ? 2.50 : 0.00;
    const total_amount = Math.round((taxableAmount + tax + deliveryFee) * 100) / 100;

    const userId = req.user ? req.user.id : null;

    // Insert order
    const orderRes = await db.query<{ id: number }>(
      `INSERT INTO orders 
       (user_id, total_amount, subtotal, discount, tax, coupon_code, status, payment_status, payment_method, order_type, customer_name, customer_email, customer_phone, delivery_address, notes)
       VALUES ($1, $2, $3, $4, $5, $6, 'Pending', 'Paid', $7, $8, $9, $10, $11, $12, $13)
       RETURNING id`,
      [
        userId,
        total_amount,
        subtotal,
        discount,
        tax,
        coupon_code || '',
        payment_method || 'Credit Card',
        order_type || 'Delivery',
        customer_name,
        customer_email || (req.user ? req.user.email : ''),
        customer_phone || '',
        delivery_address || '',
        notes || ''
      ]
    );

    const orderId = orderRes.rows[0].id;

    // Insert order items
    for (const it of items) {
      await db.query(
        `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, it.menu_item_id || null, it.name || it.item_name, it.quantity, it.price]
      );
    }

    res.status(201).json({
      message: 'Your coffee is on its way! ☕🤎',
      order: {
        id: orderId,
        total_amount,
        subtotal,
        discount,
        tax,
        status: 'Pending',
        order_type,
        customer_name,
        created_at: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

// GET current user orders
router.get('/my', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const ordersResult = await db.query(
      `SELECT * FROM orders 
       WHERE user_id = $1 OR customer_email = $2
       ORDER BY created_at DESC`,
      [req.user!.id, req.user!.email]
    );

    const orders = ordersResult.rows as any[];

    for (const order of orders) {
      const itemsResult = await db.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    res.json(orders);
  } catch (err: any) {
    console.error('Fetch my orders error:', err);
    res.status(500).json({ error: 'Failed to fetch your orders.' });
  }
});

// GET all orders (admin)
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const ordersResult = await db.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );
    const orders = ordersResult.rows as any[];

    for (const order of orders) {
      const itemsResult = await db.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    res.json(orders);
  } catch (err: any) {
    console.error('Admin fetch orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// PATCH update order status (admin)
// Pending -> Confirmed -> Preparing -> Ready -> Completed, or Cancelled
router.patch('/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status value.' });
    }

    const db = await getDb();
    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

export default router;
