# Hướng dẫn Deploy Mới trên Vercel

## Bước 1: Xóa Project Cũ (Nếu có)

1. Vào Vercel Dashboard
2. Tìm project `dailyshopee`
3. Vào Settings → General → Scroll xuống cuối
4. Click "Delete Project"
5. Xác nhận xóa

## Bước 2: Tạo Project Mới

1. Click "Add New Project"
2. Chọn "Import from GitHub"
3. Chọn repository: `Hoangsoi/web`
4. Chọn branch: `main`

## Bước 3: Cấu hình Project

**KHÔNG CHỌN ROOT DIRECTORY** - Để trống hoặc để Vercel tự detect

**Framework Preset:** 
- Chọn **Other** (không chọn Vite)

**Project Name:** 
- `dailyshopee` (hoặc tên bạn muốn)

**Build Settings:**
- Vercel sẽ tự động detect từ `vercel.json`
- KHÔNG cần điền gì thêm

## Bước 4: Thêm Environment Variables

Click vào "Environment Variables" và thêm:

```
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_random_secret_key_here
REFERRAL_CODE=SH6688
```

**Lưu ý:**
- Chọn cả 3 environments: Production, Preview, Development
- `DATABASE_URL`: Copy từ Neon database
- `JWT_SECRET`: Tạo một chuỗi ngẫu nhiên (ví dụ: `mySecretKey123456789`)

## Bước 5: Deploy

1. Click nút "Deploy"
2. Đợi Vercel build và deploy
3. Kiểm tra logs nếu có lỗi

## Bước 6: Kiểm tra

Sau khi deploy xong:
- Frontend: `https://dailyshopee.vercel.app/`
- API Health: `https://dailyshopee.vercel.app/api/health`
- API Products: `https://dailyshopee.vercel.app/api/products`

## Nếu vẫn lỗi:

1. Kiểm tra Build Logs trên Vercel
2. Kiểm tra Runtime Logs
3. Đảm bảo Environment Variables đã được thêm đúng
4. Thử redeploy lại

