/**
 * L-Corparation — Admin Entry Point
 * File: JavaScript/Pages/admin.js
 *
 * Chỉ chứa: khởi tạo khi DOMContentLoaded
 *   - Auth check + hiển thị tên/avatar
 *   - Ngày giờ đăng nhập
 *   - Stats realtime (đơn hôm nay, tư vấn mới)
 *
 * Mọi logic nghiệp vụ đã được tách sang:
 *   - admin-ui.js       → toast, formatVND, switchPage, toggleAdminPanel
 *   - admin-stats.js    → updateStats, updateOrdersBadge
 *   - admin-products.js → CRUD sản phẩm, filter, modal, specs, exportCSV
 *   - admin-orders.js   → đơn hàng, pagination, update status, view detail
 *
 * ⚠️  Phải load SAU TẤT CẢ các file trên trong Admin.html
 */

document.addEventListener('DOMContentLoaded', async () => {

  // ----------------------------------------------------------
  // AUTH — kiểm tra đăng nhập, hiển thị tên & avatar
  // ----------------------------------------------------------
  const user = await AuthAPI.getUser();
  if (!user) {
    showToast('Bạn chưa đăng nhập!', 'error');
  } else {
    const profile = await AuthAPI.getProfile();
    if (profile) {
      document.getElementById('adminName').textContent = profile.full_name || user.email;
      document.getElementById('adminAvatar').textContent = (profile.full_name || user.email)[0].toUpperCase();
    }
  }

  // ----------------------------------------------------------
  // NGÀY GIỜ ĐĂNG NHẬP
  // ----------------------------------------------------------
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const now = new Date();
  const dateStr = `${days[now.getDay()]}, ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  document.getElementById('adminDate').textContent = dateStr;

  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  document.getElementById('adminLoginTime').textContent = `${h}:${m}`;

  // ----------------------------------------------------------
  // STATS REALTIME — đơn hôm nay & tư vấn mới
  // (Tách riêng khỏi updateStats() vì query Supabase độc lập)
  // ----------------------------------------------------------
  const today = new Date().toISOString().split('T')[0];

  const { data: ordersToday } = await window.db
    .from('orders')
    .select('id', { count: 'exact' })
    .gte('created_at', today);
  document.getElementById('statOrdersToday').textContent = ordersToday?.length ?? 0;

  const { data: consultNew } = await window.db
    .from('consultations')
    .select('id', { count: 'exact' })
    .eq('status', 'new');
  document.getElementById('statConsultNew').textContent = consultNew?.length ?? 0;

  // ----------------------------------------------------------
  // Ghi chú: loadCategories() và loadProducts() được gọi tự động
  // trong DOMContentLoaded của admin-products.js
  // ----------------------------------------------------------
});
