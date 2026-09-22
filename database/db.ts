import { PGlite } from '@electric-sql/pglite';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// Store PostgreSQL data in local directory for persistence across restarts
const dbDir = path.resolve(process.cwd(), '.data/pglite_db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance: PGlite | null = null;

export async function getDb(): Promise<PGlite> {
  if (!dbInstance) {
    dbInstance = new PGlite(dbDir);
    await initSchemaAndSeeds(dbInstance);
  }
  return dbInstance;
}

async function initSchemaAndSeeds(db: PGlite) {
  // Create relational tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'customer',
      avatar_url TEXT,
      coffee_mood TEXT DEFAULT 'Cozy Caramel Latte',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      image_url TEXT NOT NULL,
      rating NUMERIC(3, 1) DEFAULT 4.8,
      is_veg BOOLEAN DEFAULT TRUE,
      availability BOOLEAN DEFAULT TRUE,
      prep_time TEXT DEFAULT '5-8 mins',
      calories INTEGER DEFAULT 180,
      badge TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      total_amount NUMERIC(10, 2) NOT NULL,
      subtotal NUMERIC(10, 2) NOT NULL,
      discount NUMERIC(10, 2) DEFAULT 0.00,
      tax NUMERIC(10, 2) DEFAULT 0.00,
      coupon_code TEXT,
      status TEXT DEFAULT 'Pending',
      payment_status TEXT DEFAULT 'Paid',
      payment_method TEXT DEFAULT 'Credit Card',
      order_type TEXT DEFAULT 'Delivery',
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT,
      delivery_address TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE SET NULL,
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price NUMERIC(10, 2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      reservation_date TEXT NOT NULL,
      reservation_time TEXT NOT NULL,
      guests INTEGER NOT NULL,
      seating_type TEXT NOT NULL,
      special_request TEXT,
      status TEXT DEFAULT 'Confirmed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      user_name TEXT NOT NULL,
      menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE SET NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate existing items and orders from USD to Indian Rupees (INR) if needed
  try {
    await db.exec(`
      UPDATE menu_items SET price = CASE
        WHEN name = 'Velvet Espresso' THEN 180.00
        WHEN name = 'Artisan Cappuccino' THEN 240.00
        WHEN name = 'Vanilla Bean Latte' THEN 280.00
        WHEN name = 'Café Mocha Royale' THEN 290.00
        WHEN name = 'Classic Americano' THEN 190.00
        WHEN name = 'Brown Sugar Cold Coffee' THEN 260.00
        WHEN name = 'Ceremonial Green Tea' THEN 210.00
        WHEN name = 'Spiced Masala Chai' THEN 160.00
        WHEN name = 'Honey Citrus Lemon Tea' THEN 190.00
        WHEN name = 'Truffle Chocolate Cake' THEN 290.00
        WHEN name = 'Salted Caramel Brownie' THEN 220.00
        WHEN name = 'New York Baked Cheesecake' THEN 310.00
        WHEN name = 'Choco-Chunk Butter Cookies' THEN 150.00
        WHEN name = 'French Butter Croissant' THEN 190.00
        WHEN name = 'Artisan Pesto Club Sandwich' THEN 320.00
        WHEN name = 'Herb & Cheese Garlic Bread' THEN 220.00
        WHEN name = 'Wild Blueberry Streusel Muffin' THEN 180.00
        ELSE ROUND(price * 50, 0)
      END WHERE price < 100;

      UPDATE order_items SET price = CASE
        WHEN item_name = 'Artisan Cappuccino' THEN 240.00
        WHEN item_name = 'French Butter Croissant' THEN 190.00
        WHEN item_name = 'Choco-Chunk Butter Cookies' THEN 150.00
        WHEN item_name = 'Vanilla Bean Latte' THEN 280.00
        WHEN item_name = 'Truffle Chocolate Cake' THEN 290.00
        WHEN item_name = 'Classic Americano' THEN 190.00
        WHEN item_name = 'Café Mocha Royale' THEN 290.00
        WHEN item_name = 'Artisan Pesto Club Sandwich' THEN 320.00
        WHEN item_name = 'Salted Caramel Brownie' THEN 220.00
        WHEN item_name = 'Brown Sugar Cold Coffee' THEN 260.00
        WHEN item_name = 'Wild Blueberry Streusel Muffin' THEN 180.00
        WHEN item_name = 'Spiced Masala Chai' THEN 160.00
        WHEN item_name = 'New York Baked Cheesecake' THEN 310.00
        WHEN item_name = 'Herb & Cheese Garlic Bread' THEN 220.00
        WHEN item_name = 'Velvet Espresso' THEN 180.00
        WHEN item_name = 'Ceremonial Green Tea' THEN 210.00
        ELSE ROUND(price * 50, 0)
      END WHERE price < 100;

      UPDATE orders SET 
        subtotal = subtotal * 50,
        discount = discount * 50,
        tax = tax * 50,
        total_amount = total_amount * 50
      WHERE total_amount < 100;
    `);
  } catch (migErr) {
    console.warn('Currency migration notice:', migErr);
  }

  // Check if users already seeded
  const userCount = await db.query<{ count: string }>('SELECT count(*) as count FROM users');
  if (parseInt(userCount.rows[0]?.count || '0', 10) === 0) {
    console.log('Seeding initial PostgreSQL database tables with aesthetic café sample data...');

    const adminHash = bcrypt.hashSync('admin123', 10);
    const customerHash = bcrypt.hashSync('coffee123', 10);

    // Seed Admin & Demo Customer
    await db.query(
      `INSERT INTO users (name, email, password_hash, phone, role, avatar_url, coffee_mood)
       VALUES 
       ($1, $2, $3, $4, $5, $6, $7),
       ($8, $9, $10, $11, $12, $13, $14)`,
      [
        'Eleanor Vance (Head Barista)',
        'admin@velvetbean.com',
        adminHash,
        '+1 (555) 234-5678',
        'admin',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        'Bold Triple Espresso ⚡',
        'Clara Higgins',
        'clara@example.com',
        customerHash,
        '+1 (555) 876-5432',
        'customer',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        'Oat Milk Vanilla Latte 🌾'
      ]
    );

    // Seed Menu Items
    const menuSeeds = [
      // ☕ Coffee
      {
        name: 'Velvet Espresso',
        category: 'Coffee',
        description: 'Rich, full-bodied double shot with notes of roasted hazelnut and dark chocolate crema.',
        price: 180.00,
        image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80',
        rating: 4.9,
        is_veg: true,
        prep_time: '3 mins',
        calories: 10,
        badge: "Barista's Choice"
      },
      {
        name: 'Artisan Cappuccino',
        category: 'Coffee',
        description: 'Equal parts velvety espresso, steamed whole milk, and microfoam dusted with organic cinnamon.',
        price: 240.00,
        image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
        rating: 4.9,
        is_veg: true,
        prep_time: '5 mins',
        calories: 140,
        badge: 'Best Seller'
      },
      {
        name: 'Vanilla Bean Latte',
        category: 'Coffee',
        description: 'Silky steamed milk infused with real Madagascar vanilla bean caviar over fresh espresso.',
        price: 280.00,
        image_url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
        rating: 4.8,
        is_veg: true,
        prep_time: '5 mins',
        calories: 190,
        badge: 'Popular'
      },
      {
        name: 'Café Mocha Royale',
        category: 'Coffee',
        description: 'Single-origin espresso blended with melted Belgian dark chocolate, topped with whipped cream.',
        price: 290.00,
        image_url: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=600&q=80',
        rating: 4.9,
        is_veg: true,
        prep_time: '6 mins',
        calories: 280,
        badge: 'Decadent'
      },
      {
        name: 'Classic Americano',
        category: 'Coffee',
        description: 'Double shot of signature roast gently diluted with hot water to reveal floral and citrus tones.',
        price: 190.00,
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
        rating: 4.7,
        is_veg: true,
        prep_time: '4 mins',
        calories: 15,
        badge: 'Classic'
      },
      {
        name: 'Brown Sugar Cold Coffee',
        category: 'Coffee',
        description: '18-hour cold brew shaken with brown sugar syrup, oat milk, and served over clear ice rocks.',
        price: 260.00,
        image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
        rating: 4.9,
        is_veg: true,
        prep_time: '4 mins',
        calories: 160,
        badge: 'Summer Favorite'
      },
      // 🍵 Tea
      {
        name: 'Ceremonial Green Tea',
        category: 'Tea',
        description: 'Hand-picked Japanese Sencha leaves offering a tranquil earthy flavor and uplifting antioxidants.',
        price: 210.00,
        image_url: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=600&q=80',
        rating: 4.8,
        is_veg: true,
        prep_time: '4 mins',
        calories: 5,
        badge: 'Organic'
      },
      {
        name: 'Spiced Masala Chai',
        category: 'Tea',
        description: 'Slow-simmered Assam black tea with crushed cardamom, fresh ginger, cinnamon stick, and creamy milk.',
        price: 160.00,
        image_url: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=600&q=80',
        rating: 5.0,
        is_veg: true,
        prep_time: '6 mins',
        calories: 150,
        badge: 'Cozy Pick'
      },
      {
        name: 'Honey Citrus Lemon Tea',
        category: 'Tea',
        description: 'Crisp black tea infused with cold-pressed Meyer lemons, fresh mint sprigs, and wild blossom honey.',
        price: 190.00,
        image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
        rating: 4.7,
        is_veg: true,
        prep_time: '4 mins',
        calories: 85,
        badge: 'Refreshing'
      },
      // 🍰 Desserts
      {
        name: 'Truffle Chocolate Cake',
        category: 'Desserts',
        description: 'Three tiers of moist devil’s food cake layered with rich Belgian dark chocolate ganache.',
        price: 290.00,
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
        rating: 5.0,
        is_veg: true,
        prep_time: 'Ready',
        calories: 420,
        badge: 'Chef Special'
      },
      {
        name: 'Salted Caramel Brownie',
        category: 'Desserts',
        description: 'Warm fudge brownie loaded with dark chocolate chunks and drizzled with sea salt caramel.',
        price: 220.00,
        image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
        rating: 4.9,
        is_veg: true,
        prep_time: 'Ready',
        calories: 340,
        badge: 'Warm & Fudgy'
      },
      {
        name: 'New York Baked Cheesecake',
        category: 'Desserts',
        description: 'Silky smooth cream cheese over a spiced graham cracker crust, finished with fresh berry coulis.',
        price: 310.00,
        image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
        rating: 4.8,
        is_veg: true,
        prep_time: 'Ready',
        calories: 380,
        badge: 'Classic'
      },
      {
        name: 'Choco-Chunk Butter Cookies',
        category: 'Desserts',
        description: 'Pair of giant bakery-style cookies crisp on the edges, soft and gooey in the center.',
        price: 150.00,
        image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
        rating: 4.8,
        is_veg: true,
        prep_time: 'Ready',
        calories: 290,
        badge: 'Fresh Baked'
      },
      // 🥐 Snacks
      {
        name: 'French Butter Croissant',
        category: 'Snacks',
        description: 'Golden, flaky pastry made with cultured French Normandy butter, folded 36 layers for airy honeycomb crumb.',
        price: 190.00,
        image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
        rating: 4.9,
        is_veg: true,
        prep_time: 'Warm (2m)',
        calories: 260,
        badge: 'Bakery Fresh'
      },
      {
        name: 'Artisan Pesto Club Sandwich',
        category: 'Snacks',
        description: 'Toasted sourdough stuffed with ripe heirloom tomatoes, buffalo mozzarella, wild rocket, and basil pesto.',
        price: 320.00,
        image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
        rating: 4.8,
        is_veg: true,
        prep_time: '8 mins',
        calories: 450,
        badge: 'Hearty'
      },
      {
        name: 'Herb & Cheese Garlic Bread',
        category: 'Snacks',
        description: 'Crusty rustic baguette toasted with confit garlic butter, chopped parsley, and melted fontina cheese.',
        price: 220.00,
        image_url: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=600&q=80',
        rating: 4.7,
        is_veg: true,
        prep_time: '6 mins',
        calories: 320,
        badge: 'Cheesy'
      },
      {
        name: 'Wild Blueberry Streusel Muffin',
        category: 'Snacks',
        description: 'Bursting with sweet Maine blueberries and crowned with a crunchy cinnamon butter crumble.',
        price: 180.00,
        image_url: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80',
        rating: 4.8,
        is_veg: true,
        prep_time: 'Ready',
        calories: 310,
        badge: 'Morning Treat'
      }
    ];

    for (const item of menuSeeds) {
      await db.query(
        `INSERT INTO menu_items (name, category, description, price, image_url, rating, is_veg, availability, prep_time, calories, badge)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [item.name, item.category, item.description, item.price, item.image_url, item.rating, item.is_veg, true, item.prep_time, item.calories, item.badge]
      );
    }

    // Seed Orders with varied dates for the charts (e.g. past week revenue & orders)
    const orderSeeds = [
      {
        user_id: 2,
        total: 820.00,
        subtotal: 820.00,
        discount: 82.00,
        tax: 40.00,
        status: 'Completed',
        type: 'Delivery',
        name: 'Clara Higgins',
        email: 'clara@example.com',
        phone: '+1 (555) 876-5432',
        address: '42 Maple Blossom Ave, Apt 3B',
        created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
        items: [
          { name: 'Artisan Cappuccino', qty: 2, price: 240.00 },
          { name: 'French Butter Croissant', qty: 1, price: 190.00 },
          { name: 'Choco-Chunk Butter Cookies', qty: 1, price: 150.00 }
        ]
      },
      {
        user_id: 2,
        total: 760.00,
        subtotal: 760.00,
        discount: 0,
        tax: 38.00,
        status: 'Completed',
        type: 'Pickup',
        name: 'Julian Hayes',
        email: 'julian@example.com',
        phone: '+1 (555) 321-9988',
        address: 'In-Store Pickup',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        items: [
          { name: 'Vanilla Bean Latte', qty: 1, price: 280.00 },
          { name: 'Truffle Chocolate Cake', qty: 1, price: 290.00 },
          { name: 'Classic Americano', qty: 1, price: 190.00 }
        ]
      },
      {
        user_id: 2,
        total: 1120.00,
        subtotal: 1120.00,
        discount: 112.00,
        tax: 55.00,
        status: 'Completed',
        type: 'Delivery',
        name: 'Marcus Sterling',
        email: 'marcus@example.com',
        phone: '+1 (555) 443-1122',
        address: '778 Pine Crest Road',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        items: [
          { name: 'Café Mocha Royale', qty: 2, price: 290.00 },
          { name: 'Artisan Pesto Club Sandwich', qty: 1, price: 320.00 },
          { name: 'Salted Caramel Brownie', qty: 1, price: 220.00 }
        ]
      },
      {
        user_id: 2,
        total: 700.00,
        subtotal: 700.00,
        discount: 0,
        tax: 35.00,
        status: 'Completed',
        type: 'Delivery',
        name: 'Sophie Lin',
        email: 'sophie.l@example.com',
        phone: '+1 (555) 667-8899',
        address: '12 Brookside Lane',
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        items: [
          { name: 'Brown Sugar Cold Coffee', qty: 2, price: 260.00 },
          { name: 'Wild Blueberry Streusel Muffin', qty: 1, price: 180.00 }
        ]
      },
      {
        user_id: 2,
        total: 910.00,
        subtotal: 890.00,
        discount: 50.00,
        tax: 45.00,
        status: 'Ready',
        type: 'Pickup',
        name: 'David Rossi',
        email: 'david.r@example.com',
        phone: '+1 (555) 778-9900',
        address: 'Curbside Express',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        items: [
          { name: 'Spiced Masala Chai', qty: 2, price: 160.00 },
          { name: 'New York Baked Cheesecake', qty: 1, price: 310.00 },
          { name: 'Herb & Cheese Garlic Bread', qty: 1, price: 220.00 }
        ]
      },
      {
        user_id: 2,
        total: 840.00,
        subtotal: 790.00,
        discount: 0,
        tax: 50.00,
        status: 'Preparing',
        type: 'Delivery',
        name: 'Clara Higgins',
        email: 'clara@example.com',
        phone: '+1 (555) 876-5432',
        address: '42 Maple Blossom Ave, Apt 3B',
        created_at: new Date().toISOString(),
        items: [
          { name: 'Velvet Espresso', qty: 2, price: 180.00 },
          { name: 'French Butter Croissant', qty: 2, price: 190.00 },
          { name: 'Ceremonial Green Tea', qty: 1, price: 210.00 }
        ]
      }
    ];

    for (const o of orderSeeds) {
      const orderRes = await db.query<{ id: number }>(
        `INSERT INTO orders (user_id, total_amount, subtotal, discount, tax, status, order_type, customer_name, customer_email, customer_phone, delivery_address, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [o.user_id, o.total, o.subtotal, o.discount, o.tax, o.status, o.type, o.name, o.email, o.phone, o.address, o.created_at]
      );
      const orderId = orderRes.rows[0].id;
      for (const item of o.items) {
        await db.query(
          `INSERT INTO order_items (order_id, item_name, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.name, item.qty, item.price]
        );
      }
    }

    // Seed Reservations
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

    await db.query(
      `INSERT INTO reservations (user_id, customer_name, customer_email, customer_phone, reservation_date, reservation_time, guests, seating_type, special_request, status)
       VALUES
       (2, 'Clara Higgins', 'clara@example.com', '+1 (555) 876-5432', $1, '10:30 AM', 2, 'Cozy Window Nook', 'Quiet corner for morning reading & latte.', 'Confirmed'),
       (2, 'Liam Montgomery', 'liam.m@example.com', '+1 (555) 234-9911', $2, '03:00 PM', 4, 'Sunlit Garden Patio', 'Celebrating a birthday, would love pastry recommendations!', 'Confirmed'),
       (2, 'Amara Patel', 'amara@example.com', '+1 (555) 998-1122', $3, '11:00 AM', 3, 'Velvet Indoor Lounge', 'High-chair requested for toddler.', 'Pending')`,
      [todayStr, tomorrow, dayAfter]
    );

    // Seed Reviews
    await db.query(
      `INSERT INTO reviews (user_name, rating, comment, avatar_url, created_at)
       VALUES
       ('Emma Watson', 5, 'The Vanilla Bean Latte here genuinely changed my mornings! The foam is silkier than any café in the city, and the ambiance feels like a warm hug.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', '2026-09-18 10:20:00'),
       ('Dr. Ethan Campbell', 5, 'Quiet atmosphere, incredible French butter croissants, and baristas who genuinely care about the craft of espresso extraction. A true 5-star haven.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', '2026-09-19 14:15:00'),
       ('Maya Rodriguez', 5, 'We booked a table on the sunlit patio for Sunday brunch. Ordering was seamless, the chocolate truffle cake was heavenly, and the cold brew was sublime!', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', '2026-09-20 16:45:00'),
       ('Oliver Thorne', 5, 'Hands down the best spiced masala chai and pesto sandwich. The warm wooden interior and gentle acoustics make it my favorite remote work café.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', '2026-09-21 11:30:00')`
    );

    console.log('PostgreSQL database seeded successfully!');
  }
}
