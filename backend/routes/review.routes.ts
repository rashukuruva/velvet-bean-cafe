import { Router, Request, Response } from 'express';
import { getDb } from '../../database/db.ts';
import { authenticateToken, AuthRequest } from '../auth.ts';

const router = Router();

// GET all customer reviews
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = await db.query(
      `SELECT r.*, m.name as menu_item_name 
       FROM reviews r
       LEFT JOIN menu_items m ON r.menu_item_id = m.id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// POST submit review
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment, menu_item_id } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and review comment are required.' });
    }

    const db = await getDb();
    const userRes = await db.query<{ name: string; avatar_url: string }>(
      'SELECT name, avatar_url FROM users WHERE id = $1',
      [req.user!.id]
    );
    const user = userRes.rows[0];

    const result = await db.query(
      `INSERT INTO reviews (user_id, user_name, menu_item_id, rating, comment, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.user!.id,
        user?.name || req.user!.name,
        menu_item_id || null,
        Math.min(5, Math.max(1, parseInt(rating, 10))),
        comment,
        user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      ]
    );

    res.status(201).json({
      message: 'Thank you for sharing your coffee love! ☕✨',
      review: result.rows[0]
    });
  } catch (err: any) {
    console.error('Submit review error:', err);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

export default router;
