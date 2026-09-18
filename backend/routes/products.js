const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const DB_PATH = path.join(__dirname, '../db.json');

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// GET /api/products - Get all products
router.get('/', (req, res) => {
  const db = readDB();
  let products = [...db.products];

  const { category, search, minPrice, maxPrice, sort, featured, newArrival } = req.query;

  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  if (minPrice) products = products.filter(p => p.price >= Number(minPrice));
  if (maxPrice) products = products.filter(p => p.price <= Number(maxPrice));
  if (featured === 'true') products = products.filter(p => p.featured);
  if (newArrival === 'true') products = products.filter(p => p.newArrival);

  if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
  else if (sort === 'newest') products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ products, total: products.length });
});

// GET /api/products/categories
router.get('/categories', (req, res) => {
  const db = readDB();
  const categories = [...new Set(db.products.map(p => p.category))];
  res.json({ categories });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const db = readDB();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ product });
});

// POST /api/products - Admin only
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  const newProduct = {
    id: uuidv4(),
    ...req.body,
    rating: 0,
    reviews: 0,
    createdAt: new Date().toISOString()
  };
  db.products.push(newProduct);
  writeDB(db);
  res.status(201).json({ message: 'Product created', product: newProduct });
});

// PUT /api/products/:id - Admin only
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });
  db.products[index] = { ...db.products[index], ...req.body, id: req.params.id };
  writeDB(db);
  res.json({ message: 'Product updated', product: db.products[index] });
});

// DELETE /api/products/:id - Admin only
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });
  db.products.splice(index, 1);
  writeDB(db);
  res.json({ message: 'Product deleted' });
});

module.exports = router;
