import { Router, Request, Response } from 'express';
import { getDb } from '../../database/db.ts';
import { authenticateToken, requireAdmin, AuthRequest } from '../auth.ts';

const router = Router();

// GET all menu items
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, availableOnly } = req.query;
    const db = await getDb();

    let query = 'SELECT * FROM menu_items WHERE 1=1';
    const params: any[] = [];

    if (availableOnly === 'true') {
      query += ' AND availability = true';
    }

    if (category && category !== 'All') {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${String(search).toLowerCase()}%`);
      query += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`;
    }

    query += ' ORDER BY id ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Fetch menu error:', err);
    res.status(500).json({ error: 'Failed to fetch menu items.' });
  }
});

// GET single item
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = await db.query('SELECT * FROM menu_items WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch menu item.' });
  }
});

// POST add new item (admin)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, description, price, image_url, rating, is_veg, availability, prep_time, calories, badge } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required.' });
    }

    const db = await getDb();
    const result = await db.query(
      `INSERT INTO menu_items (name, category, description, price, image_url, rating, is_veg, availability, prep_time, calories, badge)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        name,
        category,
        description || '',
        parseFloat(price),
        image_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
        rating ? parseFloat(rating) : 4.8,
        is_veg !== undefined ? Boolean(is_veg) : true,
        availability !== undefined ? Boolean(availability) : true,
        prep_time || '5 mins',
        calories ? parseInt(calories, 10) : 180,
        badge || ''
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Create menu item error:', err);
    res.status(500).json({ error: 'Failed to add menu item.' });
  }
});

// PUT update menu item (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, description, price, image_url, rating, is_veg, availability, prep_time, calories, badge } = req.body;
    const db = await getDb();

    const result = await db.query(
      `UPDATE menu_items
       SET name = $1, category = $2, description = $3, price = $4, image_url = $5,
           rating = $6, is_veg = $7, availability = $8, prep_time = $9, calories = $10, badge = $11
       WHERE id = $12
       RETURNING *`,
      [
        name,
        category,
        description,
        parseFloat(price),
        image_url,
        rating ? parseFloat(rating) : 4.8,
        Boolean(is_veg),
        Boolean(availability),
        prep_time,
        parseInt(calories || '180', 10),
        badge,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Update menu error:', err);
    res.status(500).json({ error: 'Failed to update menu item.' });
  }
});

// PATCH toggle availability (admin)
router.patch('/:id/toggle', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const result = await db.query(
      'UPDATE menu_items SET availability = NOT availability WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle availability.' });
  }
});

// DELETE menu item (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const result = await db.query('DELETE FROM menu_items WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }

    res.json({ message: 'Menu item deleted successfully.' });
  } catch (err: any) {
    console.error('Delete menu item error:', err);
    res.status(500).json({ error: 'Failed to delete menu item.' });
  }
});

export default router;
