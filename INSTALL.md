# Hướng dẫn cài đặt và chạy dự án

## Yêu cầu hệ thống

- Node.js (phiên bản 16 trở lên)
- PostgreSQL database (Neon hoặc PostgreSQL local)
- npm hoặc yarn

## Các bước cài đặt

### 1. Cài đặt dependencies

Từ thư mục gốc, chạy lệnh:

```bash
npm run install-all
```

Lệnh này sẽ cài đặt dependencies cho:
- Root project
- Server (backend)
- Client (frontend)

### 2. Cấu hình PostgreSQL

#### Option 1: Neon (Cloud - Recommended)
- Tạo tài khoản tại https://neon.tech
- Tạo database và lấy connection string
- Connection string có dạng: `postgresql://user:password@host/database?sslmode=require`

#### Option 2: PostgreSQL Local
- Cài đặt PostgreSQL trên máy của bạn
- Tạo database mới
- Connection string: `postgresql://user:password@localhost:5432/database`

### 3. Cấu hình Environment Variables

Tạo file `.env` trong thư mục `server/`:

```env
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_12WbMtJnYHvm@ep-mute-violet-adxm9wuk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
REFERRAL_CODE=SH6688
```

**Lưu ý:** File `.env` đã được tạo sẵn với connection string Neon của bạn.

**Lưu ý:** Thay đổi `JWT_SECRET` thành một chuỗi ngẫu nhiên mạnh trong môi trường production.
**Lưu ý:** Bạn có thể đổi `REFERRAL_CODE` bất kỳ lúc nào để cập nhật mã đại lý.

**Nâng cấp schema (nếu đã tạo bảng trước đó):**

Nếu bạn đã chạy server trước khi tính năng mã đại lý được thêm vào, hãy chạy câu lệnh sau trong Neon để bổ sung cột `referral_code`:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(100) NOT NULL DEFAULT 'SH6688';
UPDATE users SET referral_code = 'SH6688' WHERE referral_code IS NULL;
ALTER TABLE users ALTER COLUMN referral_code DROP DEFAULT;
```

### 4. Chạy ứng dụng

#### Chạy cả frontend và backend cùng lúc:

```bash
npm run dev
```

#### Hoặc chạy riêng lẻ:

**Backend:**
```bash
npm run server
```

**Frontend:**
```bash
npm run client
```

### 5. Truy cập ứng dụng

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Tạo tài khoản Admin (tùy chọn)

Để tạo tài khoản admin, bạn có thể:

1. Đăng ký tài khoản bình thường qua giao diện
2. Vào MongoDB và cập nhật role của user thành 'admin':

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Cấu trúc thư mục

```
shopee/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   └── ...
│   └── package.json
├── server/                 # Backend Express
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── utils/             # Utility functions
│   └── index.js           # Server entry point
└── package.json           # Root package.json
```

## Troubleshooting

### Lỗi kết nối PostgreSQL
- Kiểm tra DATABASE_URL trong file .env
- Đảm bảo connection string đúng định dạng
- Kiểm tra SSL settings (Neon yêu cầu sslmode=require)
- Kiểm tra firewall/network settings

### Lỗi port đã được sử dụng
- Thay đổi PORT trong file .env (backend)
- Thay đổi port trong vite.config.js (frontend)

### Lỗi dependencies
- Xóa node_modules và package-lock.json
- Chạy lại `npm run install-all`

