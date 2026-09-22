import { Router, Request, Response } from 'express';
import { getDb } from '../../database/db.ts';
import { authenticateToken, optionalAuth, requireAdmin, AuthRequest } from '../auth.ts';

const router = Router();

// GET time slots availability for a date
router.get('/slots', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date query param is required.' });
    }

    const db = await getDb();
    const result = await db.query<{ reservation_time: string; count: string }>(
      `SELECT reservation_time, count(*) as count 
       FROM reservations 
       WHERE reservation_date = $1 AND status != 'Cancelled'
       GROUP BY reservation_time`,
      [String(date)]
    );

    const bookedMap = new Map<string, number>();
    for (const r of result.rows) {
      bookedMap.set(r.reservation_time, parseInt(r.count, 10));
    }

    const allSlots = [
      '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
      '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
      '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
    ];

    const slots = allSlots.map((time) => {
      const bookedCount = bookedMap.get(time) || 0;
      const maxTables = 5; // 5 tables available per slot
      return {
        time,
        available: bookedCount < maxTables,
        remainingTables: Math.max(0, maxTables - bookedCount)
      };
    });

    res.json(slots);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch slots.' });
  }
});

// Book a table reservation
router.post('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      reservation_date,
      reservation_time,
      guests,
      seating_type,
      special_request
    } = req.body;

    if (!customer_name || !customer_email || !reservation_date || !reservation_time || !guests) {
      return res.status(400).json({ error: 'Please provide name, email, date, time, and guest count.' });
    }

    const db = await getDb();
    const userId = req.user ? req.user.id : null;

    const result = await db.query(
      `INSERT INTO reservations 
       (user_id, customer_name, customer_email, customer_phone, reservation_date, reservation_time, guests, seating_type, special_request, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Confirmed')
       RETURNING *`,
      [
        userId,
        customer_name,
        customer_email,
        customer_phone || '',
        reservation_date,
        reservation_time,
        parseInt(guests, 10),
        seating_type || 'Cozy Indoor Lounge',
        special_request || ''
      ]
    );

    res.status(201).json({
      message: 'Table reserved successfully! We look forward to hosting you ☕',
      reservation: result.rows[0]
    });
  } catch (err: any) {
    console.error('Reservation error:', err);
    res.status(500).json({ error: 'Failed to book table reservation.' });
  }
});

// GET current user reservations
router.get('/my', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const result = await db.query(
      `SELECT * FROM reservations 
       WHERE user_id = $1 OR customer_email = $2
       ORDER BY reservation_date DESC, reservation_time DESC`,
      [req.user!.id, req.user!.email]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch your reservations.' });
  }
});

// GET all reservations (admin)
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const result = await db.query(
      'SELECT * FROM reservations ORDER BY reservation_date DESC, reservation_time DESC'
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch reservations.' });
  }
});

// PATCH update reservation status (admin approve/reject)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const valid = ['Confirmed', 'Pending', 'Rejected', 'Cancelled', 'Completed'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid reservation status.' });
    }

    const db = await getDb();
    const result = await db.query(
      'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update reservation status.' });
  }
});

export default router;
