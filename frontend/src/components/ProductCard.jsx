import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const getDiscount = (price, original) =>
  Math.round(((original - price) / original) * 100);

const Stars = ({ rating }) => (
  <div className="stars">
    {[1,2,3,4,5].map(i => (
      <i key={i} className={`fa-solid fa-star star ${i <= Math.round(rating) ? '' : 'empty'}`}></i>
    ))}
  </div>
);

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const [imageIdx, setImageIdx] = useState(0);
  const [adding, setAdding] = useState(false);

  const discount = product.originalPrice
    ? getDiscount(product.price, product.originalPrice) : 0;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addItem(product, product.sizes?.[0] || 'M', product.colors?.[0] || 'Default');
    setTimeout(() => setAdding(false), 1000);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      {/* Image */}
      <div
        className="product-image-wrapper"
        onMouseEnter={() => product.images?.[1] && setImageIdx(1)}
        onMouseLeave={() => setImageIdx(0)}
      >
        <img
          src={product.images?.[imageIdx] || product.images?.[0]}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />

        {/* Badges */}
        <div className="product-badges">
          {product.newArrival && <span className="badge badge-gold">Mới</span>}
          {discount > 0 && <span className="badge badge-red">-{discount}%</span>}
          {product.featured && <span className="badge badge-blue">Hot</span>}
        </div>

        {/* Quick Add */}
        <div className="product-actions">
          <button
            className={`btn btn-primary quick-add ${adding ? 'adding' : ''}`}
            onClick={handleQuickAdd}
            id={`quick-add-${product.id}`}
          >
            {adding ? <><i className="fa-solid fa-check"></i> Đã thêm</> : <><i className="fa-solid fa-bag-shopping"></i> Thêm nhanh</>}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>

        <div className="product-rating">
          <Stars rating={product.rating} />
          <span className="rating-count">({product.reviews})</span>
        </div>

        <div className="price-group">
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="price-original">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="product-colors">
            {product.colors.slice(0, 4).map(c => (
              <span key={c} className="color-dot" title={c} />
            ))}
            {product.colors.length > 4 && (
              <span className="color-more">+{product.colors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
