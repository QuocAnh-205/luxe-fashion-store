import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './Admin.css';

const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState('');

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);
      const res = await axios.get(`/api/admin/users?${params.toString()}`);
      setUsers(res.data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search, filterStatus]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(''), 3000);
  };

  const handleToggleBan = async (user) => {
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    try {
      await axios.put(`/api/admin/users/${user.id}`, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      showToast(`${newStatus === 'banned' ? 'Đã khóa' : 'Đã mở khóa'} tài khoản ${user.name}`);
    } catch (e) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${user.name}"?`)) return;
    try {
      await axios.delete(`/api/admin/users/${user.id}`);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      showToast(`Đã xóa tài khoản ${user.name}`);
      setSelectedUser(null);
    } catch (e) {
      showToast(e.response?.data?.message || 'Không thể xóa', 'error');
    }
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      await axios.put(`/api/admin/users/${user.id}`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      showToast(`Đã cập nhật vai trò cho ${user.name}`);
    } catch (e) {
      showToast(e.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  return (
    <AdminLayout>
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : '⚠️'} {toast.msg}</span>
          </div>
        </div>
      )}

      <div className="admin-header">
        <div>
          <h1 className="admin-page-title">Quản Lý Người Dùng</h1>
          <p className="admin-page-subtitle">{users.length} tài khoản trong hệ thống</p>
        </div>
      </div>

      <div className="admin-content">
        {/* Toolbar */}
        <div className="admin-table-wrapper" style={{ marginBottom: 24 }}>
          <div style={{ padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="admin-search">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Tìm theo tên, email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="user-search"
              />
            </div>
            <select
              className="form-input"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ width: 'auto', padding: '10px 14px' }}
              id="user-status-filter"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="banned">Đã khóa</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 340px' : '1fr', gap: 24 }}>
          {/* Table */}
          <div className="admin-table-wrapper">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày đăng ký</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div className="spinner" style={{ margin: '0 auto' }} />
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        Không tìm thấy người dùng
                      </td>
                    </tr>
                  ) : users.map(user => (
                    <tr
                      key={user.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedUser(user.id === selectedUser?.id ? null : user)}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={user.avatar}
                            alt={user.name}
                            style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border-gold)' }}
                          />
                          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-gold' : 'badge-gray'}`}>
                          {user.role === 'admin' ? '⚙️ Admin' : '👤 User'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                          {user.status === 'active' ? '● Hoạt động' : '● Đã khóa'}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="action-btns">
                          <button
                            className={`action-btn btn ${user.status === 'banned' ? 'btn-ghost' : 'btn-danger'}`}
                            onClick={() => handleToggleBan(user)}
                            id={`ban-user-${user.id}`}
                          >
                            {user.status === 'banned' ? '✓ Mở khóa' : '🔒 Khóa'}
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              className="action-btn btn btn-danger"
                              onClick={() => handleDelete(user)}
                              id={`delete-user-${user.id}`}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Detail Panel */}
          {selectedUser && (
            <div className="admin-table-wrapper" style={{ height: 'fit-content', position: 'sticky', top: 24 }}>
              <div className="admin-table-header">
                <h3>Chi tiết người dùng</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedUser(null)}>✕</button>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid var(--gold)', margin: '0 auto 12px' }}
                  />
                  <h3 style={{ fontSize: 18, marginBottom: 4 }}>{selectedUser.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{selectedUser.email}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'ID', value: selectedUser.id.slice(0, 12) + '...' },
                    { label: 'Điện thoại', value: selectedUser.phone || 'Chưa cập nhật' },
                    { label: 'Địa chỉ', value: selectedUser.address || 'Chưa cập nhật' },
                    { label: 'Đăng ký', value: formatDate(selectedUser.createdAt) },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{item.label}:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Đổi vai trò:</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className={`btn btn-sm ${selectedUser.role === 'user' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => handleRoleChange(selectedUser, 'user')}
                    >
                      User
                    </button>
                    <button
                      className={`btn btn-sm ${selectedUser.role === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => handleRoleChange(selectedUser, 'admin')}
                    >
                      Admin
                    </button>
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

export default Users;
