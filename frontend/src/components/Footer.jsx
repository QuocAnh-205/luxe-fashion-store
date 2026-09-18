import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span>✦</span> LUXE
            </Link>
            <p className="footer-desc">
              Thương hiệu thời trang cao cấp hàng đầu Việt Nam. 
              Chúng tôi mang đến những thiết kế tinh tế, sang trọng 
              và đẳng cấp cho phụ nữ hiện đại.
            </p>
            <div className="social-links">
              <a href="#" className="social-btn" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="social-btn" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="#" className="social-btn" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.14 8.14 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Danh Mục</h4>
            <ul>
              <li><Link to="/shop?category=Áo">Áo</Link></li>
              <li><Link to="/shop?category=Váy">Váy</Link></li>
              <li><Link to="/shop?category=Đầm">Đầm</Link></li>
              <li><Link to="/shop?category=Quần">Quần</Link></li>
              <li><Link to="/shop?category=Phụ kiện">Phụ Kiện</Link></li>
              <li><Link to="/shop?category=Áo khoác">Áo Khoác</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-col">
            <h4>Hỗ Trợ</h4>
            <ul>
              <li><a href="#">Hướng dẫn chọn size</a></li>
              <li><a href="#">Chính sách đổi trả</a></li>
              <li><a href="#">Vận chuyển & giao hàng</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
              <li><a href="#">Liên hệ chúng tôi</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Liên Hệ</h4>
            <div className="contact-items">
              <div className="contact-item">
                <span>📍</span>
                <span>123 Đường Lê Lợi, Q.1, TP.HCM</span>
              </div>
              <div className="contact-item">
                <span>📞</span>
                <span>1800 1234 (Miễn phí)</span>
              </div>
              <div className="contact-item">
                <span>✉️</span>
                <span>hello@luxefashion.vn</span>
              </div>
              <div className="contact-item">
                <span>🕐</span>
                <span>T2-T7: 8:00 - 20:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="footer-newsletter">
          <div className="newsletter-content">
            <h3>Đăng Ký Nhận Ưu Đãi</h3>
            <p>Nhận thông báo về bộ sưu tập mới và ưu đãi độc quyền</p>
          </div>
          <div className="newsletter-form">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="newsletter-input"
              id="newsletter-email"
            />
            <button className="btn btn-primary" id="newsletter-submit">Đăng Ký</button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© 2024 LUXE Fashion. Bảo lưu mọi quyền.</p>
          <div className="footer-legal">
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Cookies</a>
          </div>
          <div className="payment-icons">
            <span className="payment-icon">VISA</span>
            <span className="payment-icon">MasterCard</span>
            <span className="payment-icon">VNPay</span>
            <span className="payment-icon">MoMo</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
