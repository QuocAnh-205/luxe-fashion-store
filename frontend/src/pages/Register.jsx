import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return { level: 0, label: '' };
    if (p.length < 6) return { level: 1, label: 'Yếu' };
    if (p.length < 10) return { level: 2, label: 'Trung bình' };
    return { level: 3, label: 'Mạnh' };
  };

  const strength = getPasswordStrength();

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
            <h2>Gia nhập cộng đồng LUXE 2026</h2>
            <p>Đăng ký để nhận ngay ưu đãi 10% cho đơn hàng đầu tiên của bạn</p>
            <div className="auth-features">
              <div className="auth-feat">
                <div className="auth-feat-icon"><i className="fa-solid fa-percent" /></div>
                Giảm 10% đơn hàng đầu tiên
              </div>
              <div className="auth-feat">
                <div className="auth-feat-icon"><i className="fa-solid fa-truck" /></div>
                Miễn phí vận chuyển VIP
              </div>
              <div className="auth-feat">
                <div className="auth-feat-icon"><i className="fa-solid fa-bolt" /></div>
                Truy cập hàng mới 2026 sớm nhất
              </div>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80"
            alt="Fashion 2026"
            className="auth-left-img"
          />

        </div>

        {/* Right Form */}
        <div className="auth-right">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <h1>Tạo Tài Khoản</h1>
              <p>Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập</Link></p>
            </div>

            {error && (
              <div className="auth-error">
                <i className="fa-solid fa-triangle-exclamation"></i> {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} id="register-form">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Họ và tên</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={handleChange}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email</label>
                <input
                  type="email"
                  id="reg-email"
                  name="email"
                  className="form-input"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Mật khẩu</label>
                <div className="input-password">
                  <input
                    type={showPass ? 'text' : 'password'}
                    id="reg-password"
                    name="password"
                    className="form-input"
                    placeholder="Tối thiểu 6 ký tự"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPass(!showPass)}
                    id="toggle-reg-password"
                  >
                    {showPass ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                  </button>
                </div>
                {form.password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1,2,3].map(i => (
                        <div
                          key={i}
                          className={`strength-bar ${strength.level >= i ? `level-${strength.level}` : ''}`}
                        />
                      ))}
                    </div>
                    <span className={`strength-label level-${strength.level}`}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`form-input ${form.confirmPassword && form.password !== form.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="form-error"><i className="fa-solid fa-triangle-exclamation"></i> Mật khẩu không khớp</p>
                )}
              </div>

              <div className="terms-check">
                <input type="checkbox" id="agree-terms" required />
                <label htmlFor="agree-terms">
                  Tôi đồng ý với <a href="#" className="auth-link">Điều khoản sử dụng</a> và{' '}
                  <a href="#" className="auth-link">Chính sách bảo mật</a>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
                id="register-submit"
              >
                {loading ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Đang tạo tài khoản...</>
                ) : (
                  'Tạo Tài Khoản →'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
