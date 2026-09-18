const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const DB_PATH = path.join(__dirname, '../db.json');

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// All admin routes require authentication + admin role
router.use(authenticateToken, requireAdmin);

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', (req, res) => {
  const db = readDB();
  const totalRevenue = db.orders.reduce((sum, o) => sum + o.total, 0);
  const stats = {
    totalUsers: db.users.filter(u => u.role === 'user').length,
    totalProducts: db.products.length,
    totalOrders: db.orders.length,
    totalRevenue,
    pendingOrders: db.orders.filter(o => o.status === 'pending').length,
    shippingOrders: db.orders.filter(o => o.status === 'shipping').length,
    deliveredOrders: db.orders.filter(o => o.status === 'delivered').length,
    recentOrders: db.orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => {
        const user = db.users.find(u => u.id === order.userId);
        return { ...order, userName: user ? user.name : 'Unknown' };
      }),
    recentUsers: db.users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(({ password: _, ...u }) => u),
    topProducts: db.products
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 5)
  };
  res.json(stats);
});

// GET /api/admin/users - Get all users
router.get('/users', (req, res) => {
  const db = readDB();
  const { search, status, role } = req.query;
  let users = db.users.map(({ password: _, ...u }) => u);

  if (search) {
    const q = search.toLowerCase();
    users = users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }
  if (status) users = users.filter(u => u.status === status);
  if (role) users = users.filter(u => u.role === role);

  users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ users, total: users.length });
});

// GET /api/admin/users/:id
router.get('/users/:id', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password: _, ...userWithoutPassword } = user;
  const orders = db.orders.filter(o => o.userId === req.params.id);
  res.json({ user: userWithoutPassword, orders });
});

// PUT /api/admin/users/:id - Update user status/role
router.put('/users/:id', (req, res) => {
  const db = readDB();
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'User not found' });

  // Don't allow admin to modify their own role
  if (req.params.id === req.user.id && req.body.role) {
    return res.status(400).json({ message: 'Cannot modify your own role' });
  }

  const { status, role, name, phone, address } = req.body;
  if (status) db.users[index].status = status;
  if (role) db.users[index].role = role;
  if (name) db.users[index].name = name;
  if (phone !== undefined) db.users[index].phone = phone;
  if (address !== undefined) db.users[index].address = address;

  writeDB(db);
  const { password: _, ...userWithoutPassword } = db.users[index];
  res.json({ message: 'User updated', user: userWithoutPassword });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', (req, res) => {
  const db = readDB();
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'User not found' });
  db.users.splice(index, 1);
  writeDB(db);
  res.json({ message: 'User deleted successfully' });
});

// GET /api/admin/orders - Get all orders
router.get('/orders', (req, res) => {
  const db = readDB();
  const { status } = req.query;
  let orders = db.orders.map(order => {
    const user = db.users.find(u => u.id === order.userId);
    return { ...order, userName: user ? user.name : 'Unknown', userEmail: user ? user.email : '' };
  });

  if (status) orders = orders.filter(o => o.status === status);
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ orders, total: orders.length });
});

// PUT /api/admin/orders/:id - Update order status
router.put('/orders/:id', (req, res) => {
  const db = readDB();
  const index = db.orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Order not found' });
  const { status } = req.body;
  if (status) db.orders[index].status = status;
  writeDB(db);
  res.json({ message: 'Order updated', order: db.orders[index] });
});

module.exports = router;
