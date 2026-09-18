import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const CATEGORIES = ['Tất cả', 'Áo', 'Váy', 'Đầm', 'Quần', 'Set', 'Phụ kiện', 'Áo khoác'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const category = searchParams.get('category') || 'Tất cả';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category && category !== 'Tất cả') params.set('category', category);
        if (sort) params.set('sort', sort);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (search) params.set('search', search);
        if (searchParams.get('featured')) params.set('featured', 'true');
        if (searchParams.get('newArrival')) params.set('newArrival', 'true');

        const res = await axios.get(`/api/products?${params.toString()}`);
        setProducts(res.data.products);
        setTotal(res.data.total);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, sort, minPrice, maxPrice, search, searchParams]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'Tất cả' || !value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(e.target.search.value);
  };

  return (
    <div className="shop-page page-wrapper">
      {/* Header */}
      <div className="shop-header">
        <div className="container">
          <h1 className="shop-title">Bộ Sưu Tập</h1>
          <p className="shop-subtitle">Khám phá {total} sản phẩm thời trang cao cấp</p>

          {/* Search */}
          <form className="shop-search" onSubmit={handleSearch} id="shop-search-form">
            <input
              type="text"
              name="search"
              placeholder="Tìm kiếm sản phẩm..."
              className="search-input"
              id="search-input"
              defaultValue={search}
            />
            <button type="submit" className="btn btn-primary search-btn" id="search-submit">
              🔍 Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      <div className="container shop-layout">
        {/* Sidebar Filters */}
        <aside className="filter-sidebar">
          <div className="filter-section">
            <h3 className="filter-title">Danh Mục</h3>
            <ul className="filter-list">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button
                    className={`filter-btn ${(category === cat || (cat === 'Tất cả' && !searchParams.get('category'))) ? 'active' : ''}`}
                    onClick={() => setParam('category', cat)}
                    id={`cat-filter-${cat}`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">Khoảng Giá</h3>
            <div className="price-range">
              <input
                type="number"
                placeholder="Từ (đ)"
                className="form-input price-input"
                id="min-price"
                value={minPrice}
                onChange={e => setParam('minPrice', e.target.value)}
              />
              <span className="price-sep">—</span>
              <input
                type="number"
                placeholder="Đến (đ)"
                className="form-input price-input"
                id="max-price"
                value={maxPrice}
                onChange={e => setParam('maxPrice', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">Sắp Xếp</h3>
            <ul className="filter-list">
              {SORT_OPTIONS.map(opt => (
                <li key={opt.value}>
                  <button
                    className={`filter-btn ${sort === opt.value ? 'active' : ''}`}
                    onClick={() => setParam('sort', opt.value)}
                    id={`sort-${opt.value}`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button
            className="btn btn-ghost btn-full"
            onClick={() => setSearchParams({})}
            id="clear-filters"
          >
            Xóa bộ lọc
          </button>
        </aside>

        {/* Products Grid */}
        <main className="products-area">
          <div className="products-toolbar">
            <p className="product-count">
              {loading ? 'Đang tải...' : `Hiển thị ${products.length} sản phẩm`}
            </p>
          </div>

          {loading ? (
            <div className="page-loader" style={{ minHeight: '400px' }}>
              <div className="spinner" />
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button className="btn btn-primary" onClick={() => setSearchParams({})}>
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
