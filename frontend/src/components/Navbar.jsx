import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Trang Chủ' },
    { to: '/shop', label: 'Bộ Sưu Tập' },
    { to: '/shop?category=Áo', label: 'Áo' },
    { to: '/shop?category=Váy', label: 'Váy & Đầm' },
    { to: '/shop?category=Phụ kiện', label: 'Phụ Kiện' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">LUXE</span>
        </Link>

        {/* Nav Links - Desktop */}
        <ul className="navbar-links">
          {navLinks.map(link => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Cart */}
          <button
            className="nav-icon-btn"
            onClick={() => setIsOpen(true)}
            id="cart-btn"
            aria-label="Giỏ hàng"
          >
            🛍️
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </button>

          {/* User Menu */}
          {user ? (
            <div className="user-menu">
              <button
                className="user-avatar-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                id="user-menu-btn"
              >
                <img src={user.avatar} alt={user.name} className="user-avatar" />
                <span className="user-name-short">{user.name.split(' ')[0]}</span>
                <span className="chevron">{userMenuOpen ? '▴' : '▾'}</span>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <img src={user.avatar} alt={user.name} />
                    <div>
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item">👤 Tài khoản</Link>
                  <Link to="/orders" className="dropdown-item">📦 Đơn hàng</Link>
                  {isAdmin && (
                    <>
                      <div className="dropdown-divider" />
                      <Link to="/admin" className="dropdown-item admin-item">⚙️ Admin Panel</Link>
                    </>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>🚪 Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span className={`hamburger ${mobileOpen ? 'open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map(link => (
          <Link key={link.to} to={link.to} className="mobile-link">{link.label}</Link>
        ))}
        {!user && (
          <div className="mobile-auth">
            <Link to="/login" className="btn btn-ghost btn-full">Đăng nhập</Link>
            <Link to="/register" className="btn btn-primary btn-full">Đăng ký</Link>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {userMenuOpen && (
        <div className="nav-backdrop" onClick={() => setUserMenuOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;
