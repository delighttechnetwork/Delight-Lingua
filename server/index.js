const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
const dotenv = require('dotenv');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'a_very_secure_random_secret_key';
=======
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
>>>>>>> main

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// Database setup
let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

// In-memory fallback if no DB
const memoryDb = {
  users: [],
  history: []
};

// Create tables if they don't exist
const initDb = async () => {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        source_text TEXT NOT NULL,
        translated_text TEXT NOT NULL,
        source_lang TEXT NOT NULL,
        target_lang TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Database initialization failed:', err);
    pool = null; // Fallback to memory
  }
};

initDb();

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Mock translation function
const mockTranslate = async (text, source, target) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return `[${target}] ${text}`;
};

// Routes
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let user;
    if (pool) {
      const result = await pool.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
        [email, hashedPassword]
      );
      user = result.rows[0];
    } else {
      if (memoryDb.users.find(u => u.email === email)) throw { code: '23505' };
      user = { id: memoryDb.users.length + 1, email };
      memoryDb.users.push({ ...user, password: hashedPassword });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user;
    if (pool) {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      user = result.rows[0];
    } else {
      user = memoryDb.users.find(u => u.email === email);
    }

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/translate', async (req, res) => {
  const { text, sourceLang, targetLang } = req.body;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (e) {}
  }

  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Text and target language are required' });
  }

  try {
    const translatedText = await mockTranslate(text, sourceLang, targetLang);

    if (userId) {
      if (pool) {
        await pool.query(
          'INSERT INTO history (user_id, source_text, translated_text, source_lang, target_lang) VALUES ($1, $2, $3, $4, $5)',
          [userId, text, translatedText, sourceLang || 'auto', targetLang]
        );
      } else {
        memoryDb.history.push({
          id: memoryDb.history.length + 1,
          userId,
          sourceText: text,
          translatedText,
          sourceLang: sourceLang || 'auto',
          targetLang,
          createdAt: new Date()
        });
      }
    }

    res.json({
      translatedText,
      sourceLang: sourceLang || 'auto-detected',
      targetLang
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    if (pool) {
      const result = await pool.query(
        'SELECT id, source_text as "sourceText", translated_text as "translatedText", source_lang as "sourceLang", target_lang as "targetLang", created_at as "createdAt" FROM history WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );
      res.json(result.rows);
    } else {
      const history = memoryDb.history
        .filter(h => h.userId === req.user.id)
        .map(h => ({
          id: h.id,
          sourceText: h.sourceText,
          translatedText: h.translatedText,
          sourceLang: h.sourceLang,
          targetLang: h.targetLang,
          createdAt: h.createdAt
        }))
        .reverse();
      res.json(history);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.delete('/api/history/:id', authenticateToken, async (req, res) => {
  try {
    if (pool) {
      await pool.query('DELETE FROM history WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    } else {
      const index = memoryDb.history.findIndex(h => h.id === parseInt(req.params.id) && h.userId === req.user.id);
      if (index !== -1) memoryDb.history.splice(index, 1);
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
=======
app.get('/', (req, res) => {
  res.send('Delight Lingua API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
>>>>>>> main
});
