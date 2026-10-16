import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({ pendingOrders: 0, lowStockCount: 0 });

  useEffect(() => {
    axios.get('/api/admin/stats')
      .then(res => {
        if (res.data) {
          setStats({
            pendingOrders: res.data.pendingOrders || 0,
            lowStockCount: res.data.lowStockCount || 0
          });
        }
      })
      .catch(() => {});
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: <i className="fa-solid fa-chart-line"></i>, exact: true },
    {
      to: '/admin/orders',
      label: 'Đơn hàng',
      icon: <i className="fa-solid fa-cart-shopping"></i>,
      badge: stats.pendingOrders > 0 ? stats.pendingOrders : null,
      badgeColor: 'badge-gold'
    },
    {
      to: '/admin/products',
      label: 'Sản phẩm',
      icon: <i className="fa-solid fa-box"></i>,
      badge: stats.lowStockCount > 0 ? `! ${stats.lowStockCount}` : null,
      badgeColor: 'badge-red'
    },
    { to: '/admin/users', label: 'Khách hàng & User', icon: <i className="fa-solid fa-users"></i> },
    { to: '/admin/settings', label: 'Cài đặt hệ thống', icon: <i className="fa-solid fa-sliders"></i> },
  ];

  const isActive = (to, exact) => exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <div className={`admin-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo">
            <i className="fa-solid fa-gem" style={{ color: 'var(--gold)' }}></i> LUXE ADMIN
          </Link>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Thu nhỏ menu' : 'Mở rộng menu'}
          >
            {sidebarOpen ? <i className="fa-solid fa-chevron-left"></i> : <i className="fa-solid fa-chevron-right"></i>}
          </button>
        </div>

        <div className="admin-user-info">
          <img src={user?.avatar} alt={user?.name} className="admin-avatar" />
          <div className="admin-user-text">
            <p className="admin-user-name">{user?.name || 'Administrator'}</p>
            <span className="badge badge-gold"><i className="fa-solid fa-shield-halved"></i> Quản trị viên</span>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="nav-section-title">QUẢN LÝ CỬA HÀNG</div>
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-nav-item ${isActive(item.to, item.exact) ? 'active' : ''}`}
              id={`admin-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span className={`nav-badge ${item.badgeColor || 'badge-gold'}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item" title="Xem giao diện khách hàng">
            <span className="nav-icon"><i className="fa-solid fa-store"></i></span>
            <span className="nav-label">Xem cửa hàng</span>
          </Link>
          <button className="admin-nav-item logout-btn" onClick={handleLogout} title="Đăng xuất khỏi trang quản trị">
            <span className="nav-icon"><i className="fa-solid fa-arrow-right-from-bracket"></i></span>
            <span className="nav-label">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
