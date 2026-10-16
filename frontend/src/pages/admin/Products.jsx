import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './Admin.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

const emptyProduct = {
  name: '',
  category: '',
  price: '',
  originalPrice: '',
  description: '',
  sizes: 'S, M, L, XL',
  colors: 'Black, White',
  stock: 20,
  images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=80'],
  featured: false,
  newArrival: true
};

const CATEGORIES = ['Áo', 'Váy', 'Đầm', 'Quần', 'Set', 'Phụ kiện', 'Áo khoác'];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [toast, setToast] = useState('');

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterCategory) params.set('category', filterCategory);

      const res = await axios.get(`/api/products?${params.toString()}`);
      let list = res.data.products || [];

      if (filterStock === 'out') {
        list = list.filter(p => Number(p.stock) === 0);
      } else if (filterStock === 'low') {
        list = list.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 10);
      } else if (filterStock === 'in') {
        list = list.filter(p => Number(p.stock) > 10);
      }

      setProducts(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, filterCategory, filterStock]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(''), 3500);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyProduct);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      ...product,
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors || '',
      images: product.images && product.images.length > 0 ? product.images : [''],
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      stock: product.stock !== undefined ? product.stock : 10
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : Number(form.price),
        stock: Number(form.stock) || 0,
        sizes: typeof form.sizes === 'string' ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : form.sizes,
        colors: typeof form.colors === 'string' ? form.colors.split(',').map(s => s.trim()).filter(Boolean) : form.colors,
        images: Array.isArray(form.images) ? form.images.filter(Boolean) : [form.images]
      };

      if (editing) {
        await axios.put(`/api/products/${editing.id}`, data);
        showToast(`Đã cập nhật sản phẩm "${data.name}"`);
      } else {
        await axios.post('/api/products', data);
        showToast(`Đã thêm sản phẩm mới "${data.name}"`);
      }
      setShowModal(false);
      fetchProducts();
    } catch (e) {
      showToast('Có lỗi xảy ra khi lưu sản phẩm', 'error');
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Xác nhận xóa vĩnh viễn sản phẩm "${product.name}"?`)) return;
    try {
      await axios.delete(`/api/products/${product.id}`);
      showToast('Đã xóa sản phẩm khỏi kho');
      fetchProducts();
    } catch (err) {
      showToast('Không thể xóa sản phẩm', 'error');
    }
  };

  // Metrics
  const lowStockCount = products.filter(p => Number(p.stock) <= 10).length;
  const totalStockUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const totalStockValue = products.reduce((sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.price) || 0)), 0);

  return (
    <AdminLayout>
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>
              {toast.type === 'success' ? <i className="fa-solid fa-circle-check"></i> : <i className="fa-solid fa-triangle-exclamation"></i>}
              {' '}{toast.msg}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-page-title">Quản Lý Kho Hàng & Sản Phẩm</h1>
          <p className="admin-page-subtitle">Thêm mới, điều chỉnh giá, kiểm soát lượng hàng tồn kho và gắn nhãn nổi bật</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-product-btn">
          <i className="fa-solid fa-plus"></i> + Thêm Sản Phẩm Mới
        </button>
      </div>

      <div className="admin-content">
        {/* KPI Mini Cards */}
        <div className="stats-grid" style={{ marginBottom: 20, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card" style={{ '--stat-color': 'var(--gold)', padding: 18 }}>
            <div className="stat-label">Tổng Mẫu Sản Phẩm</div>
            <div className="stat-value" style={{ fontSize: 24 }}>{products.length}</div>
            <div className="stat-change" style={{ color: 'var(--gold)' }}>{CATEGORIES.length} danh mục</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': '#38bdf8', padding: 18 }}>
            <div className="stat-label">Tổng Số Lượng Tồn Kho</div>
            <div className="stat-value" style={{ fontSize: 24, color: '#38bdf8' }}>{totalStockUnits}</div>
            <div className="stat-change" style={{ color: '#38bdf8' }}>Sản phẩm có sẵn</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': 'var(--success)', padding: 18 }}>
            <div className="stat-label">Ước Tính Giá Trị Kho</div>
            <div className="stat-value" style={{ fontSize: 22, color: 'var(--success)' }}>{formatPrice(totalStockValue)}</div>
            <div className="stat-change" style={{ color: 'var(--success)' }}>Vốn lưu kho</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': lowStockCount > 0 ? 'var(--error)' : 'var(--success)', padding: 18 }}>
            <div className="stat-label">Cảnh Báo Hết Hàng</div>
            <div className="stat-value" style={{ fontSize: 24, color: lowStockCount > 0 ? 'var(--error)' : 'var(--success)' }}>{lowStockCount}</div>
            <div className="stat-change" style={{ color: lowStockCount > 0 ? 'var(--error)' : 'var(--success)' }}>
              {lowStockCount > 0 ? 'Tồn kho <= 10 chiếc' : 'Kho hàng an toàn'}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="admin-table-wrapper" style={{ marginBottom: 20 }}>
          <div style={{ padding: '14px 20px', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 280, flexWrap: 'wrap' }}>
              <div className="admin-search" style={{ flex: 1, minWidth: 240 }}>
                <span><i className="fa-solid fa-magnifying-glass"></i></span>
                <input
                  placeholder="Tìm theo tên sản phẩm, danh mục..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  id="product-search"
                />
              </div>

              <select
                className="form-input"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                style={{ width: 'auto', padding: '10px 14px' }}
              >
                <option value="">Tất cả danh mục</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                className="form-input"
                value={filterStock}
                onChange={e => setFilterStock(e.target.value)}
                style={{ width: 'auto', padding: '10px 14px' }}
              >
                <option value="">Tất cả tình trạng kho</option>
                <option value="in">Còn nhiều hàng (&gt; 10)</option>
                <option value="low">Sắp hết hàng (&le; 10)</option>
                <option value="out">Đã hết hàng (= 0)</option>
              </select>
            </div>

            {(search || filterCategory || filterStock) && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setSearch(''); setFilterCategory(''); setFilterStock(''); }}
              >
                <i className="fa-solid fa-xmark"></i> Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="admin-table-wrapper">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá niêm yết</th>
                  <th>Giá khuyến mãi</th>
                  <th>Tồn kho</th>
                  <th>Đánh giá</th>
                  <th>Gắn nhãn</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>
                      <div className="spinner" style={{ margin: '0 auto' }} />
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      <i className="fa-solid fa-box-open" style={{ fontSize: 32, marginBottom: 8, display: 'block', opacity: 0.5 }}></i>
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                ) : products.map(p => {
                  const stockNum = Number(p.stock) || 0;
                  const stockBadgeClass = stockNum === 0 ? 'badge-red' : stockNum <= 10 ? 'badge-gold' : 'badge-green';
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <img
                            src={p.images?.[0]}
                            alt={p.name}
                            style={{ width: 48, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                          />
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{p.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>ID: #{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-gray">{p.category}</span></td>
                      <td style={{ color: 'var(--text-muted)', textDecoration: p.originalPrice > p.price ? 'line-through' : 'none' }}>
                        {formatPrice(p.originalPrice || p.price)}
                      </td>
                      <td style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 14 }}>
                        {formatPrice(p.price)}
                      </td>
                      <td>
                        <span className={`badge ${stockBadgeClass}`} style={{ fontWeight: 700 }}>
                          {stockNum === 0 ? 'Hết hàng' : `${stockNum} chiếc`}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 600 }}>
                          ★ {p.rating || '5.0'}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>({p.reviews || 0})</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {p.featured && <span className="badge badge-gold" title="Sản phẩm nổi bật">Hot</span>}
                          {p.newArrival && <span className="badge badge-blue" title="Hàng mới về">Mới</span>}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="action-btn btn btn-ghost btn-sm"
                            onClick={() => openEdit(p)}
                            id={`edit-product-${p.id}`}
                            title="Sửa thông tin"
                          >
                            <i className="fa-solid fa-pen"></i> Sửa
                          </button>
                          <button
                            className="action-btn btn btn-danger btn-sm"
                            onClick={() => handleDelete(p)}
                            id={`delete-product-${p.id}`}
                            title="Xóa sản phẩm"
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20 }}>
                {editing ? <><i className="fa-solid fa-pen" style={{ color: 'var(--gold)' }}></i> Chỉnh Sửa Sản Phẩm</> : <><i className="fa-solid fa-plus" style={{ color: 'var(--gold)' }}></i> Thêm Sản Phẩm Mới</>}
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} id="product-form">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Tên sản phẩm *</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="VD: Áo Khoác Dạ Luxury Mùa Thu"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Danh mục *</label>
                  <select
                    className="form-input"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Giá bán thực tế (VNĐ) *</label>
                  <input
                    className="form-input"
                    type="number"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    required
                    placeholder="2200000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá gốc niêm yết (VNĐ)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={form.originalPrice}
                    onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                    placeholder="2600000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả sản phẩm</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả chất liệu cao cấp, đường may tinh xảo, phong cách phối đồ..."
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Kích thước (Size - cách nhau dấu phẩy)</label>
                  <input
                    className="form-input"
                    value={form.sizes}
                    onChange={e => setForm({ ...form, sizes: e.target.value })}
                    placeholder="S, M, L, XL"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Màu sắc (cách nhau dấu phẩy)</label>
                  <input
                    className="form-input"
                    value={form.colors}
                    onChange={e => setForm({ ...form, colors: e.target.value })}
                    placeholder="Black, White, Beige"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Số lượng trong kho (Chiếc) *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">URL Ảnh đại diện sản phẩm *</label>
                  <input
                    className="form-input"
                    value={form.images?.[0] || ''}
                    onChange={e => setForm({ ...form, images: [e.target.value] })}
                    placeholder="https://images.unsplash.com/..."
                    required
                  />
                </div>
              </div>

              {/* Image Preview */}
              {form.images?.[0] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  <img
                    src={form.images[0]}
                    alt="Preview"
                    style={{ width: 50, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Xem trước hình ảnh sản phẩm
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 24, padding: '8px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={e => setForm({ ...form, featured: e.target.checked })}
                  />
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Sản phẩm nổi bật (Hot)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.newArrival}
                    onChange={e => setForm({ ...form, newArrival: e.target.checked })}
                  />
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>Hàng mới về (New)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" id="save-product-btn">
                  {editing ? 'Lưu Thay Đổi' : 'Thêm Vào Kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Products;
