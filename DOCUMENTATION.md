# Tài liệu Xây dựng Agent - Website L-Corparation

Tài liệu này ghi lại quá trình và logic xây dựng các thành phần chính của website L-Corparation, nhằm mục đích cung cấp thông tin cho AI agent để hiểu và tái tạo các chức năng.

## 1. Tổng quan Dự án

-   **Mục tiêu:** Xây dựng một trang web giới thiệu sản phẩm cho công ty xe điện "L-Corparation".
-   **Công nghệ chính:** HTML, CSS, JavaScript (Bootstrap 5).
-   **Điểm nổi bật:** Giao diện động, tải dữ liệu từ một file riêng biệt và có các hiệu ứng chuyển động mượt mà.

## 2. Cấu trúc File

-   `Pages/index.html`: File HTML chính, chứa cấu trúc khung của trang web. Các khu vực nội dung động (như carousel) được để trống và sẽ được JavaScript điền vào.
-   `Css/style.css`: Chứa tất cả các style tùy chỉnh, bao gồm layout, màu sắc, và các `@keyframes` animation.
-   `JavaScript/car-data.js` & `JavaScript/scooter-data.js`: Chứa dữ liệu xe ô tô và xe máy điện riêng biệt. Thay thế cho `data.js` cũ.
-   `JavaScript/language-data.js`: Chứa từ điển ngôn ngữ (EN/VI) và logic chuyển đổi ngôn ngữ (`t()`, `setLanguage()`).
-   `JavaScript/navbar.js`: Xử lý logic cho thanh điều hướng và cuộn trang.
-   `JavaScript/mega-menu.js`: Xử lý logic hiển thị và carousel cho Mega Menu.
-   `JavaScript/featured-carousel.js`: Xử lý logic cho carousel sản phẩm nổi bật (Featured Vehicles).
-   `JavaScript/main.js`: File điều phối chính, khởi tạo các module khác.

## 3. Logic Xây dựng các Thành phần chính

### 3.1. Đa ngôn ngữ (Internationalization - i18n)

Hệ thống hỗ trợ chuyển đổi giữa Tiếng Anh (EN) và Tiếng Việt (VI).

-   **Dữ liệu:** Lưu trong `translations` object tại `language-data.js`.
-   **Hàm `t(key)`:** Trả về chuỗi dịch dựa trên ngôn ngữ hiện tại.
-   **Cập nhật giao diện:** Hàm `setLanguage(lang)` sẽ:
    1.  Cập nhật biến `currentLang`.
    2.  Tìm các thẻ có thuộc tính `data-i18n` để thay đổi text tĩnh.
    3.  Gọi lại các hàm render (như `initVehicleSpecCarousel`, `renderMegaMenuContent`) để cập nhật nội dung động.

### 3.2. Carousel Sản phẩm Nổi bật (Featured Vehicle Carousel)

Đây là thành phần phức tạp nhất, được xây dựng với mục tiêu tối ưu hiệu suất và trải nghiệm người dùng.

**Nguyên tắc cốt lõi:**
Cấu trúc HTML của khu vực thông tin (`infoBox`) chỉ được render **một lần duy nhất** khi khởi tạo (`setupCarousel`). Khi người dùng bấm next/prev, chỉ có **nội dung** bên trong các thẻ (như tên, giá, thông số) được cập nhật, thay vì xóa và tạo lại toàn bộ khối HTML. Điều này giúp giữ vững layout và tối ưu hiệu năng.

**Luồng hoạt động (`updateDisplay` function):**

1.  **Cập nhật Ảnh (`imgElement`):**
    -   Thay đổi `src` của ảnh.
    -   Xóa class animation cũ (`slide-in-img`).
    -   Sử dụng `void imgElement.offsetWidth;` để buộc trình duyệt "reflow", đảm bảo animation có thể chạy lại.
    -   Thêm lại class `slide-in-img` để kích hoạt hiệu ứng trượt vào.

2.  **Cập nhật Tên xe (`nameEl`):**
    -   Cập nhật `textContent`.
    -   Kích hoạt lại animation `slide-in-name` bằng kỹ thuật reflow tương tự như ảnh.

3.  **Cập nhật Giá (`priceEl`, `priceOldEl`):**
    -   Cập nhật `textContent`.
    -   Kích hoạt lại animation `fade-in-price`.
    -   Kiểm tra sự tồn tại của `vehicle.price_old`. Nếu có, hiển thị giá cũ; nếu không, ẩn đi (`display: 'none'`).

4.  **Cập nhật Nhãn "New" (`newBadgeEl`):**
    -   Kiểm tra thuộc tính boolean `vehicle.isNew`.
    -   Nếu `true`, hiển thị nhãn (`display: 'inline-block'`) và kích hoạt animation.
    -   Nếu `false` hoặc không có, ẩn nhãn đi.
    -   **Vị trí:** Nhãn "New" được đặt `position: absolute` bên trong một `div` cha có `position: relative` để có thể nằm đè lên góc của nhãn loại xe.

5.  **Cập nhật Thông số (`specValueEls`):**
    -   Lặp qua các thẻ `<span>` có `data-spec`.
    -   Lấy giá trị tương ứng từ đối tượng `vehicle`, dịch nhãn qua hàm `t()` và cập nhật `textContent`.
    -   **Không có animation** cho phần này để giữ sự ổn định như yêu cầu.

### 3.3. Modal Thông số Kỹ thuật (Vehicle Specs Modal)

Hiển thị chi tiết thông số xe khi người dùng bấm "Chi tiết" hoặc "Detail".

-   **Layout:** Chia làm 2 cột.
    -   Cột trái: Bảng thông số kỹ thuật (có thanh cuộn nếu dài).
    -   Cột phải: Hình ảnh xe lớn.
-   **Dữ liệu:** Lấy từ mảng `specs` trong dữ liệu xe. Các nhãn (label) được dịch tự động qua hàm `t()`.

### 3.4. Logic Responsive (Media Queries)

-   **Vấn đề:** Trên màn hình lớn, nút prev/next nằm hai bên của carousel. Khi thu nhỏ, layout này bị vỡ, đẩy các nút xuống dưới.
-   **Giải pháp:**
    -   Trong `style.css`, sử dụng media query `@media (max-width: 991px)`.
    -   **Desktop (mặc định):** Wrapper (`.featured-vehicle-wrapper`) là `display: flex`. Các nút (`.spec-nav-btn`) là `position: static`.
    -   **Mobile (< 991px):** Wrapper chuyển thành `display: block`. Các nút được đổi thành `position: absolute`, `z-index: 20` và được căn chỉnh `top`, `left`/`right` để nằm đè lên khu vực ảnh, đảm bảo không phá vỡ layout chung.

### 3.5. Lịch sử Tương tác (Quá trình Tinh chỉnh)

Quá trình xây dựng được thực hiện lặp đi lặp lại dựa trên các yêu cầu:

1.  **Yêu cầu ban đầu:** Tên xe trượt, giá tiền fade, thông số giữ nguyên.
2.  **Tinh chỉnh Animation:**
    -   Đồng bộ animation của ảnh (trượt vào thay vì fade).
    -   Làm mượt chuyển động bằng cách sử dụng `cubic-bezier` và tăng thời gian animation, thêm độ trễ nhỏ (`stagger`) cho giá tiền.
3.  **Điều chỉnh UI (Layout & Content):**
    -   Thêm chữ "Giá từ".
    -   Di chuyển "Giá từ" lên trên giá tiền.
    -   Thêm giá cũ (giá discount).
    -   Di chuyển giá cũ xuống dưới giá mới.
    -   Thêm nhãn % giảm giá.
    -   Loại bỏ animation khỏi nhãn giảm giá.
4.  **Cập nhật Dữ liệu:**
    -   Đọc file `vinfast-specs.md` để cập nhật tên và thông số các xe.
    -   Thêm các xe mới vào `data.js` mà **không ghi đè** dữ liệu cũ, chỉ bổ sung vào cuối mảng.
5.  **Thêm tính năng mới:**
    -   Thêm tag "New" cho các xe mới ra mắt (`Viper`, `Felizs II`).
    -   Điều chỉnh vị trí tag "New" nằm đè lên góc của tag loại xe.
6.  **Sửa lỗi Responsive:** Xử lý lỗi vỡ layout của nút prev/next trên mobile.
7.  **Tái cấu trúc (Refactoring):** Chia nhỏ `main.js` thành các module (`navbar.js`, `mega-menu.js`, `featured-carousel.js`) và tách dữ liệu thành `car-data.js`, `scooter-data.js`.
8.  **Đa ngôn ngữ:** Thêm tính năng chuyển đổi Anh/Việt.
9.  **Nâng cấp Modal:** Chuyển modal thông số sang layout 2 cột (Bảng + Ảnh) và hỗ trợ dịch thuật.