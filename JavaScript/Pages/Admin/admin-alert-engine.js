/**
 * admin-alert-engine.js
 * Chạy khi load trang + mỗi 5 phút, kiểm tra 5 điều kiện cảnh báo
 */

window.AlertEngine = (() => {
    let _config = {
        stock_threshold: 5,
        order_delay_hours: 48,
        consult_delay_hours: 24
    };

    // Đọc config từ Supabase
    async function _loadConfig() {
        try {
            const { data, error } = await window.db.from('alert_config').select('key, value');
            if (error || !data) return;
            data.forEach(row => {
                const num = parseInt(row.value, 10);
                if (!isNaN(num)) _config[row.key] = num;
            });
        } catch (e) {
            console.warn('[AlertEngine] Không tải được alert_config:', e.message);
        }
    }

    // Kiểm tra 5 điều kiện, trả về mảng cảnh báo
    async function _check() {
        const alerts = [];
        const now = new Date();

        // --- 1. Tồn kho thấp ---
        try {
            const { data } = await window.db
                .from('products')
                .select('name, stock')
                .lt('stock', _config.stock_threshold)
                .eq('is_active', true);
            if (data && data.length) {
                const names = data.slice(0, 5).map(p => `<b>${p.name}</b> (${p.stock})`).join(', ');
                alerts.push({
                    level: 'warning',
                    message: `⚠️ ${data.length} sản phẩm tồn kho thấp: ${names}${data.length > 5 ? '...' : ''}`
                });
            }
        } catch (e) { console.warn('[AlertEngine] check#1 lỗi:', e.message); }

        // --- 2. Đơn pending quá giờ ---
        try {
            const threshold = new Date(now - _config.order_delay_hours * 3600 * 1000).toISOString();
            const { data } = await window.db
                .from('orders')
                .select('order_code, created_at')
                .eq('status', 'pending')
                .lt('created_at', threshold);
            if (data && data.length) {
                alerts.push({
                    level: 'error',
                    message: `🔴 ${data.length} đơn hàng PENDING quá ${_config.order_delay_hours}h chưa xử lý`
                });
            }
        } catch (e) { console.warn('[AlertEngine] check#2 lỗi:', e.message); }

        // --- 3. Tư vấn mới chưa xử lý ---
        try {
            const threshold = new Date(now - _config.consult_delay_hours * 3600 * 1000).toISOString();
            const { data } = await window.db
                .from('consultations')
                .select('id')
                .eq('status', 'new')
                .lt('created_at', threshold);
            if (data && data.length) {
                alerts.push({
                    level: 'warning',
                    message: `📩 ${data.length} yêu cầu tư vấn chưa xử lý quá ${_config.consult_delay_hours}h`
                });
            }
        } catch (e) { console.warn('[AlertEngine] check#3 lỗi:', e.message); }

        // --- 4. Doanh thu hôm nay = 0 sau 18:00 ---
        try {
            if (now.getHours() >= 18) {
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                const { data } = await window.db
                    .from('orders')
                    .select('id')
                    .eq('status', 'completed')
                    .gte('created_at', todayStart);
                if (!data || data.length === 0) {
                    alerts.push({
                        level: 'warning',
                        message: `📊 Hôm nay chưa có đơn hàng hoàn thành nào (sau 18:00)`
                    });
                }
            }
        } catch (e) { console.warn('[AlertEngine] check#4 lỗi:', e.message); }

        // --- 5. Sản phẩm 0 đơn trong 30 ngày ---
        try {
            const thirtyDaysAgo = new Date(now - 30 * 24 * 3600 * 1000).toISOString();
            // Lấy product IDs có trong order_items 30 ngày qua
            const { data: activeItems } = await window.db
                .from('order_items')
                .select('product_id, orders!inner(created_at)')
                .gte('orders.created_at', thirtyDaysAgo);

            const activeIds = new Set((activeItems || []).map(i => i.product_id));

            const { data: allProducts } = await window.db
                .from('products')
                .select('id, name')
                .eq('is_active', true);

            if (allProducts) {
                const deadStock = allProducts.filter(p => !activeIds.has(p.id));
                if (deadStock.length) {
                    const names = deadStock.slice(0, 3).map(p => `<b>${p.name}</b>`).join(', ');
                    alerts.push({
                        level: 'info',
                        message: `📦 ${deadStock.length} sản phẩm chưa bán được trong 30 ngày: ${names}${deadStock.length > 3 ? '...' : ''}`
                    });
                }
            }
        } catch (e) { console.warn('[AlertEngine] check#5 lỗi:', e.message); }

        return alerts;
    }

    async function run() {
        await _loadConfig();
        const alerts = await _check();

        // Cập nhật badge
        const count = alerts.filter(a => a.level !== 'info').length;
        if (typeof window.AdminChatbot !== 'undefined') {
            window.AdminChatbot.showBadge(count);
        }

        // Hiện toast cho lỗi/cảnh báo đầu tiên
        if (typeof showToast === 'function') {
            alerts.forEach(alert => {
                const type = alert.level === 'error' ? 'error'
                    : alert.level === 'warning' ? 'warning'
                        : 'info';
                showToast(alert.message, type);
            });
        }

        return alerts;
    }

    // Chạy ngay khi trang load
    document.addEventListener('DOMContentLoaded', () => {
        // Chờ 3s để các module khác tải xong
        setTimeout(run, 3000);
        // Lặp lại mỗi 5 phút
        setInterval(run, 5 * 60 * 1000);
    });

    return { run };
})();