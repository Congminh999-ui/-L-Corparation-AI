/**
 * L-Corparation — Admin Orders
 * File: JavaScript/Pages/admin-orders.js
 *
 * Chứa: loadOrders, applyOrdersFilters, renderOrdersTable, pagination,
 *        updateOrderStatus, viewOrderDetail
 *
 * ⚠️  Dependency (theo thứ tự load):
 *   1. Supabase-client.js → window.db
 *   2. admin-ui.js        → showToast, formatVND
 *   3. admin-stats.js     → updateOrdersBadge
 */

// ============================================================
// GUARD
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const missing = [
        !window.db && 'window.db (Supabase-client.js)',
        !window.showToast && 'showToast (admin-ui.js)',
        !window.formatVND && 'formatVND (admin-ui.js)',
        !window.updateOrdersBadge && 'updateOrdersBadge (admin-stats.js)',
    ].filter(Boolean);
    if (missing.length) {
        console.error('[admin-orders] ❌ Thiếu dependency:', missing.join(', '));
    }
});

// ============================================================
// STATE — đặt trên window để admin-stats.js đọc được
// ============================================================
window._allOrders = [];
let _filteredOrders = [];
let _ordersPage = 1;
const _ORDERS_PAGE_SIZE = 15;

// ============================================================
// LOAD ORDERS
// ============================================================
async function loadOrders() {
    showOrdersLoading();

    const { data, error } = await window.db
        .from('orders')
        .select('*, order_items(product_name, unit_price, quantity, subtotal)')
        .order('created_at', { ascending: false });

    if (error) {
        showToast('Lỗi tải đơn hàng: ' + error.message, 'error');
        return;
    }

    window._allOrders = data || [];
    applyOrdersFilters();
    updateOrdersBadge();
}

function showOrdersLoading() {
    const tbody = document.getElementById('ordersTableBody');
    if (tbody) tbody.innerHTML = `
    <tr class="loading-row"><td colspan="7">
      <div class="spinner"></div>Đang tải đơn hàng từ Supabase...
    </td></tr>`;
}

// ============================================================
// FILTERS
// ============================================================
function applyOrdersFilters() {
    const search = (document.getElementById('ordersSearchInput')?.value || '').toLowerCase();
    const status = document.getElementById('ordersStatusFilter')?.value || '';

    _filteredOrders = window._allOrders.filter(o => {
        const matchSearch = !search
            || o.customer_name?.toLowerCase().includes(search)
            || o.customer_phone?.includes(search)
            || o.order_code?.toLowerCase().includes(search);
        const matchStatus = !status || o.status === status;
        return matchSearch && matchStatus;
    });

    _ordersPage = 1;
    renderOrdersTable();
    renderOrdersPagination();
}

// ============================================================
// RENDER TABLE
// ============================================================
const _STATUS_MAP = {
    pending: { label: 'Chờ xác nhận', cls: 'order-pending' },
    confirmed: { label: 'Đã xác nhận', cls: 'order-confirmed' },
    processing: { label: 'Đang xử lý', cls: 'order-processing' },
    shipping: { label: 'Đang giao', cls: 'order-shipping' },
    completed: { label: 'Hoàn thành', cls: 'order-completed' },
    cancelled: { label: 'Đã huỷ', cls: 'order-cancelled' },
};

const _PAYMENT_MAP = {
    cod: 'Tiền mặt (COD)',
    bank_transfer: 'Chuyển khoản',
    momo: 'Ví MoMo',
    zalopay: 'ZaloPay',
    vnpay: 'VNPay',
};

function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    const start = (_ordersPage - 1) * _ORDERS_PAGE_SIZE;
    const page = _filteredOrders.slice(start, start + _ORDERS_PAGE_SIZE);

    if (page.length === 0) {
        tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <i class="fa-solid fa-receipt"></i>
          <p>Không có đơn hàng nào</p>
        </div>
      </td></tr>`;
        return;
    }

    tbody.innerHTML = page.map(o => {
        const st = _STATUS_MAP[o.status] || { label: o.status, cls: '' };
        const itemCount = o.order_items?.length || 0;
        const created = o.created_at ? new Date(o.created_at).toLocaleDateString('vi-VN') : '—';
        const payment = _PAYMENT_MAP[o.payment_method] || o.payment_method || '—';

        return `
    <tr>
      <td>
        <div style="font-weight:700;color:var(--primary);font-size:13px">${o.order_code || '#' + o.id}</div>
        <div style="font-size:11px;color:var(--text-dim)">${created}</div>
      </td>
      <td>
        <div style="font-weight:600;font-size:13px">${o.customer_name}</div>
        <div style="font-size:12px;color:var(--text-muted)">${o.customer_phone}</div>
      </td>
      <td style="font-size:12px;color:var(--text-muted)">${itemCount} sản phẩm</td>
      <td>
        <div style="font-weight:800;color:var(--primary);font-size:13px">${formatVND(o.grand_total || o.total_amount)}</div>
        <div style="font-size:11px;color:var(--text-dim)">${payment}</div>
      </td>
      <td><span class="badge-order-status ${st.cls}">${st.label}</span></td>
      <td>
        <select class="order-status-select" onchange="updateOrderStatus(${o.id}, this.value)">
          <option value="pending"    ${o.status === 'pending' ? 'selected' : ''}>Chờ xác nhận</option>
          <option value="confirmed"  ${o.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
          <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Đang xử lý</option>
          <option value="shipping"   ${o.status === 'shipping' ? 'selected' : ''}>Đang giao</option>
          <option value="completed"  ${o.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
          <option value="cancelled"  ${o.status === 'cancelled' ? 'selected' : ''}>Đã huỷ</option>
        </select>
      </td>
      <td>
        <button class="btn-action btn-view" onclick="viewOrderDetail(${o.id})" title="Xem chi tiết">
          <i class="fa-solid fa-eye"></i>
        </button>
      </td>
    </tr>`;
    }).join('');
}

// ============================================================
// PAGINATION
// ============================================================
function renderOrdersPagination() {
    const total = _filteredOrders.length;
    const pages = Math.ceil(total / _ORDERS_PAGE_SIZE);
    const start = Math.min((_ordersPage - 1) * _ORDERS_PAGE_SIZE + 1, total);
    const end = Math.min(_ordersPage * _ORDERS_PAGE_SIZE, total);

    const info = document.getElementById('ordersPaginationInfo');
    const btns = document.getElementById('ordersPaginationBtns');
    if (info) info.textContent = total > 0 ? `Hiển thị ${start}–${end} / ${total} đơn hàng` : 'Không có kết quả';
    if (!btns) return;

    let html = '';
    if (_ordersPage > 1)
        html += `<button class="page-btn" onclick="goOrdersPage(${_ordersPage - 1})"><i class="fa-solid fa-chevron-left"></i></button>`;
    for (let i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || Math.abs(i - _ordersPage) <= 1)
            html += `<button class="page-btn ${i === _ordersPage ? 'active' : ''}" onclick="goOrdersPage(${i})">${i}</button>`;
        else if (Math.abs(i - _ordersPage) === 2)
            html += `<span style="color:var(--text-dim);padding:0 4px;line-height:32px">…</span>`;
    }
    if (_ordersPage < pages)
        html += `<button class="page-btn" onclick="goOrdersPage(${_ordersPage + 1})"><i class="fa-solid fa-chevron-right"></i></button>`;
    btns.innerHTML = html;
}

function goOrdersPage(p) { _ordersPage = p; renderOrdersTable(); renderOrdersPagination(); }

// ============================================================
// UPDATE ORDER STATUS
// ============================================================
async function updateOrderStatus(orderId, newStatus) {
    const { error } = await window.db
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) {
        showToast('Lỗi cập nhật trạng thái: ' + error.message, 'error');
        return;
    }

    // Cập nhật local state — không cần fetch lại toàn bộ
    const order = window._allOrders.find(o => o.id === orderId);
    if (order) order.status = newStatus;

    showToast('Đã cập nhật trạng thái đơn hàng', 'success');
    renderOrdersTable();
}

// ============================================================
// VIEW ORDER DETAIL
// ============================================================
function viewOrderDetail(orderId) {
    const order = window._allOrders.find(o => o.id === orderId);
    if (!order) return;

    let itemsHtml = '';
    (order.order_items || []).forEach(item => {
        itemsHtml += `
      <tr>
        <td style="padding:8px 12px;font-size:13px">${item.product_name}</td>
        <td style="padding:8px 12px;font-size:13px;text-align:center">${item.quantity}</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right">${formatVND(item.unit_price)}</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right;font-weight:700;color:var(--primary)">${formatVND(item.subtotal || item.unit_price * item.quantity)}</td>
      </tr>`;
    });

    const content = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <div>
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;font-weight:700;margin-bottom:4px">Mã đơn hàng</div>
        <div style="font-weight:800;color:var(--primary);font-size:16px">${order.order_code || '#' + order.id}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;font-weight:700;margin-bottom:4px">Trạng thái</div>
        <div style="font-weight:700">${_STATUS_MAP[order.status]?.label || order.status}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;font-weight:700;margin-bottom:4px">Khách hàng</div>
        <div style="font-weight:600">${order.customer_name}</div>
        <div style="font-size:12px;color:var(--text-muted)">${order.customer_phone}</div>
        ${order.customer_email ? `<div style="font-size:12px;color:var(--text-muted)">${order.customer_email}</div>` : ''}
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;font-weight:700;margin-bottom:4px">Thanh toán</div>
        <div style="font-weight:600">${_PAYMENT_MAP[order.payment_method] || '—'}</div>
        <div style="font-size:12px;color:${order.payment_status === 'paid' ? 'var(--primary)' : 'var(--warning)'}">
          ${order.payment_status === 'paid' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
        </div>
      </div>
      ${order.customer_address ? `
      <div style="grid-column:span 2">
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;font-weight:700;margin-bottom:4px">Địa chỉ</div>
        <div style="font-size:13px">${order.customer_address}</div>
      </div>` : ''}
      ${order.notes ? `
      <div style="grid-column:span 2">
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;font-weight:700;margin-bottom:4px">Ghi chú</div>
        <div style="font-size:13px;color:var(--text-muted)">${order.notes}</div>
      </div>` : ''}
    </div>
 
    <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;font-weight:700;margin-bottom:8px">Sản phẩm đặt hàng</div>
    <table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:8px;overflow:hidden">
      <thead>
        <tr style="background:var(--bg)">
          <th style="padding:10px 12px;font-size:11px;text-align:left;color:var(--text-muted);font-weight:700;text-transform:uppercase">Sản phẩm</th>
          <th style="padding:10px 12px;font-size:11px;text-align:center;color:var(--text-muted);font-weight:700;text-transform:uppercase">SL</th>
          <th style="padding:10px 12px;font-size:11px;text-align:right;color:var(--text-muted);font-weight:700;text-transform:uppercase">Đơn giá</th>
          <th style="padding:10px 12px;font-size:11px;text-align:right;color:var(--text-muted);font-weight:700;text-transform:uppercase">Thành tiền</th>
        </tr>
      </thead>
      <tbody>${itemsHtml || '<tr><td colspan="4" style="text-align:center;padding:16px;color:var(--text-dim)">Không có sản phẩm</td></tr>'}</tbody>
    </table>
 
    <div style="margin-top:16px;padding:14px 16px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px">
        <span style="color:var(--text-muted)">Tạm tính</span>
        <span>${formatVND(order.total_amount)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px">
        <span style="color:var(--text-muted)">Thuế (${order.tax_rate || 10}%)</span>
        <span>${formatVND(order.tax_amount || 0)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:800;color:var(--primary);border-top:1px solid var(--border);padding-top:8px">
        <span>Tổng cộng</span>
        <span>${formatVND(order.grand_total || order.total_amount)}</span>
      </div>
    </div>`;

    document.getElementById('orderDetailContent').innerHTML = content;
    new bootstrap.Modal(document.getElementById('orderDetailModal')).show();
}

// ============================================================
// EXPORT GLOBALS
// ============================================================
window.loadOrders = loadOrders;
window.applyOrdersFilters = applyOrdersFilters;
window.goOrdersPage = goOrdersPage;
window.updateOrderStatus = updateOrderStatus;
window.viewOrderDetail = viewOrderDetail;