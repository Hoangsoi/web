# ✅ Checklist Deploy lên Vercel

## Trước khi Deploy

### 1. Database Setup
- [ ] Đã tạo database trên Neon (https://neon.tech) hoặc PostgreSQL khác
- [ ] Đã lưu connection string (DATABASE_URL)
- [ ] Đã test kết nối database

### 2. Code Preparation
- [ ] Đã test chạy local: `cd client && npm run dev`
- [ ] Đã test backend local: `cd server && npm start`
- [ ] Không có lỗi syntax hoặc linter errors
- [ ] Đã commit và push code lên GitHub

### 3. Environment Variables
Chuẩn bị các giá trị sau để thêm vào Vercel:
- [ ] `DATABASE_URL` - Connection string từ Neon
- [ ] `JWT_SECRET` - Chuỗi ngẫu nhiên (tối thiểu 32 ký tự)
- [ ] `REFERRAL_CODE` - Mã đại lý (mặc định: SH6688)
- [ ] `NODE_ENV` - production

## Trong quá trình Deploy

### 4. Vercel Setup
- [ ] Đã đăng nhập Vercel bằng GitHub
- [ ] Đã import project từ GitHub
- [ ] Vercel đã tự động detect `vercel.json`
- [ ] Đã thêm tất cả environment variables
- [ ] Đã chọn "Apply to all environments"

### 5. Build & Deploy
- [ ] Build đã chạy thành công (không có lỗi)
- [ ] Deploy đã hoàn tất
- [ ] Đã lưu URL của project

## Sau khi Deploy

### 6. Testing
- [ ] Health check: `https://your-project.vercel.app/api/health` trả về OK
- [ ] Frontend load được: `https://your-project.vercel.app/`
- [ ] Không có lỗi trong browser console
- [ ] API calls hoạt động (thử đăng ký/đăng nhập)
- [ ] Database operations hoạt động (thử tạo đơn hàng)

### 7. Production Checks
- [ ] Tất cả routes hoạt động đúng
- [ ] Authentication hoạt động
- [ ] Admin panel hoạt động (nếu có)
- [ ] Images và assets load được
- [ ] Mobile responsive hoạt động

## Troubleshooting

Nếu gặp lỗi, kiểm tra:
- [ ] Logs trên Vercel dashboard
- [ ] Environment variables đã đúng chưa
- [ ] Database connection string đúng chưa
- [ ] Build logs có lỗi gì không

---

**Lưu ý:** Đảm bảo tất cả các mục đã được check trước khi deploy production!

