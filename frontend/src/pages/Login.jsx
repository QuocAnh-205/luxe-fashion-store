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
          <Link to="/" className="auth-logo">✦ LUXE</Link>
          <div className="auth-left-content">
            <h2>Chào mừng trở lại</h2>
            <p>Đăng nhập để khám phá bộ sưu tập độc quyền và ưu đãi thành viên</p>
            <div className="auth-features">
              <div className="auth-feat">✦ Ưu đãi thành viên độc quyền</div>
              <div className="auth-feat">✦ Theo dõi đơn hàng realtime</div>
              <div className="auth-feat">✦ Tích điểm đổi quà</div>
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
                  👤 User Demo
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => fillDemo('admin')}
                  id="demo-admin-btn"
                  type="button"
                >
                  ⚙️ Admin Demo
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <span>⚠️</span> {error}
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
                    {showPass ? '🙈' : '👁️'}
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
                  <><span className="btn-spinner" /> Đang đăng nhập...</>
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
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
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
