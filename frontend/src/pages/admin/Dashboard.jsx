import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './Admin.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

const formatDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
};

const statusLabels = {
  pending: { label: 'Chờ xử lý', badge: 'badge-gold', icon: 'fa-hourglass-half' },
  shipping: { label: 'Đang giao', badge: 'badge-blue', icon: 'fa-truck' },
  delivered: { label: 'Đã giao', badge: 'badge-green', icon: 'fa-check' },
  cancelled: { label: 'Đã hủy', badge: 'badge-red', icon: 'fa-xmark' }
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchStats = () => {
    axios.get('/api/admin/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}`, { status: newStatus });
      setActionMsg(`Đã cập nhật đơn #${orderId.slice(0, 8)} sang "${statusLabels[newStatus]?.label}"`);
      setTimeout(() => setActionMsg(''), 3000);
      fetchStats();
    } catch (err) {
      alert('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="page-loader" style={{ height: '80vh' }}><div className="spinner" /></div>
    </AdminLayout>
  );

  const statCards = [
    {
      icon: <i className="fa-solid fa-money-bill-wave"></i>,
      label: 'Tổng Doanh Thu',
      value: formatPrice(stats?.totalRevenue),
      subtext: `Đã thu: ${formatPrice(stats?.deliveredRevenue)}`,
      color: '#d4af37',
      bgGlow: 'rgba(212, 175, 55, 0.12)'
    },
    {
      icon: <i className="fa-solid fa-cart-shopping"></i>,
      label: 'Tổng Đơn Hàng',
      value: stats?.totalOrders || 0,
      subtext: `${stats?.pendingOrders || 0} đơn đang chờ xử lý`,
      color: '#4ade80',
      bgGlow: 'rgba(74, 222, 128, 0.12)'
    },
    {
      icon: <i className="fa-solid fa-users"></i>,
      label: 'Khách Hàng',
      value: stats?.totalUsers || 0,
      subtext: `${stats?.totalAdmins || 1} tài khoản quản trị`,
      color: '#6c63ff',
      bgGlow: 'rgba(108, 99, 255, 0.12)'
    },
    {
      icon: <i className="fa-solid fa-box-open"></i>,
      label: 'Kho Sản Phẩm',
      value: stats?.totalProducts || 0,
      subtext: stats?.lowStockCount > 0 ? `⚠️ ${stats?.lowStockCount} sản phẩm sắp hết` : 'Tồn kho ổn định',
      color: stats?.lowStockCount > 0 ? '#f43f5e' : '#38bdf8',
      bgGlow: stats?.lowStockCount > 0 ? 'rgba(244, 63, 94, 0.12)' : 'rgba(56, 189, 248, 0.12)'
    },
  ];

  const maxRevenue = Math.max(...(stats?.revenueChart?.map(c => c.revenue) || [1]), 1000000);

  return (
    <AdminLayout>
      {actionMsg && (
        <div className="toast-container">
          <div className="toast success">
            <span><i className="fa-solid fa-circle-check"></i> {actionMsg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-page-title">Bảng Điều Khiển Quản Trị</h1>
          <p className="admin-page-subtitle">Hệ thống theo dõi kinh doanh, kho hàng và đơn mua theo thời gian thực</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={fetchStats} title="Làm mới dữ liệu">
            <i className="fa-solid fa-arrows-rotate"></i> Làm mới
          </button>
          <span className="badge badge-green">
            <span className="live-dot"></span> Hệ thống trực tuyến
          </span>
        </div>
      </div>

      <div className="admin-content">
        {/* Action Alerts */}
        {(stats?.pendingOrders > 0 || stats?.lowStockCount > 0) && (
          <div className="admin-alert-banner">
            {stats?.pendingOrders > 0 && (
              <div className="alert-item alert-warning">
                <i className="fa-solid fa-bell"></i>
                <span>Bạn đang có <strong>{stats.pendingOrders} đơn hàng mới</strong> cần kiểm tra và xử lý.</span>
                <Link to="/admin/orders" className="btn btn-sm btn-primary">Xử lý ngay</Link>
              </div>
            )}
            {stats?.lowStockCount > 0 && (
              <div className="alert-item alert-danger">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>Có <strong>{stats.lowStockCount} sản phẩm</strong> có tồn kho dưới 10 cần nhập thêm hàng.</span>
                <Link to="/admin/products" className="btn btn-sm btn-outline">Xem kho hàng</Link>
              </div>
            )}
          </div>
        )}

        {/* Stat Cards */}
        <div className="stats-grid">
          {statCards.map(card => (
            <div key={card.label} className="stat-card" style={{ '--stat-color': card.color }}>
              <div className="stat-icon" style={{ color: card.color }}>{card.icon}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-change" style={{ color: card.color }}>{card.subtext}</div>
            </div>
          ))}
        </div>

        {/* 7-Day Revenue Trend & Order Status Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Revenue Chart */}
          <div className="admin-table-wrapper">
            <div className="admin-table-header">
              <h3><i className="fa-solid fa-chart-simple" style={{ color: 'var(--gold)' }}></i> Biểu Đồ Doanh Thu 7 Ngày Gần Nhất</h3>
              <span className="badge badge-gold">Thời gian thực</span>
            </div>
            <div style={{ padding: '24px 24px 16px' }}>
              <div className="chart-bars-container">
                {stats?.revenueChart?.map((item, idx) => {
                  const heightPercent = Math.max(Math.round((item.revenue / maxRevenue) * 100), 8);
                  return (
                    <div key={idx} className="chart-col">
                      <div className="chart-bar-tooltip">
                        <div>{formatPrice(item.revenue)}</div>
                        <div style={{ fontSize: 11, opacity: 0.8 }}>{item.orders} đơn hàng</div>
                      </div>
                      <div className="chart-bar-wrap">
                        <div
                          className="chart-bar-fill"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="chart-col-label">{item.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="admin-table-wrapper">
            <div className="admin-table-header">
              <h3><i className="fa-solid fa-pie-chart" style={{ color: 'var(--gold)' }}></i> Phân Bổ Trạng Thái Đơn</h3>
              <Link to="/admin/orders" className="btn btn-ghost btn-sm">Xem tất cả</Link>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Chờ xử lý', count: stats?.pendingOrders, color: 'var(--warning)', pct: stats?.totalOrders ? (stats.pendingOrders / stats.totalOrders) * 100 : 0 },
                { label: 'Đang vận chuyển', count: stats?.shippingOrders, color: '#38bdf8', pct: stats?.totalOrders ? (stats.shippingOrders / stats.totalOrders) * 100 : 0 },
                { label: 'Đã giao thành công', count: stats?.deliveredOrders, color: 'var(--success)', pct: stats?.totalOrders ? (stats.deliveredOrders / stats.totalOrders) * 100 : 0 },
                { label: 'Đã hủy', count: stats?.cancelledOrders, color: 'var(--error)', pct: stats?.totalOrders ? (stats.cancelledOrders / stats.totalOrders) * 100 : 0 },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ color: s.color, fontWeight: 700 }}>
                      {s.count || 0} đơn ({Math.round(s.pct)}%)
                    </span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${s.pct || 0}%`,
                        height: '100%',
                        background: s.color,
                        borderRadius: 6,
                        transition: 'width 0.8s ease'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders with Quick Actions */}
        <div className="admin-table-wrapper" style={{ marginBottom: 24 }}>
          <div className="admin-table-header">
            <h3><i className="fa-solid fa-receipt" style={{ color: 'var(--gold)' }}></i> Đơn Hàng Mới Nhất Cần Xử Lý</h3>
            <Link to="/admin/orders" className="btn btn-outline btn-sm">Quản lý toàn bộ đơn hàng</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Số sản phẩm</th>
                  <th>Tổng giá trị</th>
                  <th>Thời gian đặt</th>
                  <th>Trạng thái hiện tại</th>
                  <th>Thao tác nhanh</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  stats?.recentOrders?.map(order => {
                    const st = statusLabels[order.status] || { label: order.status, badge: 'badge-gray' };
                    return (
                      <tr key={order.id}>
                        <td style={{ fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 600 }}>
                          #{order.id.slice(0, 12)}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.userName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.phone || order.userEmail}</div>
                        </td>
                        <td>{order.items?.length || 0} sản phẩm</td>
                        <td style={{ color: 'var(--gold)', fontWeight: 700 }}>{formatPrice(order.total)}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDate(order.createdAt)}</td>
                        <td>
                          <span className={`badge ${st.badge}`}>
                            ● {st.label}
                          </span>
                        </td>
                        <td>
                          <select
                            className="form-input quick-status-select"
                            value={order.status}
                            onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
                            style={{ padding: '6px 10px', fontSize: 12, width: 'auto' }}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="shipping">Đang giao</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2 Bottom Columns: Top Selling Products & New Users */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Top Products */}
          <div className="admin-table-wrapper">
            <div className="admin-table-header">
              <h3><i className="fa-solid fa-fire" style={{ color: 'var(--gold)' }}></i> Top Sản Phẩm Nổi Bật</h3>
              <Link to="/admin/products" className="btn btn-ghost btn-sm">Xem kho</Link>
            </div>
            <div style={{ padding: '10px 0' }}>
              {stats?.topProducts?.map((p, i) => (
                <div key={p.id} className="top-product-row">
                  <span className={`rank-badge rank-${i + 1}`}>#{i + 1}</span>
                  <img src={p.images?.[0]} alt={p.name} className="top-product-img" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Danh mục: {p.category} · Còn kho: <strong style={{ color: p.stock < 10 ? 'var(--error)' : 'var(--success)' }}>{p.stock}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 14 }}>{formatPrice(p.price)}</span>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>★ {p.rating} ({p.reviews})</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newest Users */}
          <div className="admin-table-wrapper">
            <div className="admin-table-header">
              <h3><i className="fa-solid fa-user-plus" style={{ color: 'var(--gold)' }}></i> Khách Hàng Mới Tham Gia</h3>
              <Link to="/admin/users" className="btn btn-ghost btn-sm">Quản lý khách</Link>
            </div>
            <div style={{ padding: '10px 0' }}>
              {stats?.recentUsers?.map(u => (
                <div key={u.id} className="top-product-row">
                  <img src={u.avatar} alt={u.name} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border-gold)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email} · {u.phone || 'Chưa cập nhật SĐT'}</p>
                  </div>
                  <div>
                    <span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-gray'}`}>
                      {u.role === 'admin' ? 'Admin' : 'Khách hàng'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;
