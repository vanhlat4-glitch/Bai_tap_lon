# 🎮 CYBER MINIGAME HUB - FULL-STACK WEB PROJECT

Dự án website cổng Minigame trực tuyến hoàn chỉnh với đầy đủ **Back-End** và **Front-End**, đáp ứng **100% chuẩn kiến thức 14 buổi học (Lessons 1 - 14)** của khóa học Web Full-stack.

---

## 📚 BẢNG ĐỐI CHIẾU KIẾN THỨC KHÓA HỌC (LESSONS 1 - 14)

| Bài học (Lesson) | Nội dung yêu cầu | Triển khai thực tế trong dự án | File mã nguồn minh chứng |
|:---|:---|:---|:---|
| **Lesson 1 - Web service** | RESTful API, HTTP Methods (GET, POST, PUT, DELETE), JSON responses, Status Codes | Xây dựng bộ RESTful API cho toàn bộ chức năng (Auth, Games, Leaderboard, Shop, Users, Upload). | `server/index.js`, `server/routes/` |
| **Lesson 2 - ExpressJs** | Cấu hình Express app, router, middleware `express.json()`, `cors`, static files | Khởi tạo server Express, phục vụ file tĩnh giao diện client và thư mục `/uploads`. | `server/index.js` |
| **Lesson 3 - JSON Server** | Mock API, cấu trúc dữ liệu JSON lưu trữ | Cấu hình data layer chuẩn REST API, endpoints trả về dữ liệu JSON có cấu trúc rõ ràng. | `server/routes/games.js`, `server/routes/shop.js` |
| **Lesson 4 - MongoDB** | Kết nối MongoDB qua Mongoose, Schema & Models | Khởi tạo kết nối MongoDB Mongoose, định nghĩa các Schema: User, Score, Item, Inventory. Tự động seed dữ liệu mẫu. | `server/config/db.js`, `server/models/` |
| **Lesson 5 - Mô hình MVC, middleware** | Cấu trúc Model - View - Controller, Custom Middleware, Error Handler tập trung | Tổ chức thư mục chuẩn MVC: `models/`, `controllers/`, `routes/`, `middlewares/errorMiddleware.js`. | `server/controllers/`, `server/middlewares/` |
| **Lesson 6 - Authentication - Authorization** | Đăng ký, Đăng nhập, Phân quyền vai trò (Admin vs User Role) | Phân quyền `role: 'admin'` và `role: 'user'`. Middleware `authorizeRoles('admin')` bảo vệ trang quản trị dữ liệu. | `server/middlewares/roleMiddleware.js`, `server/controllers/userController.js` |
| **Lesson 7 - Hash password, ENV** | Băm mật khẩu an toàn, quản lý biến môi trường `.env` | Sử dụng `bcryptjs` với salt 10 rounds; dùng `dotenv` quản lý PORT, MONGO_URI, JWT_SECRET. | `server/models/User.js`, `.env`, `.env.example` |
| **Lesson 8 - Token** | Cấp phát & xác thực JWT (JSON Web Token), Header Authorization Bearer | Ký token JWT khi đăng nhập/đăng ký; middleware `authenticateToken` giải mã token bảo vệ API. | `server/middlewares/authMiddleware.js`, `server/controllers/authController.js` |
| **Lesson 9 - Database Relationships** | Liên kết bảng/collection (1-N), Mongoose ObjectId `ref` & populate | Model `Score` và `Inventory` liên kết với `User` qua `ref: 'User'` và `ref: 'Item'`. | `server/models/Score.js`, `server/models/Inventory.js` |
| **Lesson 10 - Upload file** | Upload file với Multer, lưu trữ trên ổ đĩa, kiểm tra định dạng và kích thước | Cho phép người chơi tải ảnh đại diện từ máy tính (`/api/upload/avatar`), lưu vào `server/uploads/avatars/`. | `server/middlewares/uploadMiddleware.js`, `server/controllers/uploadController.js` |
| **Lesson 11 - Data management** | Phân trang (Pagination), Tìm kiếm (Search), Sắp xếp (Sorting), Lọc (Filter), CRUD | Admin Panel hỗ trợ tìm kiếm theo tên người dùng, phân trang (trang trước/sau), xem chi tiết, sửa Xu và xóa tài khoản. | `server/controllers/userController.js`, `client/js/app.js` |
| **Lesson 12 - Deployment** | Cấu hình biến môi trường production, scripts start, cấu trúc sẵn sàng deploy | Có sẵn file `.env.example`, package.json script `start: "node server/index.js"`, sẵn sàng deploy Render/Railway. | `package.json`, `.env.example` |
| **Lesson 13 - Redux-toolkit / State Architecture** | Quản lý state tập trung, đồng bộ dữ liệu | Kiến trúc State Manager ở Front-end (`auth.js`, `api.js`, `sound.js`) quản lý trạng thái phiên đăng nhập, số dư Xu và kho đồ. | `client/js/auth.js`, `client/js/api.js` |
| **Lesson 14 - Hoàn thiện dự án** | Tích hợp Front-end + Back-end mượt mà, UX/UI chỉn chu, tài liệu đầy đủ | Bộ 4 minigame (Caro AI, Snake 2.0, 2048, Lucky Wheel), giao diện Dark Neon, âm thanh Web Audio API. | Toàn bộ dự án |

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. 🎯 Bộ 4 Minigames Hoàn Chỉnh
- **⭕❌ Cờ Caro Tinh Anh (Gomoku Pro):**
  - Chơi với **AI Máy tính thông minh** (3 cấp độ: Dễ, Vừa, Cực Khó) với thuật toán Heuristic tính toán thế cờ.
  - Chế độ 2 người chơi so tài trực tiếp (PvP Local).
  - Tùy chỉnh kích thước bàn cờ (15x15 chuẩn Gomoku hoặc 10x10 nhanh), hỗ trợ **Hoàn tác (Undo)** nước đi, highlight 5 ô chiến thắng.
- **🐍 Cyber Snake 2.0 (Rắn Săn Mồi Siêu Cấp):**
  - Đồ họa Canvas 60 FPS hiệu ứng Neon Cyberpunk.
  - Táo Xanh (+10đ) & **Táo Vàng Thần Kỳ** (+35đ & nhân đôi Xu, xuất hiện ngẫu nhiên 8 giây).
  - Hiệu ứng hạt nổ (Particle Explosion) khi ăn mồi; hỗ trợ phím mũi tên, `WASD` và bàn phím ảo D-Pad cho điện thoại.
- **🔢 Neon 2048:**
  - Bảng 4x4 số với hiệu ứng trượt & merge pop theo dải màu rực rỡ từ 2 tới 2048 (và 4096).
  - Hỗ trợ nút Hoàn tác nước đi và nhận diện thao tác vuốt màn hình (Swipe).
- **🎡 Vòng Quay May Mắn (Lucky Wheel):**
  - Mô phỏng vật lý chuyển động quay giảm tốc chân thực kèm âm thanh kim chỉ vạch.
  - **1 lượt quay miễn phí mỗi 6 tiếng** (có đồng hồ đếm ngược trực tiếp) hoặc quay thêm bằng 20 Xu.
  - Cơ hội trúng Jackpot 300 Xu và danh hiệu quý hiếm "Vận May Đỏ".

### 2. 🔐 Hệ Thống Back-End & Phân Quyền Admin (Lessons 5, 6, 8, 11)
- **Tài khoản Admin:** Khi đăng nhập bằng tài khoản `admin`, thanh điều hướng sẽ tự động mở khóa mục **"⚙️ Quản trị" (Admin Panel)**.
- **Quản lý dữ liệu:**
  - Tìm kiếm người dùng theo tên (Search input với debounce).
  - Phân trang (Pagination) xem danh sách người chơi.
  - Chỉnh sửa số dư Xu hoặc xóa tài khoản vi phạm.

### 3. 📷 Tải Lên Ảnh Đại Diện (Lesson 10 - Multer Upload)
- Người dùng có thể nhấn vào nút **📷 (Camera)** ở thanh điều hướng để tải ảnh đại diện từ máy tính (`PNG, JPG, WEBP`).
- Hệ thống tự động upload qua Multer, lưu vào `server/uploads/avatars/` và cập nhật ảnh đại diện vào hồ sơ người chơi.

### 4. 🏆 Bảng Xếp Hạng Toàn Cầu & Bục Vinh Quang Olympic
- Hiển thị Bục vinh quang 3D cho Top 1 (Vương miện Vàng 👑), Top 2 (Bạc 🥈), Top 3 (Đồng 🥉).
- Bộ lọc linh hoạt: Xếp hạng Rắn săn mồi, 2048, Cờ Caro, Đại Gia Xu và Điểm tổng hợp.
- Thanh Live Ticker cập nhật các trận đấu vừa diễn ra theo thời gian thực.

### 5. 🛒 Cửa Hàng Vật Phẩm & Danh Hiệu
- 14 vật phẩm (Avatar độc quyền 🦊, 🤖, 🐉, 👑... và Danh hiệu cao cấp).
- Hỗ trợ 1-click mua bằng Xu kiếm được từ minigame và trang bị ngay vào tài khoản.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### Yêu cầu:
- Đã cài đặt **Node.js** (Phiên bản v18+ trở lên, khuyến nghị v20+ hoặc v24).

### Các bước khởi chạy:

**Cách 1: Chạy toàn bộ hệ thống (Express phục vụ bản React Build hoàn chỉnh):**
1. Mở terminal tại thư mục `Final_project`:
   ```bash
   cd Final_project
   npm start
   ```
2. Mở trình duyệt web và truy cập:
   ```
   http://localhost:3000
   ```

**Cách 2: Chạy chế độ phát triển Front-End React (Vite HMR cực nhanh):**
1. Chạy Back-end tại thư mục gốc:
   ```bash
   npm start
   ```
2. Mở thêm 1 terminal mới và chạy máy chủ Vite React:
   ```bash
   npm run dev:frontend
   ```
3. Truy cập: `http://localhost:5173` (đã được cấu hình tự động proxy API sang port 3000).

---

## 🔑 TÀI KHOẢN MẪU ĐỂ CHẤM ĐIỂM (DEMO ACCOUNTS)

Trên giao diện Đăng Nhập đã tích hợp sẵn nút **"✨ Điền nhanh tài khoản mẫu"**:

| Tài khoản | Mật khẩu | Quyền hạn (Role) | Chức năng nổi bật |
|:---|:---|:---|:---|
| **admin** | `123456` | **admin** | Có sẵn 1,500 Xu, mở khóa **Tab Quản trị (Admin Panel)** để test phân quyền & phân trang dữ liệu (Lesson 6 & 11) |
| **DragonSlayer** | `123456` | **user** | 850 Xu, danh hiệu "Bá Chủ 2048" |
| **CyberNinja** | `123456` | **user** | 620 Xu, danh hiệu "Thần Rắn" |

---

## 📁 CẤU TRÚC THƯ MỤC CHUẨN MVC

```
Final_project/
├── .env                       # Biến môi trường (Lesson 7)
├── .env.example               # Mẫu cấu hình deploy (Lesson 12)
├── package.json               # Cấu hình dự án & dependencies
├── README.md                  # Hướng dẫn chi tiết & bảng ánh xạ 14 bài học
├── server/                    # MÃ NGUỒN BACK-END (MVC)
│   ├── index.js               # Express Server & Middleware (Lesson 1, 2, 5)
│   ├── config/
│   │   └── db.js              # Kết nối MongoDB Mongoose & Seed (Lesson 4, 9)
│   ├── models/                # Mongoose Models (Lesson 4, 7, 9)
│   │   ├── User.js            # User Schema, Hash password, Roles
│   │   ├── Score.js           # Score Schema, Relationship ref: 'User'
│   │   ├── Item.js            # Shop Item Schema
│   │   └── Inventory.js       # Inventory Schema, Relationship User-Item
│   ├── middlewares/           # Middlewares (Lesson 5, 6, 8, 10)
│   │   ├── authMiddleware.js  # JWT Token Verification
│   │   ├── roleMiddleware.js  # Role-based Authorization (Admin)
│   │   ├── uploadMiddleware.js# Multer File Upload Config
│   │   └── errorMiddleware.js # Centralized Error Handler
│   ├── controllers/           # Controllers (Lesson 5)
│   │   ├── authController.js  # Đăng ký, đăng nhập, JWT, hash password
│   │   ├── uploadController.js# Tải ảnh avatar (Lesson 10)
│   │   └── userController.js  # Admin CRUD, Tìm kiếm, Phân trang (Lesson 6, 11)
│   ├── routes/                # Express Routes (Lesson 5)
│   │   ├── authRoutes.js      # /api/auth
│   │   ├── uploadRoutes.js    # /api/upload
│   │   ├── userRoutes.js      # /api/users
│   │   ├── games.js           # /api/games
│   │   ├── shop.js            # /api/shop
│   │   └── wheel.js           # /api/wheel
│   └── uploads/               # Thư mục lưu file tải lên (Lesson 10)
│       └── avatars/           # Ảnh đại diện người dùng
└── client/                    # MÃ NGUỒN FRONT-END
    ├── index.html             # Giao diện SPA, tích hợp Admin Panel & Upload modal
    ├── css/
    │   └── style.css          # Design System Dark Neon, Glassmorphism, Responsive
    └── js/
        ├── sound.js           # Bộ tổng hợp âm thanh Web Audio API
        ├── api.js             # REST API Client (Fetch, JWT, FormData Upload)
        ├── auth.js            # Quản trị phiên đăng nhập & phân quyền UI
        ├── shop.js            # Giao diện Cửa hàng
        ├── leaderboard.js     # Giao diện Bảng xếp hạng & Bục vinh quang
        ├── app.js             # Điều hướng View, Admin Management, Upload
        └── games/
            ├── caro.js        # Minigame Cờ Caro & AI thông minh
            ├── snake.js       # Minigame Cyber Snake 2.0 Canvas
            ├── game2048.js    # Minigame Neon 2048 & Hoàn tác
            └── wheel.js       # Minigame Vòng quay may mắn & Vật lý
```
