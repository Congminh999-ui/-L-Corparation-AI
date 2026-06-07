/**
 * L-Corparation — Admin Products
 * File: JavaScript/Pages/admin-products.js
 *
 * Chứa: loadProducts, loadCategories, filter, renderTable, pagination,
 *        modal CRUD (thêm/sửa/xoá), specs editor, exportCSV
 *
 * ⚠️  Dependency (theo thứ tự load):
 *   1. Supabase-client.js  → window.db, ProductsAPI, SpecsAPI, CategoriesAPI
 *   2. admin-ui.js         → showToast, formatVND, closeConfirm
 *   3. admin-stats.js      → updateStats
 */

// ============================================================
// GUARD
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const missing = [
        !window.db && 'window.db (Supabase-client.js)',
        !window.showToast && 'showToast (admin-ui.js)',
        !window.formatVND && 'formatVND (admin-ui.js)',
        !window.updateStats && 'updateStats (admin-stats.js)',
    ].filter(Boolean);
    if (missing.length) {
        console.error('[admin-products] ❌ Thiếu dependency:', missing.join(', '));
    }
});

// ============================================================
// STATE — đặt trên window để admin-stats.js có thể đọc
// ============================================================
window._allProducts = [];
let _filteredProducts = [];
let _categories = [];
let _currentPage = 1;
const _PAGE_SIZE = 15;
let _searchTimer = null;
let _pendingDeleteId = null;
let _productModal = null;

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    _productModal = new bootstrap.Modal(document.getElementById('productModal'));

    // Gán callback cho closeConfirm (được định nghĩa ở admin-ui.js)
    window._onConfirmClose = () => { _pendingDeleteId = null; };

    await loadCategories();
    await loadProducts();
    setupFilters();
});

// ============================================================
// LOAD CATEGORIES
// ============================================================
async function loadCategories() {
    _categories = await CategoriesAPI.getAll();
    const sel = document.getElementById('fCategory');
    sel.innerHTML = '<option value="">— Chọn danh mục —</option>';
    _categories.forEach(c => {
        sel.innerHTML += `<option value="${c.id}" data-slug="${c.slug}">${c.name}</option>`;
    });
}

// ============================================================
// LOAD PRODUCTS
// ============================================================
async function loadProducts() {
    showTableLoading();
    const { data, error } = await window.db
        .from('products')
        .select('*, categories(name, slug, icon)')
        .order('created_at', { ascending: false });

    if (error) { showToast('Lỗi tải dữ liệu: ' + error.message, 'error'); return; }

    window._allProducts = data || [];
    updateStats();
    applyFilters();
}

// ============================================================
// FILTERS
// ============================================================
function setupFilters() {
    document.getElementById('searchInput').addEventListener('input', () => {
        clearTimeout(_searchTimer);
        _searchTimer = setTimeout(() => { _currentPage = 1; applyFilters(); }, 300);
    });
    document.getElementById('categoryFilter').addEventListener('change', () => { _currentPage = 1; applyFilters(); });
    document.getElementById('statusFilter').addEventListener('change', () => { _currentPage = 1; applyFilters(); });
}

function filterByCategory(slug) {
    switchPage('products');
    document.getElementById('categoryFilter').value = slug;
    _currentPage = 1;
    applyFilters();
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
}

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const catSlug = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;

    _filteredProducts = window._allProducts.filter(p => {
        const matchSearch = !search || p.name.toLowerCase().includes(search) || p.product_code.toLowerCase().includes(search);
        const matchCat = !catSlug || p.categories?.slug === catSlug;
        const matchStatus = !status || (status === 'active' ? p.is_active : !p.is_active);
        return matchSearch && matchCat && matchStatus;
    });

    renderTable();
    renderPagination();
}

// ============================================================
// RENDER TABLE
// ============================================================
function renderTable() {
    const tbody = document.getElementById('productsTableBody');
    const start = (_currentPage - 1) * _PAGE_SIZE;
    const page = _filteredProducts.slice(start, start + _PAGE_SIZE);

    if (page.length === 0) {
        tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <i class="fa-solid fa-box-open"></i>
          <p>Không tìm thấy sản phẩm nào</p>
        </div>
      </td></tr>`;
        return;
    }

    tbody.innerHTML = page.map(p => {
        const catSlug = p.categories?.slug || '';
        const catName = p.categories?.name || '—';
        const price = formatVND(p.price);
        const priceOld = p.price_old ? `<div class="price-old">${formatVND(p.price_old)}</div>` : '';
        const updated = p.updated_at ? new Date(p.updated_at).toLocaleDateString('vi-VN') : '—';
        const img = p.image_url
            ? `<img src="${p.image_url}" class="product-thumb" onerror="this.src='https://via.placeholder.com/48x48/1e2433/555?text=?'" />`
            : `<div class="product-thumb d-flex align-items-center justify-content-center" style="color:var(--text-dim)"><i class="fa-solid fa-image"></i></div>`;

        return `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-3">
          ${img}
          <div>
            <div class="product-name">${p.name}</div>
            <div class="product-code">${p.product_code}</div>
          </div>
        </div>
      </td>
      <td><span class="badge-cat ${catSlug}">${catName}</span></td>
      <td>
        <div class="price-cell">${price}</div>
        ${priceOld}
      </td>
      <td style="font-family:'Space Mono',monospace;font-size:13px">${p.stock ?? 0}</td>
      <td><span class="badge-status ${p.is_active ? 'active' : 'inactive'}">${p.is_active ? 'Đang bán' : 'Ẩn'}</span></td>
      <td style="color:var(--text-muted);font-size:12px">${updated}</td>
      <td>
        <div class="d-flex gap-1 justify-content-end">
          <button class="btn-action btn-edit"   onclick="openEditModal(${p.id})" title="Sửa">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn-action btn-delete" onclick="confirmDelete(${p.id}, '${p.name.replace(/'/g, "\\'")}')" title="Xoá">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`;
    }).join('');
}

function showTableLoading() {
    document.getElementById('productsTableBody').innerHTML = `
    <tr class="loading-row"><td colspan="7">
      <div class="spinner"></div>Đang tải dữ liệu từ Supabase...
    </td></tr>`;
}

// ============================================================
// PAGINATION
// ============================================================
function renderPagination() {
    const total = _filteredProducts.length;
    const pages = Math.ceil(total / _PAGE_SIZE);
    const start = Math.min((_currentPage - 1) * _PAGE_SIZE + 1, total);
    const end = Math.min(_currentPage * _PAGE_SIZE, total);

    document.getElementById('paginationInfo').textContent =
        total > 0 ? `Hiển thị ${start}–${end} / ${total} sản phẩm` : 'Không có kết quả';

    const btns = document.getElementById('paginationBtns');
    let html = '';
    if (_currentPage > 1)
        html += `<button class="page-btn" onclick="goPage(${_currentPage - 1})"><i class="fa-solid fa-chevron-left"></i></button>`;
    for (let i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || Math.abs(i - _currentPage) <= 1)
            html += `<button class="page-btn ${i === _currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
        else if (Math.abs(i - _currentPage) === 2)
            html += `<span style="color:var(--text-dim);padding:0 4px;line-height:32px">…</span>`;
    }
    if (_currentPage < pages)
        html += `<button class="page-btn" onclick="goPage(${_currentPage + 1})"><i class="fa-solid fa-chevron-right"></i></button>`;
    btns.innerHTML = html;
}

function goPage(p) { _currentPage = p; renderTable(); renderPagination(); }

// ============================================================
// MODAL — MỞ THÊM MỚI
// ============================================================
function openProductModal() {
    document.getElementById('productModalTitle').textContent = 'Thêm sản phẩm mới';
    document.getElementById('editProductId').value = '';
    resetForm();
    _productModal.show();
}

// ============================================================
// MODAL — MỞ SỬA
// ============================================================
async function openEditModal(id) {
    const p = window._allProducts.find(x => x.id === id);
    if (!p) return;

    document.getElementById('productModalTitle').textContent = `Sửa: ${p.name}`;
    document.getElementById('editProductId').value = id;

    document.getElementById('fCode').value = p.product_code || '';
    document.getElementById('fName').value = p.name || '';
    document.getElementById('fPrice').value = p.price || '';
    document.getElementById('fPriceOld').value = p.price_old || '';
    document.getElementById('fStock').value = p.stock ?? '';
    document.getElementById('fDiscount').value = p.discount || '';
    document.getElementById('fImage').value = p.image_url || '';
    document.getElementById('fDesc').value = p.description || '';
    document.getElementById('fActive').checked = p.is_active;
    document.getElementById('fFeatured').checked = p.is_featured;
    document.getElementById('fNew').checked = p.is_new;
    document.getElementById('fLink').value = p.detail_link || '';
    document.getElementById('fRange').value = p.range_km || '';
    document.getElementById('fSeats').value = p.seats || '';
    document.getElementById('fPower').value = p.power_kw || '';
    document.getElementById('fAccel').value = p.acceleration || '';
    document.getElementById('fSpeed').value = p.top_speed || '';
    document.getElementById('fCharge').value = p.charge_time || '';
    document.getElementById('fWaterproof').value = p.waterproof || '';
    document.getElementById('fCompatible').value = p.compatible_vehicle || '';
    document.getElementById('fCompatibleName').value = p.compatible_vehicle_name || '';

    const catSel = document.getElementById('fCategory');
    const opt = [...catSel.options].find(o => {
        const cat = _categories.find(c => c.id === p.category_id);
        return cat && o.dataset.slug === cat.slug;
    });
    if (opt) { catSel.value = opt.value; handleCategoryChange(); }

    previewImage();

    if (p.vehicle_type) {
        const specs = await SpecsAPI.getByProduct(id);
        renderSpecsEditor(specs);
    }

    _productModal.show();
}

// ============================================================
// MODAL — RESET FORM
// ============================================================
function resetForm() {
    ['fCode', 'fName', 'fPrice', 'fPriceOld', 'fStock', 'fDiscount', 'fImage', 'fDesc',
        'fLink', 'fRange', 'fSeats', 'fPower', 'fAccel', 'fSpeed', 'fCharge', 'fWaterproof',
        'fCompatible', 'fCompatibleName'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    document.getElementById('fActive').checked = true;
    document.getElementById('fFeatured').checked = false;
    document.getElementById('fNew').checked = false;
    document.getElementById('fCategory').value = '';
    document.getElementById('specsContainer').innerHTML = '';
    document.getElementById('imgPreviewWrap').innerHTML = `
    <div class="img-placeholder">
      <i class="fa-solid fa-image"></i><span>Nhập URL ảnh để xem trước</span>
    </div>`;
    document.getElementById('vehicleFields').style.display = 'none';
    document.getElementById('accessoryFields').style.display = 'none';
    document.getElementById('specsEditor').style.display = 'none';
}

// ============================================================
// CATEGORY CHANGE
// ============================================================
function handleCategoryChange() {
    const sel = document.getElementById('fCategory');
    const slug = sel.options[sel.selectedIndex]?.dataset.slug || '';
    document.getElementById('vehicleFields').style.display = ['car', 'scooter'].includes(slug) ? 'block' : 'none';
    document.getElementById('accessoryFields').style.display = ['car_acc', 'scooter_acc', 'lifestyle'].includes(slug) ? 'block' : 'none';
    document.getElementById('specsEditor').style.display = ['car', 'scooter'].includes(slug) ? 'block' : 'none';
    document.getElementById('carOnlyFields').style.display = slug === 'car' ? 'block' : 'none';
    document.getElementById('scooterOnlyFields').style.display = slug === 'scooter' ? 'block' : 'none';
}

// ============================================================
// PREVIEW IMAGE
// ============================================================
function previewImage() {
    const url = document.getElementById('fImage').value.trim();
    const wrap = document.getElementById('imgPreviewWrap');
    if (url) {
        wrap.innerHTML = `<img src="${url}" onerror="this.parentElement.innerHTML='<div class=\\'img-placeholder\\'><i class=\\'fa-solid fa-image-slash\\'></i><span>URL không hợp lệ</span></div>'" />`;
    } else {
        wrap.innerHTML = `<div class="img-placeholder"><i class="fa-solid fa-image"></i><span>Nhập URL ảnh để xem trước</span></div>`;
    }
}

// ============================================================
// SPECS EDITOR
// ============================================================
function renderSpecsEditor(specs = []) {
    const container = document.getElementById('specsContainer');
    container.innerHTML = '';
    if (specs.length === 0) {
        addSpecRow();
    } else {
        specs.sort((a, b) => a.sort_order - b.sort_order).forEach(s => addSpecRow(s.label, s.value));
    }
}

function addSpecRow(label = '', value = '') {
    const container = document.getElementById('specsContainer');
    const div = document.createElement('div');
    div.className = 'spec-row';
    div.innerHTML = `
    <input type="text" class="form-control spec-label" placeholder="Tên thông số" value="${label}" />
    <input type="text" class="form-control spec-value" placeholder="Giá trị"      value="${value}" />
    <button type="button" class="btn-remove-spec" onclick="this.parentElement.remove()">
      <i class="fa-solid fa-xmark"></i>
    </button>`;
    container.appendChild(div);
}

function getSpecsFromEditor() {
    const rows = document.querySelectorAll('.spec-row');
    return [...rows].map((row, i) => ({
        label: row.querySelector('.spec-label').value.trim(),
        value: row.querySelector('.spec-value').value.trim(),
        sort_order: i + 1,
    })).filter(s => s.label && s.value);
}

// ============================================================
// SAVE PRODUCT
// ============================================================
async function saveProduct() {
    const id = document.getElementById('editProductId').value;
    const catSel = document.getElementById('fCategory');
    const catSlug = catSel.options[catSel.selectedIndex]?.dataset.slug || '';

    const payload = {
        product_code: document.getElementById('fCode').value.trim(),
        category_id: parseInt(catSel.value) || null,
        name: document.getElementById('fName').value.trim(),
        price: parseInt(document.getElementById('fPrice').value) || 0,
        price_old: parseInt(document.getElementById('fPriceOld').value) || null,
        discount: parseInt(document.getElementById('fDiscount').value) || 0,
        stock: parseInt(document.getElementById('fStock').value) || 0,
        image_url: document.getElementById('fImage').value.trim() || null,
        description: document.getElementById('fDesc').value.trim() || null,
        is_active: document.getElementById('fActive').checked,
        is_featured: document.getElementById('fFeatured').checked,
        is_new: document.getElementById('fNew').checked,
    };

    if (['car', 'scooter'].includes(catSlug)) {
        payload.vehicle_type = catSlug;
        payload.range_km = parseInt(document.getElementById('fRange').value) || null;
        payload.seats = parseInt(document.getElementById('fSeats').value) || null;
        payload.detail_link = document.getElementById('fLink').value.trim() || null;
        if (catSlug === 'car') {
            payload.power_kw = parseFloat(document.getElementById('fPower').value) || null;
            payload.acceleration = document.getElementById('fAccel').value.trim() || null;
        } else {
            payload.top_speed = parseInt(document.getElementById('fSpeed').value) || null;
            payload.charge_time = document.getElementById('fCharge').value.trim() || null;
            payload.waterproof = document.getElementById('fWaterproof').value.trim() || null;
        }
    }

    if (['car_acc', 'scooter_acc', 'lifestyle'].includes(catSlug)) {
        payload.compatible_vehicle = document.getElementById('fCompatible').value.trim() || 'all';
        payload.compatible_vehicle_name = document.getElementById('fCompatibleName').value.trim() || null;
    }

    if (!payload.product_code || !payload.name || !payload.category_id) {
        showToast('Vui lòng điền đầy đủ mã, tên và danh mục!', 'error'); return;
    }

    const result = id
        ? await ProductsAPI.update(parseInt(id), payload)
        : await ProductsAPI.create(payload);

    if (!result) { showToast('Lỗi lưu sản phẩm. Kiểm tra console.', 'error'); return; }

    if (['car', 'scooter'].includes(catSlug)) {
        const specs = getSpecsFromEditor();
        if (specs.length > 0) await SpecsAPI.upsert(result.id, specs);
    }

    _productModal.hide();
    showToast(id ? `Đã cập nhật "${result.name}"` : `Đã thêm "${result.name}"`, 'success');
    await loadProducts();
}

// ============================================================
// DELETE
// ============================================================
function confirmDelete(id, name) {
    _pendingDeleteId = id;
    document.getElementById('confirmMsg').textContent = `Sản phẩm "${name}" sẽ bị ẩn khỏi website.`;
    document.getElementById('confirmDeleteBtn').onclick = async () => {
        const ok = await ProductsAPI.delete(_pendingDeleteId);
        closeConfirm();
        if (ok) { showToast('Đã xoá sản phẩm', 'success'); await loadProducts(); }
        else showToast('Lỗi xoá sản phẩm', 'error');
    };
    document.getElementById('confirmOverlay').classList.add('active');
}

// ============================================================
// EXPORT CSV
// ============================================================
function exportCSV() {
    const headers = ['ID', 'Mã', 'Tên', 'Danh mục', 'Giá', 'Giá gốc', 'Tồn kho', 'Trạng thái', 'Ngày tạo'];
    const rows = _filteredProducts.map(p => [
        p.id, p.product_code, `"${p.name}"`, p.categories?.name || '',
        p.price, p.price_old || '', p.stock, p.is_active ? 'active' : 'inactive',
        new Date(p.created_at).toLocaleDateString('vi-VN'),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `lcorp-products-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất CSV thành công', 'success');
}

// ============================================================
// EXPORT GLOBALS
// ============================================================
window.loadProducts = loadProducts;
window.filterByCategory = filterByCategory;
window.applyFilters = applyFilters;
window.goPage = goPage;
window.openProductModal = openProductModal;
window.openEditModal = openEditModal;
window.handleCategoryChange = handleCategoryChange;
window.previewImage = previewImage;
window.addSpecRow = addSpecRow;
window.saveProduct = saveProduct;
window.confirmDelete = confirmDelete;
window.exportCSV = exportCSV;