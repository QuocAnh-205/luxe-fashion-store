import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './Admin.css';

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('vi-VN');
};

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

const emptyUserForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  role: 'user',
  status: 'active'
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState([]);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [toast, setToast] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState(emptyUserForm);
  const [editUserId, setEditUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(''), 3500);
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);
      if (filterRole) params.set('role', filterRole);

      const res = await axios.get(`/api/admin/users?${params.toString()}`);
      setUsers(res.data.users || []);
    } catch (e) {
      console.error(e);
      showToast('Không thể tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, filterStatus, filterRole]);

  // View user details
  const handleSelectUser = async (user) => {
    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
      setSelectedUserOrders([]);
      return;
    }
    setSelectedUser(user);
    setLoadingUserDetail(true);
    try {
      const res = await axios.get(`/api/admin/users/${user.id}`);
      setSelectedUserOrders(res.data.orders || []);
    } catch (err) {
      setSelectedUserOrders([]);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  // Toggle Ban / Unban
  const handleToggleBan = async (user, e) => {
    e.stopPropagation();
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    try {
      await axios.put(`/api/admin/users/${user.id}`, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => ({ ...prev, status: newStatus }));
      }
      showToast(`${newStatus === 'banned' ? 'Đã khóa' : 'Đã mở khóa'} tài khoản ${user.name}`);
    } catch (e) {
      showToast('Có lỗi xảy ra khi cập nhật trạng thái', 'error');
    }
  };

  // Delete User
  const handleDelete = async (user, e) => {
    e.stopPropagation();
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.name}" (${user.email})?`)) return;
    try {
      await axios.delete(`/api/admin/users/${user.id}`);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      if (selectedUser?.id === user.id) setSelectedUser(null);
      showToast(`Đã xóa vĩnh viễn tài khoản ${user.name}`);
    } catch (e) {
      showToast(e.response?.data?.message || 'Không thể xóa tài khoản', 'error');
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData(emptyUserForm);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (user, e) => {
    if (e) e.stopPropagation();
    setEditUserId(user.id);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Leave blank unless changing
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'user',
      status: user.status || 'active'
    });
    setShowEditModal(true);
  };

  // Submit Add User
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/admin/users', formData);
      showToast(`Đã tạo tài khoản cho ${formData.name}`);
      setShowAddModal(false);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể tạo tài khoản', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit User
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: formData.role,
        status: formData.status
      };
      if (formData.password && formData.password.trim()) {
        payload.newPassword = formData.password.trim();
      }
      await axios.put(`/api/admin/users/${editUserId}`, payload);
      showToast('Cập nhật thông tin người dùng thành công');
      setShowEditModal(false);
      fetchUsers();
      if (selectedUser?.id === editUserId) {
        setSelectedUser(prev => ({ ...prev, ...payload }));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể cập nhật thông tin', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Counts
  const totalActive = users.filter(u => u.status === 'active').length;
  const totalBanned = users.filter(u => u.status === 'banned').length;
  const totalAdminCount = users.filter(u => u.role === 'admin').length;

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
          <h1 className="admin-page-title">Quản Lý Người Dùng & Khách Hàng</h1>
          <p className="admin-page-subtitle">Xem thông tin khách hàng, phân quyền quản trị, lịch sử chi tiêu và trạng thái tài khoản</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} id="add-user-btn">
          <i className="fa-solid fa-user-plus"></i> + Thêm Người Dùng
        </button>
      </div>

      <div className="admin-content">
        {/* KPI mini cards */}
        <div className="stats-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card" style={{ '--stat-color': 'var(--gold)', padding: 18 }}>
            <div className="stat-label">Tổng Tài Khoản</div>
            <div className="stat-value" style={{ fontSize: 24 }}>{users.length}</div>
            <div className="stat-change" style={{ color: 'var(--text-secondary)' }}>Trong hệ thống</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': 'var(--success)', padding: 18 }}>
            <div className="stat-label">Đang Hoạt Động</div>
            <div className="stat-value" style={{ fontSize: 24, color: 'var(--success)' }}>{totalActive}</div>
            <div className="stat-change" style={{ color: 'var(--success)' }}>Đủ điều kiện mua sắm</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': 'var(--error)', padding: 18 }}>
            <div className="stat-label">Tài Khoản Đã Khóa</div>
            <div className="stat-value" style={{ fontSize: 24, color: 'var(--error)' }}>{totalBanned}</div>
            <div className="stat-change" style={{ color: 'var(--error)' }}>Tạm ngưng truy cập</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': 'var(--violet-light)', padding: 18 }}>
            <div className="stat-label">Quản Trị Viên (Admin)</div>
            <div className="stat-value" style={{ fontSize: 24, color: 'var(--violet-light)' }}>{totalAdminCount}</div>
            <div className="stat-change" style={{ color: 'var(--violet-light)' }}>Toàn quyền hệ thống</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="admin-table-wrapper" style={{ marginBottom: 20 }}>
          <div style={{ padding: '16px 20px', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 280, flexWrap: 'wrap' }}>
              <div className="admin-search" style={{ flex: 1, minWidth: 240 }}>
                <span><i className="fa-solid fa-magnifying-glass"></i></span>
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, số điện thoại..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  id="user-search"
                />
              </div>
              <select
                className="form-input"
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                style={{ width: 'auto', padding: '10px 14px' }}
              >
                <option value="">Tất cả vai trò</option>
                <option value="user">Khách hàng (User)</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </select>
              <select
                className="form-input"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{ width: 'auto', padding: '10px 14px' }}
                id="user-status-filter"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="banned">Đã khóa</option>
              </select>
            </div>
            {(search || filterRole || filterStatus) && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setSearch(''); setFilterRole(''); setFilterStatus(''); }}
              >
                <i className="fa-solid fa-xmark"></i> Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Content split if user is selected */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 380px' : '1fr', gap: 24 }}>
          {/* Table */}
          <div className="admin-table-wrapper">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Khách hàng / Thành viên</th>
                    <th>Liên hệ & Địa chỉ</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Đơn mua / Chi tiêu</th>
                    <th>Ngày tham gia</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div className="spinner" style={{ margin: '0 auto' }} />
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-user-slash" style={{ fontSize: 32, marginBottom: 8, display: 'block', opacity: 0.5 }}></i>
                        Không tìm thấy người dùng phù hợp
                      </td>
                    </tr>
                  ) : users.map(user => {
                    const isSelected = selectedUser?.id === user.id;
                    return (
                      <tr
                        key={user.id}
                        style={{
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(201, 168, 76, 0.08)' : undefined
                        }}
                        onClick={() => handleSelectUser(user)}
                        title="Bấm để xem lịch sử đơn hàng và chi tiết"
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                              src={user.avatar}
                              alt={user.name}
                              style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border-gold)', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                                {user.name}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                            <i className="fa-solid fa-phone" style={{ fontSize: 10, color: 'var(--gold)', marginRight: 4 }}></i>
                            {user.phone || 'Chưa cập nhật'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.address}>
                            {user.address || 'Chưa có địa chỉ'}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${user.role === 'admin' ? 'badge-gold' : 'badge-gray'}`}>
                            {user.role === 'admin' ? <><i className="fa-solid fa-shield-halved"></i> Admin</> : <><i className="fa-regular fa-user"></i> Khách hàng</>}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${user.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                            {user.status === 'active' ? '● Hoạt động' : '● Đã khóa'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--gold)' }}>{formatPrice(user.totalSpent)}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.orderCount || 0} đơn hàng</div>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDate(user.createdAt)}</td>
                        <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                          <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                            <button
                              className="action-btn btn btn-ghost btn-sm"
                              onClick={(e) => openEditModal(user, e)}
                              title="Chỉnh sửa thông tin"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button
                              className={`action-btn btn btn-sm ${user.status === 'banned' ? 'btn-outline' : 'btn-ghost'}`}
                              onClick={(e) => handleToggleBan(user, e)}
                              style={{ color: user.status === 'banned' ? 'var(--success)' : 'var(--warning)' }}
                              title={user.status === 'banned' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            >
                              {user.status === 'banned' ? <i className="fa-solid fa-unlock"></i> : <i className="fa-solid fa-lock"></i>}
                            </button>
                            {user.role !== 'admin' && (
                              <button
                                className="action-btn btn btn-danger btn-sm"
                                onClick={(e) => handleDelete(user, e)}
                                title="Xóa tài khoản"
                              >
                                <i className="fa-regular fa-trash-can"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Details Drawer */}
          {selectedUser && (
            <div className="admin-table-wrapper" style={{ height: 'fit-content', position: 'sticky', top: 24 }}>
              <div className="admin-table-header">
                <h3><i className="fa-solid fa-id-card" style={{ color: 'var(--gold)' }}></i> Hồ Sơ Thành Viên</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedUser(null)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div style={{ padding: 22 }}>
                <div style={{ textAlign: 'center', marginBottom: 18 }}>
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid var(--gold)', margin: '0 auto 10px', objectFit: 'cover' }}
                  />
                  <h3 style={{ fontSize: 17, marginBottom: 2 }}>{selectedUser.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{selectedUser.email}</p>
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 6 }}>
                    <span className={`badge ${selectedUser.role === 'admin' ? 'badge-gold' : 'badge-gray'}`}>
                      {selectedUser.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                    </span>
                    <span className={`badge ${selectedUser.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                      {selectedUser.status === 'active' ? 'Đang hoạt động' : 'Tài khoản bị khóa'}
                    </span>
                  </div>
                </div>

                <div className="detail-info-list" style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div className="detail-item">
                    <span className="detail-label">Số điện thoại:</span>
                    <span className="detail-val">{selectedUser.phone || 'Chưa cung cấp'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Địa chỉ:</span>
                    <span className="detail-val" style={{ textAlign: 'right', maxWidth: '60%' }}>{selectedUser.address || 'Chưa cung cấp'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày đăng ký:</span>
                    <span className="detail-val">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tổng chi tiêu:</span>
                    <span className="detail-val" style={{ color: 'var(--gold)', fontWeight: 700 }}>
                      {formatPrice(selectedUser.totalSpent)}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600 }}>Lịch sử đơn mua ({selectedUserOrders.length})</h4>
                  </div>
                  {loadingUserDetail ? (
                    <div style={{ textAlign: 'center', padding: 20 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                  ) : selectedUserOrders.length === 0 ? (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Chưa có đơn đặt hàng nào.</p>
                  ) : (
                    <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedUserOrders.map(order => (
                        <div key={order.id} style={{
                          padding: '8px 12px',
                          background: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          fontSize: 12
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <strong style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>#{order.id.slice(0, 8)}</strong>
                            <span style={{ fontWeight: 600 }}>{formatPrice(order.total)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                            <span>{formatDate(order.createdAt)}</span>
                            <span>{order.items?.length} sản phẩm</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={(e) => openEditModal(selectedUser, e)}>
                    <i className="fa-solid fa-pen"></i> Chỉnh sửa
                  </button>
                  <button
                    className={`btn btn-sm ${selectedUser.status === 'banned' ? 'btn-primary' : 'btn-danger'}`}
                    style={{ flex: 1 }}
                    onClick={(e) => handleToggleBan(selectedUser, e)}
                  >
                    {selectedUser.status === 'banned' ? 'Mở khóa' : 'Khóa nick'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Thêm Người Dùng Mới */}
      {showAddModal && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20 }}><i className="fa-solid fa-user-plus" style={{ color: 'var(--gold)' }}></i> Thêm Người Dùng Mới</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Họ và tên *</label>
                <input
                  className="form-input"
                  required
                  placeholder="VD: Nguyễn Văn Nam"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Email đăng nhập *</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mật khẩu khởi tạo *</label>
                  <input
                    type="password"
                    className="form-input"
                    required
                    placeholder="Ít nhất 6 ký tự"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    className="form-input"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Vai trò hệ thống</label>
                  <select
                    className="form-input"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="user">Khách hàng (User)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Địa chỉ</label>
                <input
                  className="form-input"
                  placeholder="Địa chỉ giao hàng mặc định"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Trạng thái tài khoản</label>
                <select
                  className="form-input"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Hoạt động bình thường</option>
                  <option value="banned">Khóa tài khoản</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chỉnh Sửa Thông Tin Người Dùng */}
      {showEditModal && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20 }}><i className="fa-solid fa-user-pen" style={{ color: 'var(--gold)' }}></i> Cập Nhật Người Dùng</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Họ và tên *</label>
                <input
                  className="form-input"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    className="form-input"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Vai trò</label>
                  <select
                    className="form-input"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="user">Khách hàng (User)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select
                    className="form-input"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Hoạt động bình thường</option>
                    <option value="banned">Đã khóa tài khoản</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Địa chỉ</label>
                <input
                  className="form-input"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8, border: '1px dashed var(--border-gold)' }}>
                <label className="form-label" style={{ color: 'var(--gold)' }}>
                  <i className="fa-solid fa-key"></i> Đặt lại mật khẩu mới (Bỏ trống nếu không đổi)
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Nhập mật khẩu mới cho tài khoản"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Đóng</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Users;
