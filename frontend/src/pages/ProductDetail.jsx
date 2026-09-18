import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const Stars = ({ rating }) => (
  <div className="stars">
    {[1,2,3,4,5].map(i => (
      <span key={i} className={`star ${i <= Math.round(rating) ? '' : 'empty'}`}>★</span>
    ))}
    <span className="rating-text">{rating} ({0} đánh giá)</span>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data.product);
        setSelectedSize(res.data.product.sizes?.[0] || '');
        setSelectedColor(res.data.product.colors?.[0] || '');
      } catch {
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddToCart = () => {
    if (!selectedSize) { showToast('Vui lòng chọn size'); return; }
    if (!selectedColor) { showToast('Vui lòng chọn màu sắc'); return; }
    setAdding(true);
    addItem(product, selectedSize, selectedColor, quantity);
    setTimeout(() => { setAdding(false); showToast('✓ Đã thêm vào giỏ hàng!'); }, 500);
  };

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  if (loading) {
    return <div className="page-loader page-wrapper"><div className="spinner" /></div>;
  }

  if (!product) return null;

  return (
    <div className="product-detail page-wrapper">
      {toast && (
        <div className={`toast-container`}>
          <div className={`toast ${toast.includes('✓') ? 'success' : 'error'}`}>
            <span>{toast}</span>
          </div>
        </div>
      )}

      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="breadcrumb">
          <button className="crumb" onClick={() => navigate('/')}>Trang chủ</button>
          <span>›</span>
          <button className="crumb" onClick={() => navigate('/shop')}>Bộ sưu tập</button>
          <span>›</span>
          <span className="crumb active">{product.name}</span>
        </nav>

        <div className="detail-layout">
          {/* Images */}
          <div className="detail-images">
            <div className="main-image">
              <img
                src={product.images?.[activeImage] || product.images?.[0]}
                alt={product.name}
              />
              {discount > 0 && (
                <div className="sale-badge">-{discount}%</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="thumbnail-list">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumbnail ${activeImage === i ? 'active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            <p className="detail-category">{product.category}</p>
            <h1 className="detail-name">{product.name}</h1>

            <div className="detail-rating">
              <Stars rating={product.rating} />
              <span className="in-stock">
                {product.stock > 0
                  ? <><span className="stock-dot" />Còn hàng ({product.stock})</>
                  : <><span className="stock-dot out" />Hết hàng</>
                }
              </span>
            </div>

            <div className="detail-price">
              <span className="price-current">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="price-original">{formatPrice(product.originalPrice)}</span>
                  <span className="price-badge">-{discount}%</span>
                </>
              )}
            </div>

            <p className="detail-desc">{product.description}</p>

            {/* Size */}
            <div className="detail-option">
              <div className="option-label">
                <span>Kích thước:</span>
                <span className="selected-option">{selectedSize}</span>
              </div>
              <div className="size-list">
                {product.sizes?.map(size => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                    id={`size-${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="detail-option">
              <div className="option-label">
                <span>Màu sắc:</span>
                <span className="selected-option">{selectedColor}</span>
              </div>
              <div className="color-list">
                {product.colors?.map(color => (
                  <button
                    key={color}
                    className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    id={`color-${color}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="detail-option">
              <div className="option-label"><span>Số lượng:</span></div>
              <div className="qty-selector">
                <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <span className="qty-val">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="detail-actions">
              <button
                className={`btn btn-primary btn-lg ${adding ? 'adding' : ''}`}
                onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
                id="add-to-cart-btn"
                style={{ flex: 1 }}
              >
                {adding ? '✓ Đã thêm!' : '🛍️ Thêm vào giỏ'}
              </button>
              <button
                className="btn btn-outline btn-lg"
                onClick={() => {
                  if (!isAuthenticated) { navigate('/login'); return; }
                  handleAddToCart();
                }}
                id="buy-now-btn"
              >
                Mua ngay
              </button>
            </div>

            {/* Features */}
            <div className="detail-features">
              <div className="feat-item"><span>🚚</span> Miễn phí ship đơn &gt; 500k</div>
              <div className="feat-item"><span>🔄</span> Đổi trả miễn phí 30 ngày</div>
              <div className="feat-item"><span>💎</span> Hàng chính hãng 100%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
