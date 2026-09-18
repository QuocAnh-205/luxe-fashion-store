import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartSidebar.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const CartSidebar = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/cart');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="cart-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`cart-sidebar ${isOpen ? 'open' : ''}`} id="cart-sidebar">
        <div className="cart-header">
          <div>
            <h2 className="cart-title">Giỏ Hàng</h2>
            {totalItems > 0 && (
              <p className="cart-count">{totalItems} sản phẩm</p>
            )}
          </div>
          <button
            className="cart-close"
            onClick={() => setIsOpen(false)}
            id="cart-close-btn"
            aria-label="Đóng giỏ hàng"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍️</div>
              <h3>Giỏ hàng trống</h3>
              <p>Hãy khám phá bộ sưu tập của chúng tôi</p>
              <Link
                to="/shop"
                className="btn btn-primary"
                onClick={() => setIsOpen(false)}
              >
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-variant">
                    {item.size} · {item.color}
                  </p>
                  <p className="cart-item-price">{formatPrice(item.price)}</p>
                  <div className="cart-item-controls">
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Giảm"
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Tăng"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="cart-remove"
                      onClick={() => removeItem(item.id)}
                      aria-label="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>Tạm tính:</span>
              <span className="subtotal-price">{formatPrice(totalPrice)}</span>
            </div>
            <p className="cart-shipping">🚚 Miễn phí vận chuyển cho đơn &gt;500.000đ</p>
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleCheckout}
              id="checkout-btn"
            >
              Thanh Toán →
            </button>
            <button
              className="btn btn-ghost btn-full"
              onClick={() => setIsOpen(false)}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartSidebar;
