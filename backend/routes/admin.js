const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const DB_PATH = path.join(__dirname, '../db.json');

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// All admin routes require authentication + admin role
router.use(authenticateToken, requireAdmin);

// ==========================================
// 1. DASHBOARD & STATISTICS
// ==========================================
router.get('/stats', (req, res) => {
  const db = readDB();
  const totalRevenue = db.orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const deliveredRevenue = db.orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingOrders = db.orders.filter(o => o.status === 'pending').length;
  const shippingOrders = db.orders.filter(o => o.status === 'shipping').length;
  const deliveredOrders = db.orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = db.orders.filter(o => o.status === 'cancelled').length;

  const lowStockProducts = (db.products || []).filter(p => Number(p.stock) <= 10);

  // Calculate 7-day revenue & order trends
  const last7Days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOrders = db.orders.filter(o => o.createdAt && o.createdAt.startsWith(dateStr));
    const dayRev = dayOrders.reduce((s, o) => s + (o.total || 0), 0);
    last7Days.push({
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      revenue: dayRev,
      orders: dayOrders.length
    });
  }

  const stats = {
    totalUsers: db.users.filter(u => u.role === 'user').length,
    totalAdmins: db.users.filter(u => u.role === 'admin').length,
    totalProducts: db.products.length,
    totalOrders: db.orders.length,
    totalRevenue,
    deliveredRevenue,
    pendingOrders,
    shippingOrders,
    deliveredOrders,
    cancelledOrders,
    lowStockCount: lowStockProducts.length,
    lowStockProducts: lowStockProducts.slice(0, 6),
    revenueChart: last7Days,
    recentOrders: db.orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)
      .map(order => {
        const user = db.users.find(u => u.id === order.userId);
        return {
          ...order,
          userName: user ? user.name : (order.userName || 'Khách vãng lai'),
          userEmail: user ? user.email : ''
        };
      }),
    recentUsers: db.users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map(({ password: _, ...u }) => u),
    topProducts: db.products
      .sort((a, b) => (Number(b.reviews) || 0) - (Number(a.reviews) || 0))
      .slice(0, 5)
  };

  res.json(stats);
});

// ==========================================
// 2. USER MANAGEMENT
// ==========================================
// GET /api/admin/users - List users with stats (order count, total spent)
router.get('/users', (req, res) => {
  const db = readDB();
  const { search, status, role } = req.query;

  let users = db.users.map(({ password: _, ...u }) => {
    const userOrders = (db.orders || []).filter(o => o.userId === u.id);
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return {
      ...u,
      orderCount: userOrders.length,
      totalSpent
    };
  });

  if (search) {
    const q = search.toLowerCase().trim();
    users = users.filter(u =>
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  }

  if (status) users = users.filter(u => u.status === status);
  if (role) users = users.filter(u => u.role === role);

  users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ users, total: users.length });
});

// GET /api/admin/users/:id - Get user with order history
router.get('/users/:id', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

  const { password: _, ...userWithoutPassword } = user;
  const orders = (db.orders || []).filter(o => o.userId === req.params.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ user: userWithoutPassword, orders });
});

// POST /api/admin/users - Admin create user / staff account
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, phone, address, role, status } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' });
    }

    const db = readDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: 'Email đã được đăng ký trong hệ thống' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: 'u_' + uuidv4().slice(0, 8),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=d4af37&color=fff`,
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      status: status || 'active',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: 'Tạo tài khoản thành công', user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
});

// PUT /api/admin/users/:id - Update user details or reset password
router.put('/users/:id', async (req, res) => {
  try {
    const db = readDB();
    const index = db.users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    // Don't allow admin to demote their own role
    if (req.params.id === req.user.id && req.body.role && req.body.role !== 'admin') {
      return res.status(400).json({ message: 'Bạn không thể tự hủy quyền Admin của chính mình' });
    }

    const { status, role, name, phone, address, email, newPassword } = req.body;

    if (email && email !== db.users[index].email) {
      const emailExist = db.users.find(u => u.id !== req.params.id && u.email.toLowerCase() === email.toLowerCase());
      if (emailExist) return res.status(409).json({ message: 'Email này đã thuộc về người dùng khác' });
      db.users[index].email = email.toLowerCase().trim();
    }

    if (status) db.users[index].status = status;
    if (role) db.users[index].role = role;
    if (name) {
      db.users[index].name = name.trim();
      db.users[index].avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=d4af37&color=fff`;
    }
    if (phone !== undefined) db.users[index].phone = phone.trim();
    if (address !== undefined) db.users[index].address = address.trim();

    if (newPassword && newPassword.trim()) {
      db.users[index].password = await bcrypt.hash(newPassword.trim(), 10);
    }

    writeDB(db);
    const { password: _, ...userWithoutPassword } = db.users[index];
    res.json({ message: 'Cập nhật thông tin thành công', user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', (req, res) => {
  const db = readDB();
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: 'Không thể xóa tài khoản của chính mình' });
  }
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

  db.users.splice(index, 1);
  writeDB(db);
  res.json({ message: 'Đã xóa người dùng thành công' });
});

// ==========================================
// 3. ORDER MANAGEMENT
// ==========================================
// GET /api/admin/orders - Get orders with search, status filter
router.get('/orders', (req, res) => {
  const db = readDB();
  const { status, search } = req.query;

  let orders = db.orders.map(order => {
    const user = db.users.find(u => u.id === order.userId);
    return {
      ...order,
      userName: user ? user.name : (order.userName || 'Khách vãng lai'),
      userEmail: user ? user.email : (order.userEmail || ''),
      userPhone: user ? user.phone : (order.phone || '')
    };
  });

  if (status) {
    orders = orders.filter(o => o.status === status);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    orders = orders.filter(o =>
      (o.id && o.id.toLowerCase().includes(q)) ||
      (o.userName && o.userName.toLowerCase().includes(q)) ||
      (o.userEmail && o.userEmail.toLowerCase().includes(q)) ||
      (o.phone && o.phone.includes(q)) ||
      (o.address && o.address.toLowerCase().includes(q))
    );
  }

  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ orders, total: orders.length });
});

// PUT /api/admin/orders/:id - Update order status, address, phone, notes
router.put('/orders/:id', (req, res) => {
  const db = readDB();
  const index = db.orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

  const { status, address, phone, notes, adminNotes, paymentMethod } = req.body;
  if (status) db.orders[index].status = status;
  if (address !== undefined) db.orders[index].address = address;
  if (phone !== undefined) db.orders[index].phone = phone;
  if (notes !== undefined) db.orders[index].notes = notes;
  if (adminNotes !== undefined) db.orders[index].adminNotes = adminNotes;
  if (paymentMethod !== undefined) db.orders[index].paymentMethod = paymentMethod;

  db.orders[index].updatedAt = new Date().toISOString();

  writeDB(db);
  res.json({ message: 'Cập nhật đơn hàng thành công', order: db.orders[index] });
});

// DELETE /api/admin/orders/:id - Delete order
router.delete('/orders/:id', (req, res) => {
  const db = readDB();
  const index = db.orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

  db.orders.splice(index, 1);
  writeDB(db);
  res.json({ message: 'Đã xóa đơn hàng thành công' });
});

// ==========================================
// 4. SYSTEM / STORE SETTINGS
// ==========================================
// GET /api/admin/settings
router.get('/settings', (req, res) => {
  const db = readDB();
  const settings = db.settings || {
    storeName: 'LUXE Fashion',
    hotline: '1900 8888',
    email: 'contact@fashion.com',
    address: '123 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    announcement: '✨ Miễn phí giao hàng toàn quốc đơn từ 2.000.000đ',
    shippingFee: 30000,
    freeShippingThreshold: 2000000,
    currency: 'VND'
  };
  res.json({ settings });
});

// PUT /api/admin/settings
router.put('/settings', (req, res) => {
  const db = readDB();
  db.settings = {
    ...(db.settings || {}),
    ...req.body
  };
  writeDB(db);
  res.json({ message: 'Đã lưu cấu hình hệ thống', settings: db.settings });
});

module.exports = router;
