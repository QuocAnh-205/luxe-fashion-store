import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './Admin.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

const statusLabels = {
  pending: 'Chờ xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy'
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout>
      <div className="page-loader" style={{ height: '100vh' }}><div className="spinner" /></div>
    </AdminLayout>
  );

  const statCards = [
    { icon: <i className="fa-solid fa-users"></i>, label: 'Người Dùng', value: stats.totalUsers, color: '#6c63ff', change: '+12% tháng này' },
    { icon: <i className="fa-solid fa-box"></i>, label: 'Sản Phẩm', value: stats.totalProducts, color: '#d4af37', change: `${stats.totalProducts} danh mục` },
    { icon: <i className="fa-solid fa-cart-shopping"></i>, label: 'Đơn Hàng', value: stats.totalOrders, color: '#4ade80', change: `${stats.pendingOrders} đang chờ` },
    { icon: <i className="fa-solid fa-money-bill-wave"></i>, label: 'Doanh Thu', value: formatPrice(stats.totalRevenue), color: '#f093fb', change: '+8% so với tháng trước' },
  ];

  return (
    <AdminLayout>
      <div className="admin-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Tổng quan hoạt động của cửa hàng</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-green">● Hệ thống hoạt động</span>
        </div>
      </div>

      <div className="admin-content">
        {/* Stats */}
        <div className="stats-grid">
          {statCards.map(card => (
            <div key={card.label} className="stat-card" style={{ '--stat-color': card.color }}>
              <div className="stat-icon">{card.icon}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-change">{card.change}</div>
            </div>
          ))}
        </div>

        {/* Order Status Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div className="admin-table-wrapper">
            <div className="admin-table-header">
              <h3><i className="fa-solid fa-clipboard-list"></i> Trạng Thái Đơn Hàng</h3>
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Chờ xử lý', value: stats.pendingOrders, color: 'var(--warning)', pct: stats.pendingOrders / stats.totalOrders * 100 },
                { label: 'Đang giao', value: stats.shippingOrders, color: 'var(--info)', pct: stats.shippingOrders / stats.totalOrders * 100 },
                { label: 'Đã giao', value: stats.deliveredOrders, color: 'var(--success)', pct: stats.deliveredOrders / stats.totalOrders * 100 },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ color: s.color, fontWeight: 600 }}>{s.value}</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${s.pct || 0}%`, height: '100%', background: s.color, borderRadius: 4, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-table-wrapper">
            <div className="admin-table-header">
              <h3><i className="fa-solid fa-trophy"></i> Sản Phẩm Bán Chạy</h3>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 240 }}>
              {stats.topProducts?.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 20px', borderBottom: '1px solid var(--border)'
                }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700, width: 20 }}>#{i+1}</span>
                  <img src={p.images?.[0]} alt={p.name} style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.reviews} đánh giá</p>
                  </div>
                  <span style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 600 }}><i className="fa-solid fa-star" style={{fontSize: 10}}></i> {p.rating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="admin-table-wrapper">
          <div className="admin-table-header">
            <h3><i className="fa-solid fa-box"></i> Đơn Hàng Gần Đây</h3>
            <a href="/admin/orders" className="btn btn-outline btn-sm">Xem tất cả</a>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders?.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--gold)', fontSize: 12 }}>
                      #{order.id.slice(0, 8)}
                    </td>
                    <td>{order.userName}</td>
                    <td>{order.items?.length} sản phẩm</td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{formatPrice(order.total)}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <span className={`badge badge-${
                        order.status === 'delivered' ? 'green' :
                        order.status === 'shipping' ? 'blue' :
                        order.status === 'pending' ? 'gold' : 'red'
                      }`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
