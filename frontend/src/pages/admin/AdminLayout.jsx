import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: <i className="fa-solid fa-chart-line"></i>, exact: true },
    { to: '/admin/users', label: 'Người dùng', icon: <i className="fa-solid fa-users"></i> },
    { to: '/admin/products', label: 'Sản phẩm', icon: <i className="fa-solid fa-box"></i> },
    { to: '/admin/orders', label: 'Đơn hàng', icon: <i className="fa-solid fa-cart-shopping"></i> },
  ];

  const isActive = (to, exact) => exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <div className={`admin-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo"><i className="fa-solid fa-gem"></i> LUXE</Link>
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <i className="fa-solid fa-chevron-left"></i> : <i className="fa-solid fa-chevron-right"></i>}
          </button>
        </div>

        <div className="admin-user-info">
          <img src={user?.avatar} alt={user?.name} className="admin-avatar" />
          <div className="admin-user-text">
            <p className="admin-user-name">{user?.name}</p>
            <span className="badge badge-gold">Admin</span>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-nav-item ${isActive(item.to, item.exact) ? 'active' : ''}`}
              id={`admin-nav-${item.label.toLowerCase()}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item">
            <span className="nav-icon"><i className="fa-solid fa-house"></i></span>
            <span className="nav-label">Về trang chủ</span>
          </Link>
          <button className="admin-nav-item logout-btn" onClick={handleLogout}>
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
