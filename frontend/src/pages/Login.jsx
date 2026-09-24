import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@fashion.com', password: 'Admin@123' });
    else setForm({ email: 'user@fashion.com', password: 'User@123' });
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-a" />
        <div className="auth-orb orb-b" />
      </div>

      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-left">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon"><i className="fa-solid fa-gem" /></div>
            <span className="auth-logo-text">LUXE</span>
          </Link>
          <div className="auth-left-content">
            <h2>Chào mừng trở lại</h2>
            <p>Đăng nhập để khám phá bộ sưu tập 2026 độc quyền và ưu đãi thành viên đặc biệt</p>
            <div className="auth-features">
              <div className="auth-feat">
                <div className="auth-feat-icon"><i className="fa-solid fa-crown" /></div>
                Ưu đãi thành viên độc quyền 2026
              </div>
              <div className="auth-feat">
                <div className="auth-feat-icon"><i className="fa-solid fa-location-arrow" /></div>
                Theo dõi đơn hàng realtime
              </div>
              <div className="auth-feat">
                <div className="auth-feat-icon"><i className="fa-solid fa-gift" /></div>
                Tích điểm đổi quà hấp dẫn
              </div>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80"
            alt="Fashion"
            className="auth-left-img"
          />
        </div>

        {/* Right Form */}
        <div className="auth-right">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <h1>Đăng Nhập</h1>
              <p>Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký ngay</Link></p>
            </div>

            {/* Demo Buttons */}
            <div className="demo-btns">
              <p className="demo-label">Dùng thử nhanh:</p>
              <div className="demo-row">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => fillDemo('user')}
                  id="demo-user-btn"
                  type="button"
                >
                  <i className="fa-regular fa-user"></i> User Demo
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => fillDemo('admin')}
                  id="demo-admin-btn"
                  type="button"
                >
                  <i className="fa-solid fa-gear"></i> Admin Demo
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <i className="fa-solid fa-triangle-exclamation"></i> {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} id="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Mật khẩu</label>
                <div className="input-password">
                  <input
                    type={showPass ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPass(!showPass)}
                    id="toggle-password"
                    aria-label="Hiện/ẩn mật khẩu"
                  >
                    {showPass ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                  </button>
                </div>
              </div>

              <div className="form-extras">
                <label className="remember-label">
                  <input type="checkbox" id="remember" /> Ghi nhớ đăng nhập
                </label>
                <a href="#" className="forgot-link">Quên mật khẩu?</a>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
                id="login-submit"
              >
                {loading ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Đang đăng nhập...</>
                ) : (
                  'Đăng Nhập →'
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>hoặc đăng nhập với</span>
            </div>

            <div className="social-auth">
              <button className="btn btn-ghost btn-full social-auth-btn" id="google-login" type="button">
                <i className="fa-brands fa-google" style={{color: '#EA4335', fontSize: '18px'}}></i>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
