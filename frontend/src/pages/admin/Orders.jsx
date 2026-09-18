import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './Admin.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

const statusConfig = {
  pending: { label: 'Chờ xử lý', badge: 'badge-gold', icon: '⏳' },
  shipping: { label: 'Đang giao', badge: 'badge-blue', icon: '🚚' },
  delivered: { label: 'Đã giao', badge: 'badge-green', icon: '✓' },
  cancelled: { label: 'Đã hủy', badge: 'badge-red', icon: '✕' },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState('');

  const fetchOrders = async () => {
    const params = filterStatus ? `?status=${filterStatus}` : '';
    const res = await axios.get(`/api/admin/orders${params}`);
    setOrders(res.data.orders);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      showToast('Đã cập nhật trạng thái đơn hàng');
    } catch (e) {
      showToast('Có lỗi xảy ra');
    }
  };

  return (
    <AdminLayout>
      {toast && (
        <div className="toast-container">
          <div className="toast success"><span>✓ {toast}</span></div>
        </div>
      )}

      <div className="admin-header">
        <div>
          <h1 className="admin-page-title">Quản Lý Đơn Hàng</h1>
          <p className="admin-page-subtitle">{orders.length} đơn hàng</p>
        </div>
      </div>

      <div className="admin-content">
        {/* Filter */}
        <div className="admin-table-wrapper" style={{ marginBottom: 20 }}>
          <div style={{ padding: '14px 20px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['', 'pending', 'shipping', 'delivered', 'cancelled'].map(s => (
              <button
                key={s || 'all'}
                className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilterStatus(s)}
                id={`order-filter-${s || 'all'}`}
              >
                {s ? statusConfig[s].icon + ' ' + statusConfig[s].label : '🔘 Tất cả'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 380px' : '1fr', gap: 24 }}>
          {/* Table */}
          <div className="admin-table-wrapper">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Ngày đặt</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                      <div className="spinner" style={{ margin: '0 auto' }} />
                    </td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      Không có đơn hàng
                    </td></tr>
                  ) : orders.map(order => {
                    const sc = statusConfig[order.status];
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order.id === selectedOrder?.id ? null : order)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{ fontFamily: 'monospace', color: 'var(--gold)', fontSize: 12 }}>
                          #{order.id.slice(0, 8)}
                        </td>
                        <td>
                          <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{order.userName}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.userEmail}</p>
                        </td>
                        <td>{order.items?.length} sản phẩm</td>
                        <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{formatPrice(order.total)}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td><span className={`badge ${sc?.badge}`}>{sc?.label}</span></td>
                        <td onClick={e => e.stopPropagation()}>
                          <select
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: 12, width: 'auto' }}
                            value={order.status}
                            onChange={e => handleStatusChange(order.id, e.target.value)}
                            id={`order-status-${order.id}`}
                          >
                            {Object.entries(statusConfig).map(([val, cfg]) => (
                              <option key={val} value={val}>{cfg.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Detail */}
          {selectedOrder && (
            <div className="admin-table-wrapper" style={{ height: 'fit-content', position: 'sticky', top: 24 }}>
              <div className="admin-table-header">
                <h3>Chi tiết đơn hàng</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrder(null)}>✕</button>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Mã đơn hàng:</p>
                  <p style={{ fontFamily: 'monospace', color: 'var(--gold)', fontSize: 13 }}>#{selectedOrder.id}</p>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Địa chỉ giao hàng:</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedOrder.address}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📞 {selectedOrder.phone}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Danh sách sản phẩm:</p>
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '10px 0', borderBottom: '1px solid var(--border)',
                      fontSize: 13
                    }}>
                      <div>
                        <p style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{item.size} · {item.color} · x{item.quantity}</p>
                      </div>
                      <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontWeight: 700 }}>
                    <span>Tổng cộng:</span>
                    <span style={{ color: 'var(--gold)', fontSize: 18 }}>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Orders;
