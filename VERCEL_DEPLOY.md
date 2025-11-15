# Hướng dẫn Deploy Fullstack trên Vercel

## ✅ Đã cấu hình sẵn

Dự án đã được cấu hình để deploy cả frontend và backend trên Vercel chỉ bằng một lần deploy!

## 📋 Các bước deploy

### 1. Thêm Environment Variables trên Vercel

Vào **Settings → Environment Variables** và thêm:

```
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_random_secret_key
REFERRAL_CODE=SH6688
```

**Lưu ý:**
- `DATABASE_URL`: Copy từ Neon database (đã có sẵn)
- `JWT_SECRET`: Tạo một chuỗi ngẫu nhiên (ví dụ: `mySecretKey123456789`)
- `REFERRAL_CODE`: `SH6688` (hoặc mã bạn muốn)

### 2. Cấu hình Project trên Vercel

1. Vào **Settings → General**
2. **Framework Preset**: Chọn **Other** hoặc để Vercel tự detect
3. **Root Directory**: Để trống (hoặc `./`)
4. **Build Command**: `cd client && npm install && npm run build`
5. **Output Directory**: `client/dist`
6. **Install Command**: `cd client && npm install && cd ../server && npm install`

### 3. Deploy

1. Vào tab **Deployments**
2. Nếu đã có deployment, click **Redeploy**
3. Nếu chưa có, Vercel sẽ tự động deploy khi bạn push code lên GitHub

## 🎯 Cấu trúc sau khi deploy

- **Frontend**: `https://your-project.vercel.app/`
- **Backend API**: `https://your-project.vercel.app/api/...`

Tất cả chạy trên cùng một domain!

## ⚙️ Cách hoạt động

1. **Frontend** (React) được build và serve như static files
2. **Backend** (Express) chạy như Vercel Serverless Functions trong thư mục `api/`
3. Tất cả requests đến `/api/*` được route đến serverless function
4. Tất cả requests khác được serve frontend

## 🔧 Troubleshooting

### Lỗi: Cannot find module
- Đảm bảo đã thêm tất cả environment variables
- Kiểm tra `installCommand` đã cài đặt cả client và server dependencies

### Lỗi: Database connection failed
- Kiểm tra `DATABASE_URL` đã đúng chưa
- Kiểm tra Neon database có đang hoạt động không

### Lỗi: Build failed
- Kiểm tra logs trên Vercel để xem lỗi cụ thể
- Đảm bảo Node.js version phù hợp (18.x)

## 📝 Lưu ý

- Vercel Free Plan có giới hạn về serverless function execution time
- Database connection sẽ được reuse giữa các requests (connection pooling)
- Cold start có thể mất vài giây cho request đầu tiên

