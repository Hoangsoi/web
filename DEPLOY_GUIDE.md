# Hướng dẫn Deploy Dự án Shopee

## 1. Deploy Frontend trên Vercel (Miễn phí)

### Bước 1: Đăng ký Vercel
1. Truy cập: https://vercel.com
2. Đăng nhập bằng GitHub
3. Chọn "Add New Project"

### Bước 2: Import Repository
1. Chọn repository: `Hoangsoi/web`
2. Framework Preset: Chọn **Vite**
3. Root Directory: Chọn **client**
4. Project Name: `dailyshopee` (hoặc tên bạn muốn)

### Bước 3: Cấu hình Build Settings
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Bước 4: Deploy
- Nhấn "Deploy"
- Đợi build và deploy hoàn tất
- Lưu URL frontend (ví dụ: `dailyshopee.vercel.app`)

---

## 2. Deploy Backend trên Railway (Miễn phí)

### Bước 1: Đăng ký Railway
1. Truy cập: https://railway.app
2. Đăng nhập bằng GitHub
3. Chọn "New Project"

### Bước 2: Deploy từ GitHub
1. Chọn "Deploy from GitHub repo"
2. Chọn repository: `Hoangsoi/web`
3. Railway sẽ tự động detect và deploy

### Bước 3: Cấu hình Root Directory
1. Vào Settings của service
2. Tìm "Root Directory"
3. Đặt: `server`

### Bước 4: Thêm Environment Variables
Vào tab "Variables" và thêm:

```
PORT=5000
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_random_secret_key_here
REFERRAL_CODE=SH6688
```

**Lưu ý:**
- `DATABASE_URL`: Copy từ Neon database (đã có sẵn)
- `JWT_SECRET`: Tạo một chuỗi ngẫu nhiên (ví dụ: `mySecretKey123456789`)

### Bước 5: Deploy
1. Railway sẽ tự động deploy
2. Đợi deploy hoàn tất
3. Lấy URL backend (ví dụ: `https://web-production-xxxx.up.railway.app`)

---

## 3. Kết nối Frontend với Backend

### Bước 1: Thêm Environment Variable trên Vercel
1. Vào Vercel project → Settings → Environment Variables
2. Thêm biến mới:
   - **Key**: `VITE_API_URL`
   - **Value**: URL backend từ Railway (ví dụ: `https://web-production-xxxx.up.railway.app`)
   - **Environment**: Chọn cả 3 (Production, Preview, Development)
3. Nhấn "Save"

### Bước 2: Redeploy Frontend
1. Vào tab "Deployments" trên Vercel
2. Click vào deployment mới nhất
3. Chọn "Redeploy"
4. Đợi deploy hoàn tất

---

## 4. Kiểm tra

1. Truy cập URL frontend: `dailyshopee.vercel.app`
2. Thử đăng ký/đăng nhập
3. Kiểm tra console để đảm bảo không có lỗi API

---

## Lưu ý quan trọng

- **Railway Free Plan**: Có giới hạn về thời gian chạy, có thể bị sleep sau một thời gian không dùng
- **Vercel Free Plan**: Rất tốt cho frontend, không giới hạn
- **Database**: Neon database đã có sẵn, chỉ cần thêm `DATABASE_URL` vào Railway

---

## Troubleshooting

### Lỗi: Cannot connect to backend
- Kiểm tra `VITE_API_URL` trên Vercel đã đúng chưa
- Kiểm tra backend trên Railway đã chạy chưa
- Kiểm tra CORS settings trên backend (nếu cần)

### Lỗi: Database connection failed
- Kiểm tra `DATABASE_URL` trên Railway đã đúng chưa
- Kiểm tra Neon database có đang hoạt động không

