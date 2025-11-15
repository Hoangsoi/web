# Đại Lý Shopee - E-commerce Platform

Dự án thương mại điện tử tương tự Shopee với React frontend và Node.js backend, sử dụng PostgreSQL (Neon) làm database.

## Tính năng

### Frontend (React + Vite + Tailwind CSS)
- Trang chủ với banner slideshow và thông báo
- Danh mục sản phẩm: Mỹ phẩm 10%, Điện tử 20%, Điện lạnh 30%, Cao cấp 50%, VIP
- Quản lý giỏ hàng và thanh toán
- Quản lý đơn hàng
- Quản lý ví và hoa hồng
- Lịch sử giao dịch (nạp/rút tiền)
- Hỗ trợ khách hàng
- Responsive design cho mobile

### Backend (Node.js + Express + PostgreSQL)
- Authentication với JWT
- Quản lý sản phẩm
- Quản lý đơn hàng với hệ thống hoa hồng
- Quản lý giao dịch
- Admin panel đầy đủ

### Admin Panel
- Dashboard tổng quan
- Quản lý sản phẩm (CRUD)
- Quản lý đơn hàng (xem, cập nhật trạng thái)
- Quản lý người dùng (xem, chỉnh sửa)
- Quản lý giao dịch (xem, cộng/trừ tiền)
- Cài đặt (banner, thông báo, mã đại lý)

## Cài đặt

### Yêu cầu
- Node.js 18+
- PostgreSQL (hoặc Neon database)
- npm hoặc yarn

### Cài đặt Backend

```bash
cd server
npm install
```

Tạo file `.env` trong thư mục `server`:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
REFERRAL_CODE=SH6688
```

Chạy server:

```bash
npm start
```

### Cài đặt Frontend

```bash
cd client
npm install
```

Chạy development server:

```bash
npm run dev
```

## Cấu trúc dự án

```
shopee/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.jsx
│   └── package.json
├── server/          # Node.js backend
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── index.js
└── README.md
```

## Tính năng đặc biệt

### Hệ thống hoa hồng
- Mỹ phẩm: 10%
- Điện tử: 20%
- Điện lạnh: 30%
- Cao cấp: 50%
- VIP: 60%

### Quy trình đơn hàng
1. Khách hàng đặt hàng → Trừ tiền từ ví ngay lập tức
2. Admin phê duyệt → Hoàn tiền gốc + hoa hồng vào ví
3. Admin từ chối → Chỉ hoàn tiền gốc (không có hoa hồng)

### Real-time Updates
- Thông tin người dùng tự động cập nhật mỗi 3 giây khi admin thay đổi
- Không hiển thị thông báo cho khách hàng

## License

MIT
