# Smart Bin Frontend 🗑️

Ứng dụng frontend cho hệ thống **Smart Bin** - một giải pháp thông minh để quản lý rác thải bằng công nghệ AI.

## 📋 Mô Tả Dự Án

Smart Bin Frontend là giao diện người dùng web được xây dựng bằng **React** và **TypeScript**, cung cấp khả năng:
- 🔐 Đăng nhập/Đăng ký người dùng
- 📊 Xem lịch sử các lần thải rác
- 🤖 Hiển thị kết quả nhận diện loại rác bằng AI (độ chính xác, loại rác, hình ảnh)
- 📱 Giao diện responsive tương thích với mọi thiết bị

## 🎯 Tính Năng Chính

- ✅ **Xác thực người dùng**: Đăng ký tài khoản mới, đăng nhập với email/mật khẩu
- ✅ **Quản lý phiên**: Lưu trữ token JWT, tự động khôi phục phiên khi reload
- ✅ **Lịch sử thải rác**: Xem danh sách các lần thải rác với thông tin chi tiết
- ✅ **Nhận diện AI**: Hiển thị kết quả phân loại rác (loại, độ tự tin, hình ảnh)
- ✅ **Bảo vệ route**: Các trang được bảo vệ, yêu cầu đăng nhập
- ✅ **Thông báo**: Toast notifications cho các hành động người dùng

## 🛠️ Công Nghệ Sử Dụng

### Core
- **React** 18+ - Thư viện UI
- **TypeScript** - Ngôn ngữ lập trình
- **Vite** - Build tool hiệu suất cao

### UI & Styling
- **shadcn/ui** - Thư viện component tái sử dụng
- **Radix UI** - Primitive components
- **Tailwind CSS** - Utility-first CSS framework
- **Sonner** - Toast notifications
- **Embla Carousel** - Carousel component

### State Management & Data
- **@tanstack/react-query** - Quản lý state của server
- **@hookform/resolvers** - Form validation
- **react-hook-form** - Form management

### Routing & Utils
- **react-router-dom** - Client-side routing
- **date-fns** - Date utilities
- **clsx** - Conditional CSS classes
- **cmdk** - Command palette component

### Development
- **ESLint** - Code linting
- **Vitest** - Unit testing framework
- **PostCSS** - CSS processing

## 📦 Cài Đặt

### Yêu Cầu
- Node.js 16.0 trở lên
- npm hoặc yarn

### Hướng Dẫn

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd smart-bin-frontend
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   # hoặc
   yarn install
   ```

3. **Cấu hình biến môi trường** (nếu cần)
   ```bash
   # .env (tùy chọn)
   VITE_API_BASE=http://localhost:8000
   ```

4. **Chạy dev server**
   ```bash
   npm run dev
   ```
   
   Ứng dụng sẽ chạy tại `http://localhost:5173`

## 🚀 Sử Dụng

### Các lệnh khả dụng

```bash
# Chạy development server (hot reload)
npm run dev

# Build cho production
npm run build

# Build cho development
npm run build:dev
```

### Workflow

1. **Đăng Ký/Đăng Nhập**
   - Truy cập `/login` hoặc `/register`
   - Nhập thông tin xác thực
   - Token JWT được lưu tự động

2. **Xem Lịch Sử**
   - Sau đăng nhập, truy cập trang chính `/`
   - Xem danh sách thải rác gần đây
   - Mỗi mục hiển thị: loại rác, độ chính xác, hình ảnh, thời gian

3. **Đăng Xuất**
   - Token sẽ được xóa khỏi localStorage

## 📁 Cấu Trúc Dự Án

```
smart-bin-frontend/
├── public/                  # Static assets
├── src/
│   ├── assets/             # Images, fonts, etc
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── NavLink.tsx      # Navigation link
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/
│   │   ├── use-mobile.tsx   # Mobile detection hook
│   │   └── use-toast.ts     # Toast hook
│   ├── lib/
│   │   ├── api.ts           # API client
│   │   └── utils.ts         # Utility functions
│   ├── pages/
│   │   ├── Index.tsx        # Dashboard/Home page
│   │   ├── Login.tsx        # Login page
│   │   ├── Register.tsx     # Register page
│   │   └── NotFound.tsx     # 404 page
│   ├── App.tsx              # Main App component
│   ├── main.tsx             # Entry point
│   ├── App.css              # Global styles
│   └── index.css            # Global CSS
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── vitest.config.ts
```

## 🔌 API Integration

### Base URL
```
http://localhost:8000
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới |
| `POST` | `/api/auth/login` | Đăng nhập |
| `GET` | `/api/trash-logs` | Lấy danh sách lần thải rác |

### Authentication
- Sử dụng JWT tokens
- Token lưu trong `localStorage` với key `token`
- Được gửi trong header: `Authorization: Bearer <token>`

## 🔐 Bảo Mật

- ✅ JWT-based authentication
- ✅ Protected routes (ProtectedRoute component)
- ✅ Token auto-refresh on app reload
- ✅ Secure token storage (localStorage)

## 🧪 Testing

```bash
# Chạy toàn bộ test suite
npm run test

```

## 📝 Code Style

- **Linter**: ESLint
- **Format**: Prettier (nếu được cấu hình)

```bash
# Kiểm tra linting
npm run lint

# Fix linting issues tự động
npm run lint -- --fix
```

## 🚀 Deployment

### Build
```bash
npm run build
```

Build output sẽ nằm trong thư mục `dist/`

### Environment-specific Builds
```bash
# Development build
npm run build:dev

# Production build (default)
npm run build
```

## 🤝 Đóng Góp

1. Tạo branch mới: `git checkout -b feature/AmazingFeature`
2. Commit changes: `git commit -m 'Add some AmazingFeature'`
3. Push to branch: `git push origin feature/AmazingFeature`
4. Mở Pull Request

## 📄 License

Project này là một phần của khóa học CO3109_DADN tại HCMUT.

## 📞 Liên Hệ

Để báo cáo lỗi hoặc đề xuất, vui lòng tạo một Issue trong repository.

---

**Happy coding!** 🚀
