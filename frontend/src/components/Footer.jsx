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
              <i className="fa-solid fa-gem"></i> LUXE
            </Link>
            <p className="footer-desc">
              Thương hiệu thời trang cao cấp hàng đầu Việt Nam. 
              Chúng tôi mang đến những thiết kế tinh tế, sang trọng 
              và đẳng cấp cho phụ nữ hiện đại.
            </p>
            <div className="social-links">
              <a href="#" className="social-btn" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="social-btn" aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="social-btn" aria-label="TikTok">
                <i className="fa-brands fa-tiktok"></i>
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
                <span><i className="fa-solid fa-location-dot"></i></span>
                <span>123 Đường Lê Lợi, Q.1, TP.HCM</span>
              </div>
              <div className="contact-item">
                <span><i className="fa-solid fa-phone"></i></span>
                <span>1800 1234 (Miễn phí)</span>
              </div>
              <div className="contact-item">
                <span><i className="fa-solid fa-envelope"></i></span>
                <span>hello@luxefashion.vn</span>
              </div>
              <div className="contact-item">
                <span><i className="fa-regular fa-clock"></i></span>
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
          <p>© 2026 LUXE Fashion. Bảo lưu mọi quyền.</p>
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
