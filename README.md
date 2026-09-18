# 🌟 LUXE Fashion - Hệ Thống Website Thời Trang Cao Cấp

Website bán hàng thời trang hiện đại full-stack được xây dựng bằng **Node.js (Express)** và **React (Vite)**, tích hợp giao diện người dùng sang trọng, giỏ hàng, quản lý đơn hàng, xác thực người dùng và trang quản trị Admin.

---

## 🚀 Tính năng nổi bật

### 🛍️ Dành cho Khách Hàng (User / Frontend)
- **Giao diện đẳng cấp**: Thiết kế Luxury Dark & Gold hiện đại, mượt mà, chuẩn UI/UX.
- **Trang chủ lôi cuốn**: Banner Hero, bộ sưu tập thịnh hành, sản phẩm mới nhất, phản hồi khách hàng.
- **Cửa hàng & Bộ lọc**:
  - Tìm kiếm sản phẩm theo tên, danh mục (Nam, Nữ, Phụ kiện, Giày dép).
  - Lọc theo khoảng giá, sắp xếp theo giá tăng/giảm, tên A-Z, đánh giá.
- **Chi tiết sản phẩm**: Đổi hình ảnh, chọn kích cỡ (S, M, L, XL), số lượng, xem đánh giá chi tiết.
- **Giỏ hàng thông minh**: Sidebar giỏ hàng tức thì, trang checkout thanh toán chi tiết.
- **Tài khoản cá nhân**: Đăng ký, đăng nhập JWT, trang quản lý hồ sơ cá nhân và lịch sử đơn mua.

### 🛡️ Dành cho Quản Trị Viên (Admin)
- **Dashboard tổng quan**:
  - Thống kê doanh thu, số lượng đơn hàng, người dùng, sản phẩm.
  - Biểu đồ và danh sách đơn hàng mới nhất.
- **Quản lý người dùng (Users)**:
  - Xem danh sách thành viên, trạng thái hoạt động.
  - Khóa / Mở khóa tài khoản người dùng.
- **Quản lý sản phẩm (Products)**:
  - Thêm mới, chỉnh sửa thông tin, giá, danh mục, số lượng tồn kho, xóa sản phẩm.
- **Quản lý đơn hàng (Orders)**:
  - Cập nhật trạng thái đơn hàng (Đang xử lý, Đang giao, Đã giao, Đã hủy).

---

## 🔑 Tài khoản mặc định

| Vai trò | Email | Mật khẩu | Quyền hạn |
|---|---|---|---|
| **Admin** | `admin@fashion.com` | `Admin@123` | Toàn quyền quản trị hệ thống (`/admin`) |
| **User** | `user@fashion.com` | `User@123` | Mua sắm và quản lý đơn cá nhân |

---

## 💻 Công nghệ sử dụng

- **Frontend**: React 19, Vite, React Router v7, Lucide Icons, Vanilla CSS Design System.
- **Backend**: Node.js, Express, JWT (JSON Web Token), bcryptjs, CORS, UUID.
- **Database**: File-based JSON Database (`db.json`) lưu trữ người dùng, sản phẩm và đơn hàng.

---

## 📦 Hướng dẫn cài đặt & khởi chạy

### 1. Khởi động Backend
```bash
cd backend
npm install
npm start
# Server chạy tại: http://localhost:5000
```

### 2. Khởi động Frontend
```bash
cd frontend
npm install
npm run dev
# Website chạy tại: http://localhost:5173
```
