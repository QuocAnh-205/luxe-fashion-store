import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [f, n] = await Promise.all([
          axios.get('/api/products?featured=true'),
          axios.get('/api/products?newArrival=true'),
        ]);
        setFeatured(f.data.products.slice(0, 4));
        setNewArrivals(n.data.products.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    { name: 'Áo', emoji: '👚', color: '#d4af37', slug: 'Áo' },
    { name: 'Váy', emoji: '👗', color: '#ff6584', slug: 'Váy' },
    { name: 'Đầm', emoji: '✨', color: '#6c63ff', slug: 'Đầm' },
    { name: 'Quần', emoji: '👖', color: '#43c6ac', slug: 'Quần' },
    { name: 'Phụ kiện', emoji: '👜', color: '#f093fb', slug: 'Phụ kiện' },
    { name: 'Áo Khoác', emoji: '🧥', color: '#4facfe', slug: 'Áo khoác' },
  ];

  return (
    <div className="home-page page-wrapper">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
        </div>

        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-tag">✦ Bộ Sưu Tập 2024</div>
            <h1 className="hero-title">
              Phong Cách <br />
              <span className="hero-gradient">Định Nghĩa</span> <br />
              Bạn
            </h1>
            <p className="hero-desc">
              Khám phá thế giới thời trang cao cấp với những thiết kế 
              tinh tế, sang trọng dành cho phụ nữ hiện đại tự tin và 
              đẳng cấp.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary btn-lg" id="hero-shop-btn">
                Mua Sắm Ngay →
              </Link>
              <Link to="/shop?newArrival=true" className="btn btn-outline btn-lg">
                Hàng Mới Về
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Sản phẩm</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Khách hàng</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">Đánh giá</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"
                alt="Fashion model"
                className="hero-main-img"
              />
              {/* Floating cards */}
              <div className="floating-card card-1">
                <span>🔥</span>
                <div>
                  <p className="fc-title">Bestseller</p>
                  <p className="fc-sub">Áo Blazer Linen</p>
                </div>
              </div>
              <div className="floating-card card-2">
                <span>🚀</span>
                <div>
                  <p className="fc-title">Mới nhất</p>
                  <p className="fc-sub">5 sản phẩm hôm nay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="section-title">
            <h2>Danh Mục Sản Phẩm</h2>
            <div className="gold-line" />
            <p>Tìm kiếm phong cách riêng của bạn</p>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className="category-card"
                style={{ '--cat-color': cat.color }}
                id={`cat-${cat.slug}`}
              >
                <div className="cat-emoji">{cat.emoji}</div>
                <h3>{cat.name}</h3>
                <span className="cat-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div className="section-title" style={{ textAlign: 'left', marginBottom: 0 }}>
              <h2 style={{ textAlign: 'left' }}>Sản Phẩm Nổi Bật</h2>
              <div className="gold-line" style={{ margin: '12px 0' }} />
            </div>
            <Link to="/shop?featured=true" className="btn btn-outline">Xem tất cả</Link>
          </div>
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : (
            <div className="grid-4">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Banner */}
      <section className="promo-banner">
        <div className="container">
          <div className="banner-content">
            <div className="banner-text">
              <span className="banner-tag">🔥 Ưu đãi đặc biệt</span>
              <h2>Giảm đến 30% <br />Cho đơn hàng đầu tiên</h2>
              <p>Đăng ký thành viên ngay hôm nay và nhận ngay mã giảm giá độc quyền</p>
              <Link to="/register" className="btn btn-primary btn-lg" id="banner-register-btn">
                Đăng ký ngay
              </Link>
            </div>
            <div className="banner-visual">
              <div className="banner-ring ring-1" />
              <div className="banner-ring ring-2" />
              <div className="banner-ring ring-3" />
              <span className="banner-percent">30%</span>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="new-arrivals-section">
        <div className="container">
          <div className="section-header">
            <div className="section-title" style={{ textAlign: 'left', marginBottom: 0 }}>
              <h2 style={{ textAlign: 'left' }}>Hàng Mới Về</h2>
              <div className="gold-line" style={{ margin: '12px 0' }} />
            </div>
            <Link to="/shop?newArrival=true" className="btn btn-outline">Xem tất cả</Link>
          </div>
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : (
            <div className="grid-4">
              {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            {[
              { icon: '🚚', title: 'Miễn phí vận chuyển', desc: 'Cho đơn hàng từ 500.000đ' },
              { icon: '🔄', title: 'Đổi trả 30 ngày', desc: 'Không cần lý do' },
              { icon: '🔒', title: 'Thanh toán an toàn', desc: 'Mã hóa SSL 256-bit' },
              { icon: '💎', title: 'Chính hãng 100%', desc: 'Cam kết chất lượng' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
