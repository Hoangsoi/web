# Hướng dẫn sửa lỗi Deploy trên Vercel

## Vấn đề:
Root Directory đang là `client`, nhưng Vercel cần truy cập cả `api/` và `server/` folders.

## Giải pháp:

### Trên Vercel Dashboard:

1. **Đổi Root Directory:**
   - Vào **Settings → General**
   - Tìm **Root Directory**
   - Đổi từ `client` thành `.` (dấu chấm) hoặc để trống
   - Hoặc click "Edit" và xóa `client`, để trống

2. **Cập nhật Build Settings:**
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `cd client && npm install && cd ../server && npm install && cd ../api && npm install`

3. **Framework Preset:**
   - Có thể để **Other** hoặc **Vite** (không quan trọng lắm vì đã có vercel.json)

4. **Redeploy:**
   - Sau khi sửa xong, vào **Deployments**
   - Click **Redeploy** hoặc tạo deployment mới

## Lưu ý:
- Root Directory phải là thư mục gốc (`.`) để Vercel có thể thấy cả `client/`, `api/`, và `server/`
- File `vercel.json` phải ở thư mục gốc
- Thư mục `api/` phải ở thư mục gốc để Vercel nhận diện là serverless functions

