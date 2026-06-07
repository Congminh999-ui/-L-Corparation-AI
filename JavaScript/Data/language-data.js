/**
 * L-Corparation — Language Data & i18n Logic
 * Hỗ trợ: Tiếng Việt (vi) | English (en)
 *
 * Tích hợp hệ thống pub/sub __langListeners:
 * Các plugin (history.js, news.js, v.v.) có thể đăng ký callback
 * để tự cập nhật ngôn ngữ khi người dùng chuyển đổi.
 *
 * Cách dùng trong plugin:
 *   window.__langListeners = window.__langListeners || [];
 *   window.__langListeners.push(() => { renderMyPlugin(); });
 */

// Guard: chặn load 2 lần nếu vô tình import nhiều lần
if (typeof window.__langModuleLoaded !== 'undefined') {
    throw new Error('[LangData] Đã được load, bỏ qua lần thứ hai.');
}
window.__langModuleLoaded = true;

// ============================================================
// TRANSLATIONS — Toàn bộ bản dịch vi / en
// ============================================================
const translations = {
    en: {
        // Navbar
        nav_home: 'Home',
        nav_vehicles: 'Vehicles',
        nav_accessory: 'Accessories',
        nav_charging: 'Charging',
        nav_warranty: 'Service Center',
        nav_news: 'News',
        nav_about: 'About',
        nav_contact: 'Contact',

        // Mobile bottom nav
        mbn_home: 'Home',
        mbn_cars: 'Cars',
        mbn_scooters: 'Scooters',
        mbn_accessory: 'Accessories',
        mbn_charging: 'Charging',
        mbn_warranty: 'Warranty',
        mbn_cart: 'Cart',

        // Deposit Section
        deposit_title: 'Vehicle Deposit',
        deposit_subtitle: 'Leave your information, we will contact you for advice and support you to deposit the car as quickly as possible.',
        deposit_customer_info: 'CUSTOMER INFORMATION',
        deposit_name: 'Full Name *',
        deposit_phone: 'Phone Number *',
        deposit_email: 'Email *',
        deposit_vehicle_choice: 'VEHICLE SELECTION',
        deposit_vehicle_model: 'Vehicle Model *',
        deposit_amount_label: 'Expected Deposit Amount',
        deposit_btn: 'DEPOSIT NOW',
        deposit_note: 'Additional Note',
        deposit_success: 'Deposit successful! We will contact you shortly.',

        // Charging Section
        charging_title: 'Nationwide Charging Network',
        charging_subtitle: 'Find the nearest VinFast charging stations to stay powered on every journey.',
        charging_search_placeholder: 'Enter address or city name...',
        charging_label_all: 'All',
        charging_label_fast: 'Ultra Fast',
        charging_label_normal: 'Service Center',
        charging_status_active: 'Active',
        charging_status_busy: 'Busy',
        charging_status_maintenance: 'Maintaining',
        charging_btn_direction: 'Directions',
        charging_btn_list: 'Station list',
        charging_coming_soon: 'Charging station system is being updated...',

        // Mega Menu
        cars_title: 'Featured Cars',
        scooters_title: 'Featured Scooters',
        btn_detail: 'Detail',

        // Hero
        hero_title: 'L-CORPORATION',
        hero_subtitle: 'Where innovation meets comfort, bringing you exceptional quality, exquisite design, and experiences that inspire your everyday journey.',
        hero_slogan: 'Driving Innovation for a Greener Tomorrow',
        hero_btn_explore: 'Explore Vehicles',
        hero_btn_learn_more: 'Learn More',
        hero_btn_order: 'Order Now',
        hero_btn_about: 'About Us',
        hero_badge_eco: '🌿 100% Eco-Friendly',
        hero_badge_warranty: '🛡️ 10-Year Warranty',
        hero_stat_vehicles: 'Vehicles Delivered',
        hero_stat_stations: 'Charging Stations',
        hero_stat_countries: 'Countries',

        // Carousel / Specs
        spec_range: 'Range',
        spec_seats: 'Seats',
        spec_power: 'Power',
        spec_acceleration: '0-100km/h',
        spec_warranty: 'Warranty',
        spec_warranty_val: '10 Years',
        spec_airbags: 'Airbags',
        spec_airbags_val: '6-11 Bags',
        spec_max_speed: 'Max Speed',
        spec_charge: 'Charging Time',
        spec_waterproof: 'Waterproof',
        spec_engine: 'Engine',
        spec_engine_val: 'In-hub Motor',
        spec_trunk: 'Trunk',
        spec_trunk_val: 'Spacious',
        spec_price_from: 'Price :',
        spec_discount_10: '10% Discount',
        spec_discount_8: '8% Discount',
        btn_order: 'Order Now',
        badge_new: 'New',
        badge_car: 'Electric Car',
        badge_scooter: 'E-Scooter',

        // Accessories
        accessories_sidebar_title: 'Categories',
        accessories_search_placeholder: 'Search accessories...',
        accessories_search_button: 'Search',
        accessories_results_prefix: 'Found',
        accessories_results_suffix: 'products',
        accessories_empty_title: 'No products found',
        accessories_empty_text: 'Please try a different keyword or choose another category.',
        accessories_load_more: 'Load more accessories',
        accessories_fit_for: 'Suitable for:',
        accessories_cart_button: 'Add to cart',
        accessories_cat_all: 'All Products',
        accessories_cat_new: 'New Arrivals',
        accessories_cat_lifestyle: 'Lifestyle',
        accessories_cat_car: 'Car Accessories',
        accessories_cat_scooter: 'Scooter Acc',
        accessories_cat_charging: 'Charging & Battery',
        accessories_cat_maintenance: 'Maintenance',
        accessories_tab_car: 'Car accessories',
        accessories_tab_scooter: 'E-scooter accessories',

        // About Us
        about_tagline: 'Our Vision',
        about_title: 'About L-Corparation',
        about_subtitle: 'Pioneering the Future of Green Mobility.',
        about_p1: 'L-Corparation was founded with a <i>revolutionary vision</i>: to create a <b>sustainable future</b> through <b>intelligent</b> and <b>eco-friendly transportation</b>.',
        about_p2: 'Our team of <b>passionate engineers</b> works tirelessly to craft electric vehicles that combine <b>performance, style, and environmental responsibility</b>.',
        about_p3: 'At L-Corparation, we are <b>pioneers in the green revolution</b>. Join us in our mission to <i>transform the way the world moves</i>.',
        about_read_more: 'Read More',
        about_read_less: 'Read Less',
        about_learn_more: 'Learn More',
        about_contact_us: 'Contact Us',

        // Modal
        modal_title: 'Technical Specifications',
        modal_close: 'Close',
        modal_deposit: 'Deposit Now',
        modal_updating: 'Detailed specifications for this vehicle are being updated.',

        // Footer
        footer_tagline: 'Leading the revolution in sustainable transportation for a greener future.',
        footer_products: 'Products',
        footer_support: 'Support',
        footer_contact: 'Contact Us',
        footer_electric_cars: 'Electric Cars',
        footer_e_scooters: 'E-Scooters',
        footer_accessories: 'Accessories',
        footer_chargers: 'Chargers',
        footer_help_center: 'Help Center',
        footer_warranty: 'Warranty',
        footer_shipping: 'Shipping Info',
        footer_returns: 'Returns',
        footer_phone: '+1 (800) 123-4567',
        footer_email: 'support@lcorp.com',
        footer_address: '390 Hoang Van Thu, Cao Đẳng Lý Tự Trọng, TC 12345',
        footer_copyright: '🄯 2026 L-Corparation. No rights reserved.',
        footer_privacy: 'Privacy Policy',
        footer_terms: 'Terms of Service',
        footer_cookies: 'Cookie Settings',

        // Popup
        popup_badge: 'HOT',
        popup_title: 'Spring Kickoff — Super Deals',
        popup_desc: 'Free charging for up to 3 years when you deposit an electric vehicle today.',
        popup_cta: 'Order Now',
        popup_dismiss: "Don't show again",
        popup_form_title: 'Register for Consultation',
        popup_form_desc: 'Please register to receive product consultation and the latest offers.',
        popup_name: 'Full Name *',
        popup_phone: 'Phone Number *',
        popup_email: 'Email *',
        popup_time: 'Consultation Time *',
        popup_vehicle_label: 'Vehicle of Interest',
        popup_submit: 'Register',
        popup_success: 'Registration successful! We will contact you soon.',
        nav_consultation: 'Consultation',

        // Warranty
        warranty_title: 'VinFast Comprehensive Warranty',
        warranty_badge: 'Official Policy',
        warranty_tab_car: 'Electric Car',
        warranty_tab_scooter: 'E-Scooter',
        warranty_tab_spare: 'Spare Parts',
        warranty_car_v89: 'VF 7, 8, 9',
        warranty_car_v89_vehicle: '10 YEARS / 200k km',
        warranty_car_v89_battery: '10 YEARS / Unlimited km',

        // Spec labels (dùng cho modal thông số kỹ thuật)
        'Range': 'Range',
        'Max Speed': 'Max Speed',
        'Battery Type': 'Battery Type',
        'Charging Time': 'Charging Time',
        'Waterproof Standard': 'Waterproof Standard',
        'Trunk Capacity': 'Trunk Capacity',
        'Vehicle Type': 'Vehicle Type',
        'Length x Width x Height': 'Length x Width x Height',
        'Wheel base': 'Wheel base',
        'Ground Clearance': 'Ground Clearance',
        'Curb Weight': 'Curb Weight',
        'Seating Capacity': 'Seating Capacity',
        'Max Power': 'Max Power',
        'Max Torque': 'Max Torque',
        'Acceleration (0-100km/h)': 'Acceleration (0-100km/h)',
        'Drive Type': 'Drive Type',
        'Battery Capacity': 'Battery Capacity',
        'Range (WLTP)': 'Range (WLTP)',
        'AC Charging (11kW)': 'AC Charging (11kW)',
        'DC Fast Charging (10-70%)': 'DC Fast Charging (10-70%)',
        'Colors': 'Colors',
        'Saddle Height': 'Saddle Height',
        'Tire Size (Front - Rear)': 'Tire Size (Front - Rear)',
        'Suspension': 'Suspension',
        'Lock Type': 'Lock Type',
        'Battery Weight': 'Battery Weight',
        'Nominal Power': 'Nominal Power',
        'Engine Type': 'Engine Type',
        'Acceleration (0-50km/h)': 'Acceleration (0-50km/h)',
    },

    vi: {
        // Navbar
        nav_home: 'Trang chủ',
        nav_vehicles: 'Sản phẩm',
        nav_accessory: 'Phụ kiện',
        nav_charging: 'Trạm sạc',
        nav_warranty: 'Bảo hành',
        nav_news: 'Tin tức',
        nav_about: 'Về chúng tôi',
        nav_contact: 'Liên hệ',

        // Mobile bottom nav
        mbn_home: 'Trang chủ',
        mbn_cars: 'Ô tô điện',
        mbn_scooters: 'Xe máy điện',
        mbn_accessory: 'Phụ kiện',
        mbn_charging: 'Trạm sạc',
        mbn_warranty: 'Bảo hành',
        mbn_cart: 'Giỏ hàng',

        // Deposit Section
        deposit_title: 'Đặt cọc xe',
        deposit_subtitle: 'Hãy để lại thông tin, chúng tôi sẽ liên hệ tư vấn và hỗ trợ bạn đặt cọc xe nhanh nhất.',
        deposit_customer_info: 'THÔNG TIN KHÁCH HÀNG',
        deposit_name: 'Họ và tên Quý khách *',
        deposit_phone: 'Số điện thoại *',
        deposit_email: 'Email *',
        deposit_vehicle_choice: 'LỰA CHỌN MẪU XE',
        deposit_vehicle_model: 'Mẫu xe *',
        deposit_amount_label: 'Số tiền đặt cọc dự kiến',
        deposit_btn: 'ĐẶT CỌC NGAY',
        deposit_note: 'Ghi chú thêm',
        deposit_success: 'Đặt cọc thành công! Chúng tôi sẽ liên hệ bạn sớm.',

        // Charging Section
        charging_title: 'Mạng lưới trạm sạc toàn quốc',
        charging_subtitle: 'Tìm kiếm các trạm sạc VinFast gần bạn nhất để nạp đầy năng lượng cho mọi hành trình.',
        charging_search_placeholder: 'Nhập địa chỉ hoặc tên thành phố...',
        charging_label_all: 'Tất cả',
        charging_label_fast: 'Sạc siêu nhanh',
        charging_label_normal: 'Trung tâm bảo trì',
        charging_status_active: 'Đang hoạt động',
        charging_status_busy: 'Đang bận',
        charging_status_maintenance: 'Đang bảo trì',
        charging_btn_direction: 'Chỉ đường',
        charging_btn_list: 'Danh sách trạm',
        charging_coming_soon: 'Hệ thống trạm sạc đang được cập nhật...',

        // Mega Menu
        cars_title: 'Các mẫu xe điện',
        scooters_title: 'Các mẫu xe máy điện',
        btn_detail: 'Chi tiết',

        // Hero
        hero_title: 'L-CORPORATION',
        hero_subtitle: 'Nơi sự đổi mới hòa quyện cùng sự thoải mái, mang đến cho bạn chất lượng vượt trội, thiết kế tinh tế và những trải nghiệm truyền cảm hứng cho hành trình mỗi ngày.',
        hero_slogan: 'Đổi mới vì một Tương lai Xanh hơn',
        hero_btn_explore: 'Khám phá xe',
        hero_btn_learn_more: 'Tìm hiểu thêm',
        hero_btn_order: 'Đặt hàng',
        hero_btn_about: 'Về chúng tôi',
        hero_badge_eco: '🌿 100% Thân thiện môi trường',
        hero_badge_warranty: '🛡️ Bảo hành 10 năm',
        hero_stat_vehicles: 'Xe đã bàn giao',
        hero_stat_stations: 'Trạm sạc',
        hero_stat_countries: 'Quốc gia',

        // Carousel / Specs
        spec_range: 'Quãng đường',
        spec_seats: 'Số chỗ',
        spec_power: 'Công suất',
        spec_acceleration: '0-100km/h',
        spec_warranty: 'Bảo hành',
        spec_warranty_val: '10 Năm',
        spec_airbags: 'Túi khí',
        spec_airbags_val: '6-11 Túi',
        spec_max_speed: 'Tốc độ tối đa',
        spec_charge: 'Thời gian sạc',
        spec_waterproof: 'Chống nước',
        spec_engine: 'Động cơ',
        spec_engine_val: 'Động cơ In-hub',
        spec_trunk: 'Cốp xe',
        spec_trunk_val: 'Rộng rãi',
        spec_price_from: 'Giá từ :',
        spec_discount_10: 'Giảm 10%',
        spec_discount_8: 'Giảm 8%',
        btn_order: 'Đặt cọc',
        badge_new: 'Mới',
        badge_car: 'Ô tô điện',
        badge_scooter: 'Xe máy điện',

        // Accessories
        accessories_sidebar_title: 'Danh mục',
        accessories_search_placeholder: 'Tìm kiếm phụ kiện...',
        accessories_search_button: 'Tìm',
        accessories_results_prefix: 'Tìm thấy',
        accessories_results_suffix: 'sản phẩm',
        accessories_empty_title: 'Không tìm thấy sản phẩm',
        accessories_empty_text: 'Vui lòng thử từ khóa khác hoặc chọn danh mục khác',
        accessories_load_more: 'Xem thêm',
        accessories_fit_for: 'Phù hợp:',
        accessories_cart_button: 'Giỏ hàng',
        accessories_cat_all: 'Tất cả sản phẩm',
        accessories_cat_new: 'Sản phẩm mới',
        accessories_cat_lifestyle: 'Phong cách sống',
        accessories_cat_car: 'Phụ kiện Ô tô điện',
        accessories_cat_scooter: 'Phụ kiện Xe máy',
        accessories_cat_charging: 'Sạc & Pin',
        accessories_cat_maintenance: 'Bảo dưỡng',
        accessories_tab_car: 'Phụ kiện ô tô',
        accessories_tab_scooter: 'Phụ kiện xe máy điện',

        // About Us
        about_tagline: 'Tầm nhìn của chúng tôi',
        about_title: 'Về L-Corparation',
        about_subtitle: 'Tiên phong cho Tương lai Di chuyển Xanh.',
        about_p1: 'L-Corparation được thành lập với một <i>tầm nhìn đột phá</i>: tạo ra một <b>tương lai bền vững</b> thông qua các phương tiện giao thông <b>thông minh</b> và <b>thân thiện với môi trường</b>.',
        about_p2: 'Đội ngũ <b>kỹ sư đầy tâm huyết</b> của chúng tôi kết hợp giữa <b>hiệu suất, phong cách và trách nhiệm với môi trường</b>.',
        about_p3: 'Tại L-Corparation, chúng tôi là những <b>người tiên phong trong cuộc cách mạng xanh</b>. Hãy cùng chúng tôi <i>thay đổi cách thế giới vận hành</i>.',
        about_read_more: 'Xem thêm',
        about_read_less: 'Thu gọn',
        about_learn_more: 'Tìm hiểu thêm',
        about_contact_us: 'Liên hệ',

        // Modal
        modal_title: 'Thông số kỹ thuật',
        modal_close: 'Đóng',
        modal_deposit: 'Đặt cọc ngay',
        modal_updating: 'Thông số chi tiết đang được cập nhật.',

        // Footer
        footer_tagline: 'Dẫn đầu cuộc cách mạng giao thông bền vững cho một tương lai xanh hơn.',
        footer_products: 'Sản phẩm',
        footer_support: 'Hỗ trợ',
        footer_contact: 'Liên hệ',
        footer_electric_cars: 'Xe Ô tô điện',
        footer_e_scooters: 'Xe máy điện',
        footer_accessories: 'Phụ kiện',
        footer_chargers: 'Trạm sạc',
        footer_help_center: 'Trung tâm hỗ trợ',
        footer_warranty: 'Bảo hành',
        footer_shipping: 'Thông tin vận chuyển',
        footer_returns: 'Hoàn trả',
        footer_phone: '+1 (800) 123-4567',
        footer_email: 'support@lcorp.com',
        footer_address: '390 Hoang Van Thu, Cao Đẳng Lý Tự Trọng, TC 12345',
        footer_copyright: '🄯 2026 L-Corparation. No rights reserved.',
        footer_privacy: 'Chính sách bảo mật',
        footer_terms: 'Điều khoản dịch vụ',
        footer_cookies: 'Cài đặt cookie',

        // Popup
        popup_badge: 'HOT',
        popup_title: 'Khai Xuân Mã Đáo — Siêu Lộc Ưu Đãi',
        popup_desc: 'Miễn phí sạc pin lên tới 3 năm khi đặt cọc xe điện ngay hôm nay.',
        popup_cta: 'Đặt hàng ngay',
        popup_dismiss: 'Không hiển thị lại',
        popup_form_title: 'Đăng ký nhận tư vấn',
        popup_form_desc: 'Quý khách vui lòng đăng ký để nhận tư vấn sản phẩm, ưu đãi mới nhất.',
        popup_name: 'Họ và tên *',
        popup_phone: 'Số điện thoại *',
        popup_email: 'Email *',
        popup_time: 'Giờ tư vấn *',
        popup_vehicle_label: 'Dòng xe quan tâm',
        popup_submit: 'Đăng ký',
        popup_success: 'Đăng ký thành công! Chúng tôi sẽ liên hệ bạn sớm.',
        nav_consultation: 'Đăng ký tư vấn',

        // Warranty
        warranty_title: 'Bảo Hành Toàn Diện VinFast',
        warranty_badge: 'Chính Sách Chính Hãng',
        warranty_tab_car: 'Ô Tô Điện',
        warranty_tab_scooter: 'Xe Máy Điện',
        warranty_tab_spare: 'Phụ Tùng',
        warranty_car_v89: 'VF 7, 8, 9',
        warranty_car_v89_vehicle: '10 NĂM / 200k km',
        warranty_car_v89_battery: '10 NĂM / Không giới hạn km',

        // Spec labels (dùng cho modal thông số kỹ thuật)
        'Range': 'Quãng đường',
        'Max Speed': 'Tốc độ tối đa',
        'Battery Type': 'Loại pin',
        'Charging Time': 'Thời gian sạc',
        'Waterproof Standard': 'Tiêu chuẩn chống nước',
        'Trunk Capacity': 'Dung tích cốp',
        'Vehicle Type': 'Loại xe',
        'Length x Width x Height': 'Dài x Rộng x Cao',
        'Wheel base': 'Chiều dài cơ sở',
        'Ground Clearance': 'Khoảng sáng gầm',
        'Curb Weight': 'Trọng lượng không tải',
        'Seating Capacity': 'Số chỗ ngồi',
        'Max Power': 'Công suất tối đa',
        'Max Torque': 'Mô-men xoắn cực đại',
        'Acceleration (0-100km/h)': 'Tăng tốc (0-100km/h)',
        'Drive Type': 'Hệ dẫn động',
        'Battery Capacity': 'Dung lượng pin',
        'Range (WLTP)': 'Quãng đường (WLTP)',
        'AC Charging (11kW)': 'Sạc AC (11kW)',
        'DC Fast Charging (10-70%)': 'Sạc nhanh DC (10-70%)',
        'Colors': 'Màu sắc',
        'Saddle Height': 'Chiều cao yên',
        'Tire Size (Front - Rear)': 'Kích thước lốp Trước - Sau',
        'Suspension': 'Giảm xóc trước và sau',
        'Lock Type': 'Khóa xe',
        'Battery Weight': 'Trọng lượng pin',
        'Nominal Power': 'Công suất danh định',
        'Engine Type': 'Loại động cơ',
        'Acceleration (0-50km/h)': 'Tăng tốc 0 - 50 km/h',
    },
};

// ============================================================
// STATE & CORE FUNCTIONS
// ============================================================
let currentLang = 'vi';

/**
 * Lấy bản dịch theo key.
 * Fallback về chính key nếu không tìm thấy — tránh crash UI.
 * @param {string} key
 * @returns {string}
 */
function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || key;
}

/**
 * Chuyển ngôn ngữ và cập nhật toàn bộ UI + thông báo tất cả plugin.
 * @param {'vi'|'en'} lang
 */
function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;

    // 1. Cập nhật text thuần (textContent)
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const val = translations[lang][el.getAttribute('data-i18n')];
        if (val !== undefined) el.textContent = val;
    });

    // 2. Cập nhật innerHTML (cho phép thẻ HTML trong bản dịch)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const val = translations[lang][el.getAttribute('data-i18n-html')];
        if (val !== undefined) el.innerHTML = val;
    });

    // 3. Cập nhật placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const val = translations[lang][el.getAttribute('data-i18n-placeholder')];
        if (val !== undefined) el.setAttribute('placeholder', val);
    });

    // 4. Cập nhật nút toggle ngôn ngữ
    const langFlag = document.getElementById('lang-flag');
    const langLabel = document.getElementById('lang-label');
    if (langFlag) {
        langFlag.src = lang === 'en'
            ? 'https://flagcdn.com/w40/vn.png'
            : 'https://flagcdn.com/w40/gb.png';
        langFlag.alt = lang === 'en' ? 'Tiếng Việt' : 'English';
    }
    if (langLabel) {
        langLabel.textContent = lang === 'en' ? 'Tiếng Việt' : 'English';
    }

    // 5. Re-render các component dùng data động
    if (typeof initVehicleSpecCarousel === 'function') initVehicleSpecCarousel();
    if (typeof renderMegaMenuContent === 'function') renderMegaMenuContent();

    if (typeof accessoriesData !== 'undefined' && accessoriesData.length > 0) {
        if (typeof renderCategories === 'function') renderCategories();
        if (typeof renderAccessories === 'function') renderAccessories();
    }

    // 6. Pub/Sub: thông báo tất cả plugin đã đăng ký
    // (thay thế hoàn toàn vai trò của lang-bridge.js — có thể xóa file đó)
    //
    // Cách đăng ký trong plugin:
    //   window.__langListeners = window.__langListeners || [];
    //   window.__langListeners.push(() => myRenderFn());
    if (Array.isArray(window.__langListeners)) {
        window.__langListeners.forEach(fn => {
            try {
                fn();
            } catch (err) {
                console.warn('[Lang] Plugin listener lỗi:', err.message);
            }
        });
    }
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Mặc định Tiếng Việt
    setLanguage('vi');

    // Nút toggle ngôn ngữ
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.addEventListener('click', e => {
            e.preventDefault();
            setLanguage(currentLang === 'en' ? 'vi' : 'en');
        });
    }
});