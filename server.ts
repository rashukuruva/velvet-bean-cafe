import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getDb } from './database/db.ts';

import authRouter from './backend/routes/auth.routes.ts';
import menuRouter from './backend/routes/menu.routes.ts';
import orderRouter from './backend/routes/order.routes.ts';
import reservationRouter from './backend/routes/reservation.routes.ts';
import reviewRouter from './backend/routes/review.routes.ts';
import adminRouter from './backend/routes/admin.routes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize database schema and seeds on startup
  try {
    await getDb();
    console.log('PostgreSQL database ready.');
  } catch (err) {
    console.error('Database startup initialization error:', err);
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', cafe: 'Velvet Bean Café', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/menu', menuRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/reservations', reservationRouter);
  app.use('/api/reviews', reviewRouter);
  app.use('/api/admin', adminRouter);

  // Vite middleware in dev mode / static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Velvet Bean Café server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
