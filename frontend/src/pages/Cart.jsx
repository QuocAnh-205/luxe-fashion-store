import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    note: ''
  });
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const shipping = totalPrice >= 500000 ? 0 : 30000;
  const total = totalPrice + shipping;

  const handleOrder = async () => {
    if (!isAuthenticated) { navigate('/login', { state: { from: '/cart' } }); return; }
    if (!form.name || !form.phone || !form.address) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng'); return;
    }
    setPlacing(true);
    try {
      await axios.post('/api/orders', {
        items: items.map(i => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color
        })),
        address: form.address,
        phone: form.phone
      });
      clearCart();
      setSuccess(true);
    } catch (e) {
      alert('Đặt hàng thất bại, vui lòng thử lại');
    } finally {
      setPlacing(false);
    }
  };

  if (success) {
    return (
      <div className="cart-page page-wrapper">
        <div className="container">
          <div className="order-success">
            <div className="success-icon"><i className="fa-solid fa-circle-check" style={{color: '#43c6ac'}}></i></div>
            <h2>Đặt Hàng Thành Công!</h2>
            <p>Cảm ơn bạn đã mua sắm tại LUXE. Chúng tôi sẽ liên hệ xác nhận sớm nhất.</p>
            <div className="success-actions">
              <Link to="/" className="btn btn-primary btn-lg">Về trang chủ</Link>
              <Link to="/shop" className="btn btn-outline btn-lg">Tiếp tục mua sắm</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-page page-wrapper">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: '120px' }}>
            <div className="empty-state-icon"><i className="fa-solid fa-bag-shopping"></i></div>
            <h3>Giỏ hàng của bạn đang trống</h3>
            <p>Hãy khám phá bộ sưu tập thời trang của chúng tôi</p>
            <Link to="/shop" className="btn btn-primary btn-lg">Mua Sắm Ngay</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page-wrapper">
      <div className="container">
        <h1 className="cart-page-title">Giỏ Hàng <span>({totalItems} sản phẩm)</span></h1>
        <div className="cart-page-layout">
          {/* Items */}
          <div className="cart-items-section">
            <div className="cart-items-header">
              <span>Sản phẩm</span>
              <span>Giá</span>
              <span>Số lượng</span>
              <span>Tổng</span>
              <span />
            </div>
            {items.map(item => (
              <div key={item.id} className="cart-page-item">
                <div className="cpi-product">
                  <img src={item.image} alt={item.name} className="cpi-img" />
                  <div>
                    <p className="cpi-name">{item.name}</p>
                    <p className="cpi-variant">{item.size} · {item.color}</p>
                  </div>
                </div>
                <span className="cpi-price">{formatPrice(item.price)}</span>
                <div className="cpi-qty">
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <span className="cpi-total">{formatPrice(item.price * item.quantity)}</span>
                <button className="cpi-remove" onClick={() => removeItem(item.id)}><i className="fa-solid fa-xmark"></i></button>
              </div>
            ))}
          </div>

          {/* Summary + Checkout */}
          <div className="cart-summary">
            <h3>Thông Tin Đặt Hàng</h3>
            <div className="order-form">
              <div className="form-group">
                <label className="form-label">Họ tên *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  id="order-name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại *</label>
                <input
                  className="form-input"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="0901234567"
                  id="order-phone"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ giao hàng *</label>
                <textarea
                  className="form-input"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  rows={3}
                  id="order-address"
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div className="summary-breakdown">
              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span className={shipping === 0 ? 'free-shipping' : ''}>
                  {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="shipping-notice">
                  Mua thêm {formatPrice(500000 - totalPrice)} để miễn phí vận chuyển
                </p>
              )}
              <div className="summary-divider" />
              <div className="summary-total">
                <span>Tổng cộng</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleOrder}
              disabled={placing}
              id="place-order-btn"
            >
              {placing ? <><i className="fa-solid fa-spinner fa-spin"></i> Đang đặt hàng...</> : isAuthenticated ? <><i className="fa-solid fa-check"></i> Đặt Hàng Ngay</> : <><i className="fa-solid fa-lock"></i> Đăng nhập để đặt hàng</>}
            </button>

            <div className="security-badges">
              <span><i className="fa-solid fa-lock"></i> Thanh toán an toàn</span>
              <span><i className="fa-solid fa-rotate-right"></i> Đổi trả 30 ngày</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
