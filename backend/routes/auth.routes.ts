import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../../database/db.ts';
import { generateToken, authenticateToken, AuthRequest } from '../auth.ts';

const router = Router();

// Register new user
router.post('/register', async (req, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const db = await getDb();
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query<{ id: number; name: string; email: string; role: 'customer' | 'admin'; phone: string; coffee_mood: string }>(
      `INSERT INTO users (name, email, password_hash, phone, role, coffee_mood)
       VALUES ($1, $2, $3, $4, 'customer', 'Cozy Vanilla Bean Latte 🌾')
       RETURNING id, name, email, role, phone, coffee_mood`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, phone || '']
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Registration successful! Welcome to Velvet Bean Café ☕',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        coffee_mood: newUser.coffee_mood
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error while registering account.' });
  }
});

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = await getDb();
    const result = await db.query<{
      id: number;
      name: string;
      email: string;
      password_hash: string;
      role: 'customer' | 'admin';
      phone: string;
      avatar_url: string;
      coffee_mood: string;
    }>('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    res.json({
      message: `Welcome back, ${user.name}! ☕`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url,
        coffee_mood: user.coffee_mood
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Current User Profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const result = await db.query<{
      id: number;
      name: string;
      email: string;
      phone: string;
      role: 'customer' | 'admin';
      avatar_url: string;
      coffee_mood: string;
      created_at: string;
    }>('SELECT id, name, email, phone, role, avatar_url, coffee_mood, created_at FROM users WHERE id = $1', [
      req.user!.id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = result.rows[0];

    // Counts
    const ordersCount = await db.query<{ count: string }>('SELECT count(*) as count FROM orders WHERE user_id = $1', [user.id]);
    const resCount = await db.query<{ count: string }>('SELECT count(*) as count FROM reservations WHERE user_id = $1', [user.id]);

    res.json({
      ...user,
      total_orders: parseInt(ordersCount.rows[0]?.count || '0', 10),
      total_reservations: parseInt(resCount.rows[0]?.count || '0', 10)
    });
  } catch (err: any) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// Update Coffee Mood
router.put('/me/mood', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { mood } = req.body;
    if (!mood) {
      return res.status(400).json({ error: 'Mood is required.' });
    }

    const db = await getDb();
    await db.query('UPDATE users SET coffee_mood = $1 WHERE id = $2', [mood, req.user!.id]);
    res.json({ message: 'Coffee mood updated successfully! ☕', mood });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update mood.' });
  }
});

// Forgot Password (simulated recovery)
router.post('/forgot-password', async (req, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  res.json({
    message: `Password reset instructions sent to ${email}. If an account exists, you will receive a recovery link shortly.`
  });
});

export default router;
