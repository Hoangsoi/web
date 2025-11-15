# 🚀 Hướng dẫn Deploy Fullstack trên Vercel (Hoàn chỉnh)

## ✅ Đã được cải thiện và tối ưu

Dự án đã được cải thiện để chạy hoàn hảo trên Vercel với:
- ✅ Backend chạy như Serverless Functions
- ✅ Frontend được build và serve như static files
- ✅ Database connection pooling tối ưu cho serverless
- ✅ CORS được cấu hình đúng
- ✅ Error handling được cải thiện
- ✅ Timeout và retry logic

## 📋 Các bước deploy

### 1. Chuẩn bị Database

1. Tạo database trên Neon (https://neon.tech) hoặc PostgreSQL khác
2. Lưu connection string (DATABASE_URL)

### 2. Deploy lên Vercel

#### Cách 1: Deploy từ GitHub (Khuyến nghị)

1. **Push code lên GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Import project trên Vercel**
   - Truy cập: https://vercel.com
   - Đăng nhập bằng GitHub
   - Click "Add New Project"
   - Chọn repository của bạn
   - Vercel sẽ tự động detect cấu hình từ `vercel.json`

3. **Thêm Environment Variables**
   - Vào **Settings → Environment Variables**
   - Thêm các biến sau:
   
   ```
   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
   JWT_SECRET=your_random_secret_key_min_32_chars
   REFERRAL_CODE=SH6688
   NODE_ENV=production
   ```
   
   **Lưu ý:**
   - `DATABASE_URL`: Copy từ Neon database
   - `JWT_SECRET`: Tạo chuỗi ngẫu nhiên (ví dụ: `mySecretKey123456789abcdefghijklmnop`)
   - Chọn **Apply to all environments** (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Đợi build hoàn tất (có thể mất 3-5 phút lần đầu)

#### Cách 2: Deploy bằng Vercel CLI

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

### 3. Cấu hình Project Settings (Nếu cần)

Vercel sẽ tự động detect từ `vercel.json`, nhưng bạn có thể kiểm tra:

- **Framework Preset**: Other
- **Root Directory**: `./` (root của project)
- **Build Command**: `cd client && npm install && npm run build`
- **Output Directory**: `client/dist`
- **Install Command**: `cd client && npm install && cd ../server && npm install && cd ../api && npm install`

## 🎯 Cấu trúc sau khi deploy

- **Frontend**: `https://your-project.vercel.app/`
- **Backend API**: `https://your-project.vercel.app/api/...`
- **Health Check**: `https://your-project.vercel.app/api/health`

Tất cả chạy trên cùng một domain!

## ⚙️ Cách hoạt động

1. **Frontend (React)**
   - Được build thành static files trong `client/dist`
   - Được serve bởi Vercel CDN
   - Tất cả routes được rewrite về `/index.html` (SPA routing)

2. **Backend (Express)**
   - Chạy như Vercel Serverless Function trong `api/index.js`
   - Tất cả requests đến `/api/*` được route đến serverless function
   - Database connection được reuse giữa các requests (connection pooling)

3. **Routing**
   - `/api/*` → Serverless function
   - `/*` → Frontend (index.html)

## 🔧 Kiểm tra sau khi deploy

1. **Kiểm tra Health Check**
   ```
   GET https://your-project.vercel.app/api/health
   ```
   Kết quả mong đợi:
   ```json
   {
     "status": "ok",
     "message": "Server is running",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

2. **Kiểm tra Frontend**
   - Truy cập: `https://your-project.vercel.app/`
   - Kiểm tra console không có lỗi
   - Thử đăng ký/đăng nhập

3. **Kiểm tra API**
   - Mở DevTools → Network tab
   - Thử các thao tác: xem sản phẩm, thêm vào giỏ hàng
   - Kiểm tra requests đến `/api/*` thành công

## 🐛 Troubleshooting

### Lỗi: Build failed

**Nguyên nhân:** Thiếu dependencies hoặc lỗi syntax

**Giải pháp:**
- Kiểm tra logs trên Vercel để xem lỗi cụ thể
- Đảm bảo tất cả dependencies đã được cài đặt
- Kiểm tra Node.js version (cần 18+)

### Lỗi: Database connection failed

**Nguyên nhân:** DATABASE_URL không đúng hoặc database không accessible

**Giải pháp:**
- Kiểm tra DATABASE_URL trên Vercel đã đúng chưa
- Kiểm tra Neon database có đang hoạt động không
- Kiểm tra SSL mode (cần `?sslmode=require` cho Neon)

### Lỗi: Function timeout

**Nguyên nhân:** Request mất quá 30 giây (giới hạn của Vercel Free)

**Giải pháp:**
- Tối ưu database queries
- Kiểm tra có vòng lặp vô hạn không
- Nâng cấp lên Vercel Pro để có timeout dài hơn

### Lỗi: CORS error

**Nguyên nhân:** CORS chưa được cấu hình đúng

**Giải pháp:**
- Đã được cấu hình trong `api/index.js` và `vercel.json`
- Nếu vẫn lỗi, kiểm tra browser console để xem lỗi cụ thể

### Lỗi: Module not found

**Nguyên nhân:** Dependencies chưa được cài đặt đầy đủ

**Giải pháp:**
- Kiểm tra `installCommand` trong `vercel.json`
- Đảm bảo cả `client`, `server`, và `api` đều có `package.json`
- Redeploy lại project

### Lỗi: 404 on page refresh

**Nguyên nhân:** SPA routing chưa được cấu hình

**Giải pháp:**
- Đã được cấu hình trong `vercel.json` với rewrite rule
- Nếu vẫn lỗi, kiểm tra `client/public/_redirects` file

## 📝 Lưu ý quan trọng

### Vercel Free Plan Limitations

- **Serverless Function Execution Time**: Tối đa 10 giây (Hobby) hoặc 60 giây (Pro)
- **Bandwidth**: 100GB/tháng
- **Build Time**: 45 phút/tháng
- **Cold Start**: Request đầu tiên có thể mất 1-3 giây

### Database Connection

- Connection pooling được tối ưu cho serverless (max 2 connections)
- Connections được reuse giữa các requests
- Cold start sẽ tạo connection mới

### Environment Variables

- Tất cả env vars phải được thêm trên Vercel dashboard
- Không commit `.env` file lên Git
- Có thể set khác nhau cho Production, Preview, Development

## 🚀 Tối ưu Performance

1. **Database Queries**
   - Sử dụng indexes đã được tạo
   - Tránh N+1 queries
   - Cache kết quả khi có thể

2. **Frontend**
   - Code splitting đã được Vite tự động xử lý
   - Images nên được optimize
   - Sử dụng lazy loading cho routes

3. **API Response**
   - Giảm payload size
   - Sử dụng compression (Vercel tự động xử lý)

## 📚 Tài liệu tham khảo

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Neon Database](https://neon.tech/docs)

## ✅ Checklist trước khi deploy

- [ ] Database đã được tạo và có connection string
- [ ] Environment variables đã được thêm trên Vercel
- [ ] Code đã được push lên GitHub
- [ ] `vercel.json` đã được cấu hình đúng
- [ ] Tất cả dependencies đã được cài đặt
- [ ] Đã test local với `npm run dev` (client) và `npm start` (server)

---

**Chúc bạn deploy thành công! 🎉**

