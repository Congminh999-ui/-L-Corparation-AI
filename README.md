# 🌟 L-CORPARATION - NỀN TẢNG THƯƠNG MẠI & TRƯNG BÀY XE ĐIỆN

> Website hiện đại, đẳng cấp được thiết kế riêng để giới thiệu và kinh doanh các dòng sản phẩm xe điện (Ô tô & Xe máy điện) của hệ sinh thái năng lượng xanh L-Corparation.

---

## 🎯 TỔNG QUAN DỰ ÁN

**L-Corparation** không chỉ là một trang web giới thiệu sản phẩm đơn thuần mà còn là một nền tảng thương mại điện tử mini tích hợp hàng loạt các trải nghiệm tương tác (Interactive UI) cao cấp dành cho người dùng.

Dự án được xây dựng với mục đích phô diễn khả năng xử lý giao diện phức tạp, quản lý trạng thái, tối ưu hóa hiệu suất hiển thị (lazy loading), và đặc biệt là khả năng cá nhân hóa trải nghiệm với hệ thống đa ngôn ngữ.

---

## 🚀 WEBSITE CÓ THỂ LÀM ĐƯỢC GÌ? (TÍNH NĂNG NỔI BẬT)

Sau quá trình phát triển liên tục, website hiện tại cung cấp các chức năng sau:

### 1. 🚙 Hệ Thống Trưng Bày Xe Nâng Cao (Featured Vehicles)

- **Hiệu ứng Carousel Tương Tác:** Hiển thị danh sách Ô tô điện và Xe máy điện thông qua các khối slider điều hướng mượt mà. Nội dung text (Slide-in-name) và hình ảnh (Slide-in-img) được thiết kế đồng bộ chuyển động.
- **Hệ thống nhãn thông minh:** Tự động gắn nhãn "NEW" cho sản phẩm mới, tính toán và hiển thị giá khuyến mãi/giá cũ một cách trực quan.
- **Xem chi tiết kỹ thuật:** Người dùng có thể click để xem Modal (Brochure) so sánh chi tiết các thông số kỹ thuật (Quãng đường, Tốc độ, Trọng lượng...).

### 2. 🛒 Shopping Cart & Phụ Kiện (Ecommerce mini)

- **Tìm kiếm & Phân loại:** Người dùng có thể tìm kiếm và lọc các phụ kiện xe hơi, đồ lifestyle theo danh mục mong muốn.
- **Thêm vào giỏ hàng (Cart):** Quản lý giỏ hàng trực tiếp từ Navbar và Mobile Bottom Navigation. Hiển thị số lượng ngay trên badge giỏ hàng.
- **Tính năng Thanh toán (Checkout Module):** Cung cấp các thao tác cần thiết nhất cho quy trình thương mại điện tử tiêu chuẩn.

### 3. 🗺️ Tra Cứu Trạm Sạc Tích Hợp Google Maps Thực Tế

- **Interactive Map:** Bản đồ trạm sạc tích hợp iframe từ Google Maps với UI hiện đại giúp người dùng dễ dàng định vị các điểm sạc trên toàn quốc.
- **Lọc trạm sạc:** Phân loại theo "Sạc siêu nhanh", "Sạc thường", trạng thái "Đang hoạt động/Đang bảo trì".
- **Tính năng Chỉ đường:** Chỉ với một click, kết nối thẳng tới đường dẫn Google Maps Direction của người dùng.

### 4. 🌍 Đa Ngôn Ngữ Thời Gian Thực (i18n Real-time)

- **Chuyển ngữ không độ trễ:** Chuyển đổi toàn bộ ngôn ngữ trên trang web (Tiếng Việt ⇌ English) ngay lập tức mà không cần reload trang.
- Dịch thuật từ Menu, Modal, Placeholder, đến tên các thông số xe.

### 5. 🛠️ Trung Tâm Bảo Hành & Chăm Sóc Khách Hàng

- Giao diện trực quan phân bố hai khu vực dịch vụ cho Ô tô và Xe máy điện.
- Hỗ trợ các nút thao tác hướng dẫn khắc phục sự cố, chính sách bảo hành Pin LFP hoặc đặt lịch trực tuyến.

### 6. 💬 Hệ Thống Popup Đăng Ký Tư Vấn & Đặt Cọc

- **Promo Banners:** Các popup tự động làm nổi bật các chương trình ưu đãi mới.
- **Form Đặt Cọc:** Giao diện nhập thông tin chi tiết mua xe, loại xe muốn cọc và các hình thức đặt cọc (Chuyển khoản, Thẻ tín dụng, Tại Showroom).
- **Form Nhận Tư Vấn:** Dễ dàng thao tác gọi hỗ trợ, đăng ký qua form gắn ngay trên Navbar.

### 7. 📱 Trải Nghiệm Chuẩn Di Động (Mobile-First Experience)

- Tối ưu cực tốt dựa trên framework Bootstrap 5.
- Cung cấp **Mobile Bottom Navigation** (app-like experience) trên điện thoại, ghim nút điều hướng đến các thành phần quan trọng: Trang chủ, Ô tô, Xe máy, Phụ kiện, Trạm sạc.
- **Mega Menu Desktop:** Danh mục trượt mượt mà cho các thiết bị kích thước lớn.

---

## 🛠 CÔNG NGHỆ SỬ DỤNG

Dự án được xây dựng mà không phụ thuộc vào các framework JavaScript nặng (React/Vue/Angular), giữ ở mức Native để đảm bảo tốc độ và trải nghiệm Frontend tối cao:

- **Ngôn ngữ lõi:** HTML5, CSS3, JavaScript (ES6+).
- **CSS Framework:** Bootstrap 5.3.3.
- **Icons & Fonts:** FontAwesome 6, Google Fonts (Roboto).
- **Architecture:** Chia nhỏ các logic JavaScript thành từng module phân lập (Mega menu xử lý riêng, i18n xử lý riêng, Carousel xử lý riêng...).

---

## 📂 CẤU TRÚC THƯ MỤC CHÍNH

```text
Webiste Đồ Án/
├── 📄 Pages/
│   └── index.html              # Layout trung tâm tích hợp toàn bộ Web Components
├── 🎨 Css/
│   └── style.css               # Styling tuỳ chỉnh, hiệu ứng Animation độc quyền
├── 📜 JavaScript/
│   ├── Data/
│   │   ├── car-data.js         # JSON Database xe ô tô
│   │   ├── scooter-data.js     # JSON Database xe máy điện
│   │   └── language-data.js    # Tự điển i18n (VI/EN)
│   ├── main.js                 # Điều phối chung
│   ├── mega-menu.js            # Hiệu ứng Header Dropdown
│   ├── navbar.js               # Logic cuộn trang
│   ├── featured-carousel.js    # Logic Slider phức tạp
│   └── ...                     # Các controllers khác
└── 🖼️ Data/                    # Kho hình ảnh (Webp tối ưu dung lượng)
```

---

## 💻 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

Vì dự án chạy bằng HTML/JS thuần, nên không cần build qua Node.js:

1. **Sử dụng Live Server trên VS Code (Khuyến nghị):**
   - Mở folder bằng Visual Studio Code.
   - Cài extension `Live Server`.
   - Chuột phải vào `Pages/index.html` chọn **"Open with Live Server"**.

2. **Chạy trực tiếp (Local file):**
   - Đơn giản chỉ cần vào folder `Pages/` click đúp chuột mở file `index.html` trên bất kỳ trình duyệt nào.

---

## 🔮 ĐỊNH HƯỚNG TƯƠNG LAI

- Kết nối tới Database (MySQL/MongoDB/Firebase) kết hợp PHP hoặc Node.js để lưu giữ đơn đặt cọc, thông tin khách hàng.
- Cải thiện SEO tổng thể (Meta Tags, Semantic HTML).
- Tích hợp cổng thanh toán Sandbox (VNPAY/Stripe) cho phần linh kiện/đặt cọc xe.

---

_© 2026 L-Corparation. Mọi quyền được bảo lưu. Dự án được thiết kế cho mục đích Đồ Án / Đánh giá Năng lực._
