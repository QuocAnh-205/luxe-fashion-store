import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './Admin.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    storeName: 'LUXE Fashion',
    hotline: '1900 8888',
    email: 'contact@fashion.com',
    address: '123 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    announcement: '✨ Khuyến mãi đặc biệt: Miễn phí giao hàng toàn quốc cho đơn hàng từ 2.000.000đ',
    shippingFee: 30000,
    freeShippingThreshold: 2000000,
    currency: 'VND'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    axios.get('/api/admin/settings')
      .then(res => {
        if (res.data?.settings) {
          setSettings(res.data.settings);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/admin/settings', settings);
      showToast('Đã lưu cấu hình hệ thống thành công');
    } catch (err) {
      showToast('Không thể lưu cấu hình', 'error');
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="admin-page-title">Cài Đặt Cấu Hình Hệ Thống</h1>
          <p className="admin-page-subtitle">Quản trị thông tin thương hiệu, chính sách giao hàng và banner thông báo toàn trang</p>
        </div>
      </div>

      <div className="admin-content" style={{ maxWidth: 900 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* General Settings */}
            <div className="admin-table-wrapper">
              <div className="admin-table-header">
                <h3><i className="fa-solid fa-store" style={{ color: 'var(--gold)' }}></i> Thông Tin Thương Hiệu & Cửa Hàng</h3>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tên website / Thương hiệu *</label>
                    <input
                      className="form-input"
                      required
                      value={settings.storeName}
                      onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hotline chăm sóc khách hàng *</label>
                    <input
                      className="form-input"
                      required
                      value={settings.hotline}
                      onChange={e => setSettings({ ...settings, hotline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email hỗ trợ khách hàng *</label>
                    <input
                      type="email"
                      className="form-input"
                      required
                      value={settings.email}
                      onChange={e => setSettings({ ...settings, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tiền tệ mặc định</label>
                    <input
                      className="form-input"
                      disabled
                      value="VNĐ (Việt Nam Đồng)"
                      style={{ opacity: 0.7 }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Địa chỉ trụ sở chính / Showroom *</label>
                  <input
                    className="form-input"
                    required
                    value={settings.address}
                    onChange={e => setSettings({ ...settings, address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Announcement Bar */}
            <div className="admin-table-wrapper">
              <div className="admin-table-header">
                <h3><i className="fa-solid fa-bullhorn" style={{ color: 'var(--gold)' }}></i> Thanh Thông Báo Khuyến Mãi (Header Banner)</h3>
              </div>
              <div style={{ padding: 24 }}>
                <div className="form-group">
                  <label className="form-label">Nội dung hiển thị trên đầu trang web</label>
                  <input
                    className="form-input"
                    value={settings.announcement}
                    onChange={e => setSettings({ ...settings, announcement: e.target.value })}
                    placeholder="VD: Miễn phí vận chuyển cho đơn hàng từ 2 triệu..."
                  />
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    Dòng chữ này sẽ xuất hiện trên thanh thông báo trang chủ giúp kích thích khách hàng mua sắm.
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping & Delivery Policies */}
            <div className="admin-table-wrapper">
              <div className="admin-table-header">
                <h3><i className="fa-solid fa-truck-fast" style={{ color: 'var(--gold)' }}></i> Chính Sách Vận Chuyển Toàn Quốc</h3>
              </div>
              <div style={{ padding: 24 }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Phí vận chuyển tiêu chuẩn (VNĐ)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.shippingFee}
                      onChange={e => setSettings({ ...settings, shippingFee: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mức đơn để Miễn phí vận chuyển (VNĐ)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.freeShippingThreshold}
                      onChange={e => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px' }} disabled={saving}>
                {saving ? (
                  <><div className="spinner" style={{ width: 16, height: 16, display: 'inline-block', marginRight: 8 }} /> Đang lưu...</>
                ) : (
                  <><i className="fa-solid fa-floppy-disk"></i> Lưu Cấu Hình Hệ Thống</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default Settings;
