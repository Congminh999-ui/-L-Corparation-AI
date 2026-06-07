/**
 * L-Corparation — Admin UI Helpers
 * File: JavaScript/Pages/admin-ui.js
 *
 * Chứa: showToast, formatVND, confirm overlay, toggleAdminPanel, switchPage
 *
 * ⚠️  Dependency: không cần gì — load ĐẦU TIÊN trong nhóm admin scripts
 */

// ============================================================
// TOAST
// ============================================================
function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark';
    const el = document.createElement('div');
    el.className = `lcorp-toast ${type}`;
    el.innerHTML = `<i class="fa-solid ${icon} toast-icon" style="font-size:18px"></i><span class="toast-msg">${msg}</span>`;
    container.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(100%)';
        el.style.transition = 'all 0.3s';
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

// ============================================================
// FORMAT VND
// ============================================================
function formatVND(n) {
    if (!n) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

// ============================================================
// CONFIRM OVERLAY — UI layer (logic delete nằm trong admin-products.js)
// ============================================================
function closeConfirm() {
    document.getElementById('confirmOverlay').classList.remove('active');
    // Reset pendingDeleteId qua window để admin-products.js tự xử lý
    if (typeof window._onConfirmClose === 'function') window._onConfirmClose();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('confirmOverlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeConfirm();
    });
});

// ============================================================
// TOGGLE ADMIN PANEL (sidebar footer)
// ============================================================
function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    const chevron = document.getElementById('adminChevron');
    panel.classList.toggle('open');
    chevron.classList.toggle('rotated');
}

// ============================================================
// SWITCH PAGE — router giữa Products / Orders / Finance / Insight / Importer
// ============================================================
function switchPage(page) {
    window._currentAdminPage = page;

    // Đóng chat panel nếu đang mở và chuyển sang trang khác
    if (page !== 'chat' && window.AdminChatbot) {
        window.AdminChatbot.close();
    }

    document.querySelectorAll('.nav-item[data-page]').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

    const pageProducts = document.getElementById('pageProducts');
    const pageOrders = document.getElementById('pageOrders');
    const statsRow = document.getElementById('statsRow');
    const topbarTitle = document.getElementById('pageTitle');
    const topbarActions = document.querySelector('.topbar-actions');

    if (page === 'products') {
        if (pageProducts) pageProducts.style.display = '';
        if (pageOrders) pageOrders.style.display = 'none';
        if (statsRow) statsRow.style.display = '';
        if (topbarTitle) topbarTitle.innerHTML = 'Quản lý <span>Sản phẩm</span>';
        if (topbarActions) topbarActions.innerHTML = `
            <button class="btn-primary-green" onclick="openProductModal()">
                <i class="fa-solid fa-plus"></i> Thêm sản phẩm
            </button>`;

    } else if (page === 'orders') {
        if (pageProducts) pageProducts.style.display = 'none';
        if (pageOrders) pageOrders.style.display = '';
        if (statsRow) statsRow.style.display = 'none';
        if (topbarTitle) topbarTitle.innerHTML = 'Quản lý <span>Đơn hàng</span>';
        if (topbarActions) topbarActions.innerHTML = `
            <button class="btn-outline-green" onclick="loadOrders()">
                <i class="fa-solid fa-rotate-right"></i> Làm mới
            </button>`;
        if (typeof loadOrders === 'function') loadOrders();

    } else if (page === 'finance') {
        document.querySelectorAll('[id^="page"]').forEach(el => el.style.display = 'none');
        const pf = document.getElementById('pageFinance');
        if (pf) pf.style.display = 'block';
        if (topbarTitle) topbarTitle.innerHTML = 'Báo cáo <span>Tài chính</span>';
        if (topbarActions) topbarActions.innerHTML = '';
        if (window.FinanceModule && pf) {
            const now = new Date();
            window.FinanceModule.getSummary(now.getMonth() + 1, now.getFullYear())
                .then(html => { pf.innerHTML = html; });
        }

    } else if (page === 'insight') {
        document.querySelectorAll('[id^="page"]').forEach(el => el.style.display = 'none');
        const pi = document.getElementById('pageInsight');
        if (pi) pi.style.display = 'block';
        if (topbarTitle) topbarTitle.innerHTML = 'Phân tích <span>Bán hàng</span>';
        if (topbarActions) topbarActions.innerHTML = '';
        if (window.InsightModule && pi) {
            window.InsightModule.analyze()
                .then(html => { pi.innerHTML = html; });
        }

    } else if (page === 'importer') {
        document.querySelectorAll('[id^="page"]').forEach(el => el.style.display = 'none');
        const pm = document.getElementById('pageImporter');
        if (pm) pm.style.display = 'block';
        if (topbarTitle) topbarTitle.innerHTML = 'Nhập sản phẩm <span>AI</span>';
        if (topbarActions) topbarActions.innerHTML = '';
        if (window.ImporterModule) window.ImporterModule.init();

    } else {
        showToast('Tính năng đang phát triển...', 'error');
    }
}

// ============================================================
// EXPORT GLOBALS — các hàm được gọi từ inline onclick trong HTML
// ============================================================
window.showToast = showToast;
window.formatVND = formatVND;
window.closeConfirm = closeConfirm;
window.toggleAdminPanel = toggleAdminPanel;
window.switchPage = switchPage;