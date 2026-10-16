import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './Admin.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

const formatDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
};

const statusConfig = {
  pending: { label: 'Chờ xử lý', badge: 'badge-gold', icon: 'fa-hourglass-half', color: '#ffc700' },
  shipping: { label: 'Đang giao', badge: 'badge-blue', icon: 'fa-truck', color: '#38bdf8' },
  delivered: { label: 'Đã giao', badge: 'badge-green', icon: 'fa-check', color: '#50cd89' },
  cancelled: { label: 'Đã hủy', badge: 'badge-red', icon: 'fa-xmark', color: '#f1416c' },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState('');

  // Modals & States
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (search) params.set('search', search);

      const res = await axios.get(`/api/admin/orders?${params.toString()}`);
      setOrders(res.data.orders || []);
      if (selectedOrder) {
        const updated = (res.data.orders || []).find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (e) {
      console.error(e);
      showToast('Không thể tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, search]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(''), 3500);
  };

  // Change order status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      showToast(`Đã chuyển đơn #${orderId.slice(0, 8)} sang "${statusConfig[newStatus]?.label}"`);
    } catch (e) {
      showToast('Có lỗi xảy ra khi cập nhật', 'error');
    }
  };

  // Save internal admin notes
  const handleSaveAdminNote = async () => {
    if (!selectedOrder) return;
    setSavingNote(true);
    try {
      await axios.put(`/api/admin/orders/${selectedOrder.id}`, { adminNotes: adminNoteInput });
      setSelectedOrder(prev => ({ ...prev, adminNotes: adminNoteInput }));
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, adminNotes: adminNoteInput } : o));
      showToast('Đã lưu ghi chú nội bộ');
    } catch (err) {
      showToast('Lỗi khi lưu ghi chú', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  // Save shipping address update
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await axios.put(`/api/admin/orders/${selectedOrder.id}`, {
        address: editAddress,
        phone: editPhone
      });
      setSelectedOrder(prev => ({ ...prev, address: editAddress, phone: editPhone }));
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, address: editAddress, phone: editPhone } : o));
      showToast('Đã cập nhật thông tin giao hàng');
      setShowEditAddressModal(false);
    } catch (err) {
      showToast('Lỗi khi cập nhật địa chỉ', 'error');
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${orderId}? Thao tác này không thể hoàn tác.`)) return;
    try {
      await axios.delete(`/api/admin/orders/${orderId}`);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      showToast('Đã xóa đơn hàng thành công');
    } catch (err) {
      showToast('Không thể xóa đơn hàng', 'error');
    }
  };

  const handleSelectOrder = (order) => {
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(null);
    } else {
      setSelectedOrder(order);
      setAdminNoteInput(order.adminNotes || '');
    }
  };

  // Counts for tabs
  const allOrdersCount = orders.length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const shippingCount = orders.filter(o => o.status === 'shipping').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <AdminLayout>
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>
              {toast.type === 'success' ? <i className="fa-solid fa-circle-check"></i> : <i className="fa-solid fa-triangle-exclamation"></i>}
              {' '}{toast.msg}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-page-title">Quản Lý Đơn Hàng & Vận Chuyển</h1>
          <p className="admin-page-subtitle">Kiểm soát đơn đặt hàng, tiến độ giao hàng, in ấn phiếu xuất kho và hóa đơn bán lẻ</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={fetchOrders} title="Làm mới">
            <i className="fa-solid fa-arrows-rotate"></i> Làm mới
          </button>
        </div>
      </div>

      <div className="admin-content">
        {/* KPI Summary Cards */}
        <div className="stats-grid" style={{ marginBottom: 20, gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <div className="stat-card" style={{ '--stat-color': 'var(--gold)', padding: 18 }}>
            <div className="stat-label">Tổng Đơn Hàng</div>
            <div className="stat-value" style={{ fontSize: 24 }}>{allOrdersCount}</div>
            <div className="stat-change" style={{ color: 'var(--gold)' }}>{formatPrice(totalRevenue)}</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': 'var(--warning)', padding: 18 }}>
            <div className="stat-label">Chờ Xử Lý</div>
            <div className="stat-value" style={{ fontSize: 24, color: 'var(--warning)' }}>{pendingCount}</div>
            <div className="stat-change" style={{ color: 'var(--warning)' }}>Cần xác nhận</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': '#38bdf8', padding: 18 }}>
            <div className="stat-label">Đang Vận Chuyển</div>
            <div className="stat-value" style={{ fontSize: 24, color: '#38bdf8' }}>{shippingCount}</div>
            <div className="stat-change" style={{ color: '#38bdf8' }}>Đang trên đường giao</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': 'var(--success)', padding: 18 }}>
            <div className="stat-label">Đã Giao Thành Công</div>
            <div className="stat-value" style={{ fontSize: 24, color: 'var(--success)' }}>{deliveredCount}</div>
            <div className="stat-change" style={{ color: 'var(--success)' }}>Hoàn tất thu tiền</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': 'var(--error)', padding: 18 }}>
            <div className="stat-label">Đơn Bị Hủy</div>
            <div className="stat-value" style={{ fontSize: 24, color: 'var(--error)' }}>{cancelledCount}</div>
            <div className="stat-change" style={{ color: 'var(--error)' }}>Đã hoàn hàng / hủy</div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="admin-table-wrapper" style={{ marginBottom: 20 }}>
          <div style={{ padding: '14px 20px', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search */}
            <div className="admin-search" style={{ minWidth: 280, flex: 1 }}>
              <span><i className="fa-solid fa-magnifying-glass"></i></span>
              <input
                type="text"
                placeholder="Tìm theo mã đơn (#ORD...), tên khách, SĐT, địa chỉ..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Status Tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { key: '', label: 'Tất cả' },
                { key: 'pending', label: 'Chờ xử lý', color: 'var(--warning)' },
                { key: 'shipping', label: 'Đang giao', color: '#38bdf8' },
                { key: 'delivered', label: 'Đã giao', color: 'var(--success)' },
                { key: 'cancelled', label: 'Đã hủy', color: 'var(--error)' },
              ].map(tab => (
                <button
                  key={tab.key || 'all'}
                  className={`btn btn-sm ${filterStatus === tab.key ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setFilterStatus(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 420px' : '1fr', gap: 24 }}>
          {/* Table */}
          <div className="admin-table-wrapper">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng & SĐT</th>
                    <th>Chi tiết sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Chuyển trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>
                        <div className="spinner" style={{ margin: '0 auto' }} />
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-box-open" style={{ fontSize: 32, marginBottom: 8, display: 'block', opacity: 0.5 }}></i>
                        Không có đơn hàng nào phù hợp
                      </td>
                    </tr>
                  ) : orders.map(order => {
                    const sc = statusConfig[order.status] || { label: order.status, badge: 'badge-gray' };
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                      <tr
                        key={order.id}
                        onClick={() => handleSelectOrder(order)}
                        style={{
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(201, 168, 76, 0.08)' : undefined
                        }}
                        title="Bấm để xem chi tiết đơn hàng"
                      >
                        <td>
                          <span style={{ fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 700, fontSize: 13 }}>
                            #{order.id}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.userName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            <i className="fa-solid fa-phone" style={{ fontSize: 9, marginRight: 3 }}></i>
                            {order.phone || order.userPhone || 'Chưa có SĐT'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                            <strong>{order.items?.length || 0}</strong> món hàng
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {order.items?.map(it => it.name).join(', ')}
                          </div>
                        </td>
                        <td>
                          <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 14 }}>
                            {formatPrice(order.total)}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-gray" style={{ fontSize: 11 }}>
                            {order.paymentMethod || 'COD'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {formatDate(order.createdAt)}
                        </td>
                        <td>
                          <span className={`badge ${sc.badge}`}>
                            ● {sc.label}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                          <select
                            className="form-input quick-status-select"
                            style={{ padding: '6px 10px', fontSize: 12, width: 'auto', display: 'inline-block' }}
                            value={order.status}
                            onChange={e => handleStatusChange(order.id, e.target.value)}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="shipping">Đang giao</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Details Drawer */}
          {selectedOrder && (
            <div className="admin-table-wrapper" style={{ height: 'fit-content', position: 'sticky', top: 20 }}>
              <div className="admin-table-header">
                <div>
                  <h3 style={{ fontSize: 16 }}>Đơn Hàng #{selectedOrder.id}</h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowPrintModal(true)}
                    title="In hóa đơn bán lẻ"
                  >
                    <i className="fa-solid fa-print"></i> In
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrder(null)}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>

              <div style={{ padding: 20 }}>
                {/* Status bar */}
                <div style={{
                  padding: '12px 16px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>TRẠNG THÁI HIỆN TẠI</span>
                    <span className={`badge ${statusConfig[selectedOrder.status]?.badge}`} style={{ marginTop: 4 }}>
                      ● {statusConfig[selectedOrder.status]?.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {selectedOrder.status === 'pending' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleStatusChange(selectedOrder.id, 'shipping')}
                      >
                        <i className="fa-solid fa-truck"></i> Giao hàng
                      </button>
                    )}
                    {selectedOrder.status === 'shipping' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                      >
                        <i className="fa-solid fa-check"></i> Đã giao
                      </button>
                    )}
                    {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)' }}>
                      <i className="fa-solid fa-location-dot"></i> ĐỊA CHỈ NHẬN HÀNG
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '2px 8px', fontSize: 11 }}
                      onClick={() => {
                        setEditAddress(selectedOrder.address || '');
                        setEditPhone(selectedOrder.phone || '');
                        setShowEditAddressModal(true);
                      }}
                    >
                      <i className="fa-solid fa-pen"></i> Sửa địa chỉ
                    </button>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedOrder.userName}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
                      <i className="fa-solid fa-phone" style={{ fontSize: 10, marginRight: 4, color: 'var(--gold)' }}></i>
                      {selectedOrder.phone || 'Chưa có SĐT'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{selectedOrder.address || 'Chưa cung cấp địa chỉ'}</div>
                    {selectedOrder.notes && (
                      <div style={{ marginTop: 6, fontStyle: 'italic', color: 'var(--warning)', fontSize: 12 }}>
                        "Ghi chú: {selectedOrder.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', display: 'block', marginBottom: 8 }}>
                    <i className="fa-solid fa-bag-shopping"></i> SẢN PHẨM ĐÃ ĐẶT ({selectedOrder.items?.length})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 10px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 13
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Phân loại: {item.size} · {item.color} · SL: <strong>x{item.quantity}</strong>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: '1px solid var(--border)',
                    fontWeight: 700
                  }}>
                    <span>Tổng tiền thanh toán:</span>
                    <span style={{ color: 'var(--gold)', fontSize: 17 }}>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Internal Admin Notes */}
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    <i className="fa-solid fa-note-sticky"></i> GHI CHÚ NỘI BỘ (ADMIN ONLY)
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="form-input"
                      placeholder="VD: Đã đóng gói, mã vận đơn VT123..."
                      value={adminNoteInput}
                      onChange={e => setAdminNoteInput(e.target.value)}
                      style={{ fontSize: 12 }}
                    />
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={handleSaveAdminNote}
                      disabled={savingNote}
                    >
                      {savingNote ? 'Lưu...' : 'Lưu'}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', justifyContent: 'space-between' }}>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                  >
                    <i className="fa-regular fa-trash-can"></i> Xóa đơn này
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowPrintModal(true)}
                  >
                    <i className="fa-solid fa-file-invoice"></i> Xem hóa đơn
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Chỉnh Sửa Địa Chỉ Giao Hàng */}
      {showEditAddressModal && selectedOrder && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Cập Nhật Địa Chỉ Nhận Hàng</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditAddressModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Số điện thoại nhận hàng *</label>
                <input
                  className="form-input"
                  required
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ giao hàng *</label>
                <textarea
                  className="form-input"
                  rows={3}
                  required
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowEditAddressModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: In Hóa Đơn / Xuất Hóa Đơn Chuẩn (Printable Invoice) */}
      {showPrintModal && selectedOrder && (
        <div className="overlay">
          <div className="modal printable-invoice-modal" style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontSize: 16 }}><i className="fa-solid fa-print"></i> Xem Bản In Hóa Đơn</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <i className="fa-solid fa-print"></i> In Hóa Đơn
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowPrintModal(false)}>
                  <i className="fa-solid fa-xmark"></i> Đóng
                </button>
              </div>
            </div>

            {/* Print Area */}
            <div className="invoice-container" style={{ background: '#fff', color: '#111', padding: 32, borderRadius: 8 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #d4af37', paddingBottom: 16, marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0, letterSpacing: 2 }}>LUXE FASHION</h1>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#555' }}>Thương hiệu Thời Trang Cao Cấp</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#555' }}>Hotline: 1900 8888 · contact@fashion.com</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#555' }}>123 Đồng Khởi, Q.1, TP. Hồ Chí Minh</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ fontSize: 20, color: '#d4af37', margin: 0 }}>HÓA ĐƠN BÁN HÀNG</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 13, fontFamily: 'monospace', fontWeight: 700 }}>#{selectedOrder.id}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#555' }}>Ngày lập: {formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24, fontSize: 13 }}>
                <div>
                  <strong style={{ color: '#888', display: 'block', fontSize: 11, marginBottom: 4 }}>NGƯỜI NHẬN HÀNG:</strong>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedOrder.userName}</div>
                  <div>SĐT: {selectedOrder.phone || 'Chưa cung cấp'}</div>
                  <div>Địa chỉ: {selectedOrder.address}</div>
                </div>
                <div>
                  <strong style={{ color: '#888', display: 'block', fontSize: 11, marginBottom: 4 }}>THÔNG TIN ĐƠN:</strong>
                  <div>Thanh toán: <strong>{selectedOrder.paymentMethod || 'COD'}</strong></div>
                  <div>Trạng thái: <strong>{statusConfig[selectedOrder.status]?.label}</strong></div>
                  {selectedOrder.notes && <div>Ghi chú: {selectedOrder.notes}</div>}
                </div>
              </div>

              {/* Products Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>STT</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Tên sản phẩm</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Phân loại</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>SL</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Đơn giá</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px 10px' }}>{idx + 1}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: '#666' }}>{item.size} / {item.color}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatPrice(item.price)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 30 }}>
                <div style={{ width: 260, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>Tạm tính:</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>Phí vận chuyển:</span>
                    <span style={{ color: '#16a34a' }}>Miễn phí</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #111', fontWeight: 800, fontSize: 16 }}>
                    <span>TỔNG CỘNG:</span>
                    <span style={{ color: '#d4af37' }}>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'center', marginTop: 40, fontSize: 12 }}>
                <div>
                  <strong>Người Mua Hàng</strong>
                  <p style={{ color: '#888', margin: '4px 0 50px' }}>(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <strong>Đại Diện LUXE Fashion</strong>
                  <p style={{ color: '#888', margin: '4px 0 50px' }}>(Ký và đóng dấu)</p>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#888', borderTop: '1px dashed #ccc', paddingTop: 10 }}>
                Cảm ơn quý khách đã tin tưởng mua sắm tại LUXE Fashion! Hotline hỗ trợ: 1900 8888
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Orders;
