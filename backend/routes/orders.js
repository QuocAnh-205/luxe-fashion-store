const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const DB_PATH = path.join(__dirname, '../db.json');

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// POST /api/orders - Create new order
router.post('/', authenticateToken, (req, res) => {
  const db = readDB();
  const { items, address, phone } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Order items are required' });
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const newOrder = {
    id: uuidv4(),
    userId: req.user.id,
    items,
    total,
    status: 'pending',
    address: address || '',
    phone: phone || '',
    createdAt: new Date().toISOString()
  };

  db.orders.push(newOrder);
  writeDB(db);

  res.status(201).json({ message: 'Order placed successfully', order: newOrder });
});

// GET /api/orders/my - Get current user orders
router.get('/my', authenticateToken, (req, res) => {
  const db = readDB();
  const orders = db.orders
    .filter(o => o.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ orders });
});

// GET /api/orders/:id
router.get('/:id', authenticateToken, (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  res.json({ order });
});

module.exports = router;
