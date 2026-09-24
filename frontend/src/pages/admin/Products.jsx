import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './Admin.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const emptyProduct = {
  name: '', category: '', price: '', originalPrice: '',
  description: '', sizes: [], colors: [], stock: '',
  images: [''], featured: false, newArrival: false
};

const CATEGORIES = ['Áo', 'Váy', 'Đầm', 'Quần', 'Set', 'Phụ kiện', 'Áo khoác'];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const fetchProducts = async () => {
    const params = search ? `?search=${search}` : '';
    const res = await axios.get(`/api/products${params}`);
    setProducts(res.data.products);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
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
      sizes: product.sizes || [],
      colors: product.colors || [],
      images: product.images || [''],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        stock: Number(form.stock),
        sizes: typeof form.sizes === 'string' ? form.sizes.split(',').map(s => s.trim()) : form.sizes,
        colors: typeof form.colors === 'string' ? form.colors.split(',').map(s => s.trim()) : form.colors,
      };
      if (editing) {
        await axios.put(`/api/products/${editing.id}`, data);
        showToast('Đã cập nhật sản phẩm');
      } else {
        await axios.post('/api/products', data);
        showToast('Đã thêm sản phẩm mới');
      }
      setShowModal(false);
      fetchProducts();
    } catch (e) {
      showToast('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Xóa sản phẩm "${product.name}"?`)) return;
    await axios.delete(`/api/products/${product.id}`);
    showToast('Đã xóa sản phẩm');
    fetchProducts();
  };

  return (
    <AdminLayout>
      {toast && (
        <div className="toast-container">
          <div className="toast success"><span><i className="fa-solid fa-check"></i> {toast}</span></div>
        </div>
      )}

      <div className="admin-header">
        <div>
          <h1 className="admin-page-title">Quản Lý Sản Phẩm</h1>
          <p className="admin-page-subtitle">{products.length} sản phẩm trong kho</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-product-btn">
          + Thêm Sản Phẩm
        </button>
      </div>

      <div className="admin-content">
        <div className="admin-table-wrapper" style={{ marginBottom: 20 }}>
          <div style={{ padding: '14px 20px' }}>
            <div className="admin-search">
              <span><i className="fa-solid fa-magnifying-glass"></i></span>
              <input
                placeholder="Tìm sản phẩm..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="product-search"
              />
            </div>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Kho</th>
                  <th>Đánh giá</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td></tr>
                ) : products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={p.images?.[0]} alt={p.name} style={{ width: 48, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                        <div>
                          <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 14 }}>{p.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>ID: {p.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-gray">{p.category}</span></td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{formatPrice(p.price)}</td>
                    <td>
                      <span className={p.stock < 10 ? 'badge badge-red' : 'badge badge-green'}>
                        {p.stock}
                      </span>
                    </td>
                    <td><i className="fa-solid fa-star" style={{fontSize: 12, color: 'var(--gold)'}}></i> {p.rating} ({p.reviews})</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {p.featured && <span className="badge badge-gold">Hot</span>}
                        {p.newArrival && <span className="badge badge-blue">Mới</span>}
                      </div>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="action-btn btn btn-ghost btn-sm"
                          onClick={() => openEdit(p)}
                          id={`edit-product-${p.id}`}
                        >
                          <i className="fa-solid fa-pen"></i> Sửa
                        </button>
                        <button
                          className="action-btn btn btn-danger btn-sm"
                          onClick={() => handleDelete(p)}
                          id={`delete-product-${p.id}`}
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: 24 }}>{editing ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} id="product-form">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Tên sản phẩm *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required id="product-name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Danh mục *</label>
                  <select className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required id="product-category">
                    <option value="">Chọn danh mục</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Giá bán *</label>
                  <input className="form-input" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required id="product-price" />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá gốc</label>
                  <input className="form-input" type="number" value={form.originalPrice} onChange={e => setForm({...form, originalPrice: e.target.value})} id="product-original-price" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} id="product-description" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Sizes (cách nhau bởi dấu phẩy)</label>
                  <input className="form-input" value={Array.isArray(form.sizes) ? form.sizes.join(', ') : form.sizes} onChange={e => setForm({...form, sizes: e.target.value})} placeholder="XS, S, M, L, XL" id="product-sizes" />
                </div>
                <div className="form-group">
                  <label className="form-label">Màu sắc (cách nhau bởi dấu phẩy)</label>
                  <input className="form-input" value={Array.isArray(form.colors) ? form.colors.join(', ') : form.colors} onChange={e => setForm({...form, colors: e.target.value})} placeholder="Black, White, Navy" id="product-colors" />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Số lượng kho</label>
                  <input className="form-input" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} id="product-stock" />
                </div>
                <div className="form-group">
                  <label className="form-label">URL hình ảnh</label>
                  <input className="form-input" value={form.images?.[0]} onChange={e => setForm({...form, images: [e.target.value]})} placeholder="https://..." id="product-image" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} id="product-featured" />
                  Sản phẩm nổi bật
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.newArrival} onChange={e => setForm({...form, newArrival: e.target.checked})} id="product-new" />
                  Hàng mới về
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" id="save-product-btn">
                  {editing ? 'Cập nhật' : 'Thêm mới'}
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
