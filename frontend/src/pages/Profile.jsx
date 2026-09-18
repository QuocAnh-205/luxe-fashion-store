import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');
const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const statusLabels = {
  pending: { label: 'Chờ xử lý', badge: 'badge-gold' },
  shipping: { label: 'Đang giao', badge: 'badge-blue' },
  delivered: { label: 'Đã giao', badge: 'badge-green' },
  cancelled: { label: 'Đã hủy', badge: 'badge-red' },
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('info');
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (tab === 'orders') {
      axios.get('/api/orders/my')
        .then(r => setOrders(r.data.orders))
        .catch(console.error);
    }
  }, [tab]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put('/api/auth/profile', form);
      updateUser(res.data.user);
      showToast('Đã cập nhật hồ sơ thành công!');
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (err) {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page page-wrapper">
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : '⚠️'} {toast.msg}</span>
          </div>
        </div>
      )}

      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-card">
              <img src={user?.avatar} alt={user?.name} className="profile-avatar" />
              <h3 className="profile-name">{user?.name}</h3>
              <p className="profile-email">{user?.email}</p>
              <span className={`badge ${user?.role === 'admin' ? 'badge-gold' : 'badge-gray'}`}>
                {user?.role === 'admin' ? '⚙️ Admin' : '👤 Thành viên'}
              </span>
            </div>
            <nav className="profile-nav">
              <button
                className={`profile-nav-btn ${tab === 'info' ? 'active' : ''}`}
                onClick={() => setTab('info')}
                id="tab-info"
              >
                👤 Thông tin cá nhân
              </button>
              <button
                className={`profile-nav-btn ${tab === 'orders' ? 'active' : ''}`}
                onClick={() => setTab('orders')}
                id="tab-orders"
              >
                📦 Đơn hàng của tôi
              </button>
              <button
                className={`profile-nav-btn ${tab === 'password' ? 'active' : ''}`}
                onClick={() => setTab('password')}
                id="tab-password"
              >
                🔒 Đổi mật khẩu
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="profile-content">
            {tab === 'info' && (
              <div className="profile-section">
                <h2>Thông Tin Cá Nhân</h2>
                <form onSubmit={handleSave} className="profile-form" id="profile-form">
                  <div className="form-group">
                    <label className="form-label">Họ và tên</label>
                    <input
                      className="form-input"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      id="profile-name"
                    />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số điện thoại</label>
                      <input
                        className="form-input"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="0901234567"
                        id="profile-phone"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Địa chỉ</label>
                    <textarea
                      className="form-input"
                      value={form.address}
                      onChange={e => setForm({ ...form, address: e.target.value })}
                      rows={3}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                      id="profile-address"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving} id="save-profile-btn">
                    {saving ? '⏳ Đang lưu...' : '✓ Lưu thay đổi'}
                  </button>
                </form>
              </div>
            )}

            {tab === 'password' && (
              <div className="profile-section">
                <h2>Đổi Mật Khẩu</h2>
                <form onSubmit={handleSave} className="profile-form" id="password-form">
                  <div className="form-group">
                    <label className="form-label">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      className="form-input"
                      value={form.currentPassword}
                      onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                      id="current-password"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mật khẩu mới</label>
                    <input
                      type="password"
                      className="form-input"
                      value={form.newPassword}
                      onChange={e => setForm({ ...form, newPassword: e.target.value })}
                      placeholder="Tối thiểu 6 ký tự"
                      id="new-password"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving} id="save-password-btn">
                    {saving ? '⏳ Đang lưu...' : '🔒 Cập nhật mật khẩu'}
                  </button>
                </form>
              </div>
            )}

            {tab === 'orders' && (
              <div className="profile-section">
                <h2>Đơn Hàng Của Tôi</h2>
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3>Chưa có đơn hàng nào</h3>
                    <p>Hãy bắt đầu mua sắm để xem lịch sử đơn hàng</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map(order => {
                      const sc = statusLabels[order.status];
                      return (
                        <div key={order.id} className="order-card">
                          <div className="order-card-header">
                            <div>
                              <span className="order-id">#{order.id.slice(0, 8)}</span>
                              <span className="order-date">{formatDate(order.createdAt)}</span>
                            </div>
                            <span className={`badge ${sc?.badge}`}>{sc?.label}</span>
                          </div>
                          <div className="order-items-preview">
                            {order.items?.slice(0, 2).map((item, i) => (
                              <span key={i} className="order-item-tag">{item.name} x{item.quantity}</span>
                            ))}
                            {order.items?.length > 2 && (
                              <span className="order-item-tag">+{order.items.length - 2} khác</span>
                            )}
                          </div>
                          <div className="order-card-footer">
                            <span className="order-total">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
