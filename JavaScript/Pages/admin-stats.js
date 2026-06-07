/**
 * L-Corparation — Admin Stats
 * File: JavaScript/Pages/admin-stats.js
 *
 * Chứa: updateStats (stat cards sản phẩm), updateOrdersBadge
 * Các stat realtime (đơn hôm nay, tư vấn mới) được init trong admin.js
 *
 * ⚠️  Dependency: admin-ui.js (showToast), window.db (Supabase-client.js)
 */

// ============================================================
// GUARD — fail rõ ràng thay vì âm thầm
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (!window.db) {
        console.error('[admin-stats] ❌ window.db chưa sẵn sàng — kiểm tra Supabase-client.js load trước file này');
    }
    if (!window.showToast) {
        console.error('[admin-stats] ❌ showToast chưa sẵn sàng — kiểm tra admin-ui.js load trước file này');
    }
});

// ============================================================
// STAT CARDS — đếm từ allProducts (được set bởi admin-products.js)
// ============================================================
function updateStats() {
    // allProducts là biến của admin-products.js, truy cập qua window
    const products = window._allProducts || [];

    const cars = products.filter(p => p.categories?.slug === 'car').length;
    const scooters = products.filter(p => p.categories?.slug === 'scooter').length;
    const accessories = products.filter(p =>
        ['car_acc', 'scooter_acc', 'lifestyle'].includes(p.categories?.slug)
    ).length;

    document.getElementById('statTotal').textContent = products.length;
    document.getElementById('statCars').textContent = cars;
    document.getElementById('statScooters').textContent = scooters;
    document.getElementById('statAccessories').textContent = accessories;
    document.getElementById('sidebarProductCount').textContent = products.length;
}

// ============================================================
// ORDERS BADGE — cập nhật số đơn trên sidebar
// ============================================================
function updateOrdersBadge() {
    const badge = document.getElementById('sidebarOrderCount');
    const orders = window._allOrders || [];
    if (badge) badge.textContent = orders.length;
}

// ============================================================
// EXPORT GLOBALS
// ============================================================
window.updateStats = updateStats;
window.updateOrdersBadge = updateOrdersBadge;