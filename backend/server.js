const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('./models/User');
const NoteModel = require('./models/Note');
const MessageModel = require('./models/Message');
const OrderModel = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const CARTS_FILE = path.join(DATA_DIR, 'carts.json');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

app.use(cors()); // Allow all for simplicity in this setup
app.use(express.json());

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  if (!fs.existsSync(NOTES_FILE)) fs.writeFileSync(NOTES_FILE, JSON.stringify([]));
  if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
  if (!fs.existsSync(CARTS_FILE)) fs.writeFileSync(CARTS_FILE, JSON.stringify([]));
}

function readCarts() {
  try { return JSON.parse(fs.readFileSync(CARTS_FILE, 'utf8')) || []; } catch (e) { return []; }
}

function writeCarts(carts) { fs.writeFileSync(CARTS_FILE, JSON.stringify(carts, null, 2)); }

// If MONGODB_URI is provided, connect via mongoose
let mongoConnected = false;
async function tryConnectMongo() {
  const uri = process.env.MONGODB_URI || '';
  if (!uri) return;
  try {
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
    mongoConnected = true;
    console.log('Connected to MongoDB Atlas');
  } catch (e) {
    console.warn('MongoDB connection failed, falling back to file storage');
  }
}

function readNotes() {
  try { return JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8')) || []; } catch (e) { return []; }
}

function writeNotes(notes) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

function readMessages() {
  try { return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8')) || []; } catch (e) { return []; }
}

function writeMessages(msgs) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(msgs, null, 2));
}

// Auth middleware
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')) || [];
  } catch (e) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function findUserByEmail(email) {
  const users = readUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

async function createAdminIfMissing() {
  const users = readUsers();
  if (users.length === 0) {
    const pw = 'admin123';
    const hash = await bcrypt.hash(pw, 10);
    const admin = { id: uuidv4(), name: 'Administrator', email: 'admin@organicfruits.com', password: hash, role: 'admin' };
    const admin2 = { id: uuidv4(), name: 'Administrator', email: 'admin@example.com', password: hash, role: 'admin' };
    users.push(admin, admin2);
    writeUsers(users);
    console.log('Created default admin users: admin@organicfruits.com and admin@example.com (password=admin123)');
  } else {
    const admin = users.find(u => u.role === 'admin');
    const adminEmailExists = users.find(u => u.email === 'admin@example.com');
    const adminAltExists = users.find(u => u.email === 'admin@organicfruits.com');
    if (!admin) {
      const pw = 'admin123';
      const hash = await bcrypt.hash(pw, 10);
      const newAdmin = { id: uuidv4(), name: 'Administrator', email: 'admin@organicfruits.com', password: hash, role: 'admin' };
      users.push(newAdmin);
      console.log('Added admin user: email=admin@organicfruits.com password=admin123');
    }
    if (!adminEmailExists) {
      const pw = 'admin123';
      const hash = await bcrypt.hash(pw, 10);
      users.push({ id: uuidv4(), name: 'Administrator', email: 'admin@example.com', password: hash, role: 'admin' });
      console.log('Added admin user: email=admin@example.com password=admin123');
    }
    if (!adminAltExists) {
      // ensure admin@organicfruits.com exists (if not already added above)
      // nothing more to do because handled by admin check
    }
    writeUsers(users);
  }
}

// Helper: when using mongo, ensure admin user exists
async function createMongoAdminIfMissing() {
  if (!mongoConnected) return;
  const admin = await UserModel.findOne({ role: 'admin' }).exec();
  if (!admin) {
    const pw = 'admin123';
    const hash = await bcrypt.hash(pw, 10);
    await UserModel.create({ name: 'Administrator', email: 'admin@organicfruits.com', password: hash, role: 'admin' });
    await UserModel.create({ name: 'Administrator', email: 'admin@example.com', password: hash, role: 'admin' });
    console.log('Created admin users in MongoDB: admin@organicfruits.com and admin@example.com (password=admin123)');
  } else {
    // ensure both admin emails exist
    const adminA = await UserModel.findOne({ email: 'admin@organicfruits.com' }).exec();
    const adminB = await UserModel.findOne({ email: 'admin@example.com' }).exec();
    const pw = 'admin123';
    if (!adminA) {
      const hash = await bcrypt.hash(pw, 10);
      await UserModel.create({ name: 'Administrator', email: 'admin@organicfruits.com', password: hash, role: 'admin' });
      console.log('Added admin@organicfruits.com to MongoDB');
    }
    if (!adminB) {
      const hash = await bcrypt.hash(pw, 10);
      await UserModel.create({ name: 'Administrator', email: 'admin@example.com', password: hash, role: 'admin' });
      console.log('Added admin@example.com to MongoDB');
    }
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date().toISOString() });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
  // If connected to MongoDB, create user there
  if (mongoConnected) {
    const existing = await UserModel.findOne({ email: email.toLowerCase() }).exec();
    if (existing) return res.status(400).json({ error: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    const role = (email.toLowerCase() === 'admin@organicfruits.com') ? 'admin' : 'user';
    const created = await UserModel.create({ name, email: email.toLowerCase(), password: hash, role });
    const token = jwt.sign({ id: created._id.toString(), email: created.email, role: created.role }, JWT_SECRET, { expiresIn: '7d' });
    const safeUser = { id: created._id.toString(), name: created.name, email: created.email, role: created.role };
    return res.json({ token, user: safeUser });
  }

  const existing = findUserByEmail(email);
  if (existing) return res.status(400).json({ error: 'User already exists' });

  const hash = await bcrypt.hash(password, 10);
  const users = readUsers();
  const role = (email.toLowerCase() === 'admin@organicfruits.com' || users.length === 0) ? 'admin' : 'user';
  const user = { id: uuidv4(), name, email: email.toLowerCase(), password: hash, role };
  users.push(user);
  writeUsers(users);

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.json({ token, user: safeUser });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  if (mongoConnected) {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).exec();
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const safeUser = { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
    return res.json({ token, user: safeUser });
  }

  const user = findUserByEmail(email);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.json({ token, user: safeUser });
});

// Simple products stub to avoid 404s from frontend if used
app.get('/api/products', (req, res) => {
  // Try to read products from file-based data store first
  const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8')) || [];
      return res.json(products);
    }
  } catch (e) {
    console.warn('Failed to read products file, returning empty list');
  }

  // Fallback: empty list
  res.json([]);
});

// Notes endpoints (per-user)
app.get('/api/notes', authMiddleware, (req, res) => {
  if (mongoConnected) {
    return NoteModel.find({ userId: req.user.id }).then(d => res.json(d)).catch(() => res.json([]));
  }
  const notes = readNotes().filter(n => n.userId === req.user.id);
  res.json(notes);
});

app.post('/api/notes', authMiddleware, (req, res) => {
  const { title, items } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (mongoConnected) {
    return NoteModel.create({ userId: req.user.id, title, items: Array.isArray(items) ? items : [] }).then(n => res.json(n)).catch(e => res.status(500).json({ error: 'Save failed' }));
  }
  const notes = readNotes();
  const note = { id: uuidv4(), userId: req.user.id, title, items: Array.isArray(items) ? items : [], createdAt: new Date().toISOString() };
  notes.push(note);
  writeNotes(notes);
  res.json(note);
});

// Message to admin
app.post('/api/messages', authMiddleware, (req, res) => {
  const { subject, message } = req.body || {};
  if (!subject || !message) return res.status(400).json({ error: 'Subject and message are required' });
  if (mongoConnected) {
    return MessageModel.create({ userId: req.user.id, subject, message }).then(() => res.json({ ok: true })).catch(() => res.status(500).json({ error: 'Save failed' }));
  }
  const msgs = readMessages();
  const msg = { id: uuidv4(), userId: req.user.id, subject, message, createdAt: new Date().toISOString() };
  msgs.push(msg);
  writeMessages(msgs);
  res.json({ ok: true });
});

// Admin: list messages
app.get('/api/messages', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  if (mongoConnected) {
    return MessageModel.find().then(d => res.json(d)).catch(() => res.json([]));
  }
  const msgs = readMessages();
  res.json(msgs);
});

// Orders
app.post('/api/orders', authMiddleware, (req, res) => {
  const { items, total } = req.body || {};
  if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Items required' });
  if (mongoConnected) {
    return OrderModel.create({ userId: req.user.id, items, total }).then(o => res.json(o)).catch(() => res.status(500).json({ error: 'Save failed' }));
  }
  // file fallback
  const ordersFile = path.join(DATA_DIR, 'orders.json');
  let orders = [];
  try { orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8')) || []; } catch (e) { }
  const order = { id: uuidv4(), orderNumber: `ORD-${Date.now()}`, userId: req.user.id, items, total, status: 'pending', createdAt: new Date().toISOString() };
  orders.push(order);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.json(order);
});

// Cart endpoints
app.get('/api/cart', authMiddleware, (req, res) => {
  if (mongoConnected) {
    // not implemented: using file fallback for carts
  }
  const carts = readCarts();
  const cart = carts.find(c => c.userId === req.user.id) || { items: [], total: 0 };
  res.json(cart);
});

app.post('/api/cart/update', authMiddleware, (req, res) => {
  const cart = req.body || { items: [], total: 0 };
  if (mongoConnected) {
    // not implemented: using file fallback for carts
  }
  const carts = readCarts();
  const idx = carts.findIndex(c => c.userId === req.user.id);
  const save = { userId: req.user.id, items: cart.items || [], total: cart.total || 0, updatedAt: new Date().toISOString() };
  if (idx === -1) carts.push(save); else carts[idx] = save;
  writeCarts(carts);
  res.json({ ok: true });
});

app.get('/api/orders', authMiddleware, (req, res) => {
  if (mongoConnected) {
    return OrderModel.find({ userId: req.user.id }).then(d => res.json(d)).catch(() => res.json([]));
  }
  const ordersFile = path.join(DATA_DIR, 'orders.json');
  try { const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8')) || []; return res.json(orders.filter(o => o.userId === req.user.id)); } catch (e) { return res.json([]); }
});

// Final exports and startup logic
if (require.main === module) {
  (async function start() {
    try {
      ensureDataDir();
      await createAdminIfMissing();
      await tryConnectMongo();
      await createMongoAdminIfMissing();

      app.listen(PORT, () => {
        console.log(`Backend started on http://localhost:${PORT}/api`);
        console.log(`Server running on port ${PORT}`);
      });
    } catch (err) {
      console.error('Failed to start backend:', err);
      process.exit(1);
    }
  })();
}

module.exports = app;
