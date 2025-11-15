# 🔧 Sửa Lỗi Build trên Vercel - "vite: command not found"

## ❌ Lỗi

```
sh: line 1: vite: command not found
Error: Command "cd client && npm install && npm run build"
```

## 🔍 Nguyên Nhân

1. **Vite nằm trong devDependencies** - Vercel có thể không cài devDependencies trong production
2. **Build command không đảm bảo cài đặt đầy đủ** - Cần đảm bảo devDependencies được cài
3. **PATH không có node_modules/.bin** - Vite executable không được tìm thấy

## ✅ Giải Pháp Đã Áp Dụng

### 1. Sửa `vercel.json`

**Trước:**
```json
"buildCommand": "cd client && npm install && npm run build",
"installCommand": "cd client && npm install && cd ../server && npm install && cd ../api && npm install",
```

**Sau:**
```json
"buildCommand": "cd client && NPM_CONFIG_PRODUCTION=false npm ci && npm run build",
"installCommand": "cd client && npm ci && cd ../server && npm ci && cd ../api && npm ci",
```

**Thay đổi:**
- ✅ Sử dụng `npm ci` thay vì `npm install` (nhanh hơn, đáng tin cậy hơn cho CI/CD)
- ✅ Thêm `NPM_CONFIG_PRODUCTION=false` để đảm bảo cài devDependencies
- ✅ Tách riêng install và build để rõ ràng hơn

### 2. Cập Nhật `client/package.json`

Script `vercel-build` đã được cập nhật để sử dụng `npm ci`.

## 🚀 Cách Sửa Trên Vercel

### Cách 1: Sửa trong Vercel Dashboard (Nhanh)

1. Vào Vercel project → **Settings** → **General**
2. Tìm **Build & Development Settings**
3. Sửa **Build Command** thành:
   ```
   cd client && NPM_CONFIG_PRODUCTION=false npm ci && npm run build
   ```
4. Sửa **Install Command** thành:
   ```
   cd client && npm ci && cd ../server && npm ci && cd ../api && npm ci
   ```
5. Click **Save**
6. **Redeploy** project

### Cách 2: Push Code Mới (Khuyến nghị)

Code đã được sửa, chỉ cần:

1. **Commit và push:**
   ```bash
   git add vercel.json client/package.json
   git commit -m "Fix Vercel build: ensure devDependencies are installed"
   git push origin main
   ```

2. **Vercel sẽ tự động redeploy** với cấu hình mới

## 📋 Kiểm Tra

Sau khi deploy, kiểm tra build logs:

1. Vào **Deployments** tab trên Vercel
2. Click vào deployment mới nhất
3. Xem **Build Logs**
4. Đảm bảo thấy:
   - ✅ `npm ci` chạy thành công
   - ✅ `vite build` chạy thành công
   - ✅ Build hoàn tất không có lỗi

## 🐛 Nếu Vẫn Gặp Lỗi

### Giải pháp thay thế 1: Sử dụng npx

Nếu vẫn không tìm thấy vite, thử sửa build command:

```
cd client && npm ci && npx vite build
```

### Giải pháp thay thế 2: Di chuyển vite sang dependencies

Nếu cần thiết, có thể di chuyển vite từ devDependencies sang dependencies:

```json
{
  "dependencies": {
    "vite": "^5.0.8"
  }
}
```

**Lưu ý:** Không khuyến nghị vì vite chỉ cần khi build, không cần khi runtime.

### Giải pháp thay thế 3: Kiểm tra Node version

Đảm bảo Vercel sử dụng Node.js 18+:

1. Vào **Settings** → **General**
2. Tìm **Node.js Version**
3. Đặt: `18.x` hoặc `20.x`

## ✅ Checklist

- [ ] `vercel.json` đã được cập nhật với `NPM_CONFIG_PRODUCTION=false`
- [ ] Build command sử dụng `npm ci`
- [ ] Code đã được push lên GitHub
- [ ] Vercel đã redeploy với cấu hình mới
- [ ] Build logs không còn lỗi "vite: command not found"
- [ ] Frontend build thành công

---

**Sau khi sửa, deploy lại và kiểm tra build logs! 🚀**

