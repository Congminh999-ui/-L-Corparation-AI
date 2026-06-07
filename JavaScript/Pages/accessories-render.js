/**
 * L-Corparation — Accessories Render (Supabase)
 * Fetch dữ liệu phụ kiện từ Supabase và render ra giao diện.
 */

let accessoriesData = [];

const accessoriesCategories = [
    { id: 'all', name: 'Tất cả sản phẩm', icon: 'fa-box', labelKey: 'accessories_cat_all' },
    { id: 'new', name: 'Sản phẩm mới', icon: 'fa-star', labelKey: 'accessories_cat_new' },
    { id: 'lifestyle', name: 'Phong cách sống', icon: 'fa-tshirt', labelKey: 'accessories_cat_lifestyle' },
    { id: 'car_acc', name: 'Phụ kiện Ô tô điện', icon: 'fa-car', labelKey: 'accessories_cat_car' },
    { id: 'scooter_acc', name: 'Phụ kiện Xe máy điện', icon: 'fa-motorcycle', labelKey: 'accessories_cat_scooter' },
];

const SLUG_TO_CATEGORY = {
    car_acc: 'car_acc',
    scooter_acc: 'scooter_acc',
    lifestyle: 'lifestyle',
};

const SLUG_TO_VEHICLE_TYPE = {
    car_acc: 'car',
    scooter_acc: 'scooter',
    lifestyle: 'all',
};

/** Chuyển đổi record Supabase → format accessoriesData */
function mapAccessoryFromSupabase(p) {
    const catSlug = p.categories?.slug || '';
    return {
        id: p.product_code,
        name: p.name,
        category: SLUG_TO_CATEGORY[catSlug] || catSlug,
        categoryName: p.categories?.name || '',
        img: p.image_url || '',
        price: p.price || 0,
        price_old: p.price_old || 0,
        discount: p.discount || 0,
        isNew: p.is_new || false,
        vehicle: p.compatible_vehicle || 'all',
        vehicleType: SLUG_TO_VEHICLE_TYPE[catSlug] || 'all',
        vehicleName: p.compatible_vehicle_name || '',
    };
}

/** Hiển thị thông báo lỗi trong section phụ kiện */
function showAccessoriesError(message) {
    const grid = document.getElementById('accessories-grid');
    const empty = document.getElementById('accessories-empty');
    if (grid) grid.style.display = 'none';
    if (empty) {
        empty.style.display = 'block';
        const title = empty.querySelector('h4');
        const desc = empty.querySelector('p');
        if (title) title.textContent = 'Không thể tải dữ liệu';
        if (desc) desc.textContent = message || 'Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.';
    }
    const loading = document.getElementById('accessories-loading');
    if (loading) loading.style.display = 'none';
}

/** Lấy toàn bộ phụ kiện từ Supabase */
async function loadAccessoriesData() {
    if (typeof window.ProductsAPI === 'undefined') {
        console.warn('[AccessoriesData] ProductsAPI chưa sẵn sàng.');
        showAccessoriesError('Hệ thống đang khởi động, vui lòng tải lại trang.');
        return;
    }

    try {
        const ids = await window.ProductsAPI._getAccessoryCategoryIds();

        if (!ids || ids.length === 0) {
            console.warn('[AccessoriesData] Không tìm thấy danh mục phụ kiện.');
            showAccessoriesError('Chưa có danh mục phụ kiện nào trong hệ thống.');
            return;
        }

        const { data, error } = await window.db
            .from('products')
            .select('*, categories(name, slug)')
            .eq('is_active', true)
            .in('category_id', ids)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[AccessoriesData] Lỗi Supabase:', error.message);
            showAccessoriesError('Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.');
            return;
        }

        if (!data || data.length === 0) {
            console.info('[AccessoriesData] Không có sản phẩm phụ kiện nào.');
            showAccessoriesError('Hiện chưa có sản phẩm phụ kiện nào.');
            return;
        }

        accessoriesData = data.map(mapAccessoryFromSupabase);
        window.accessoriesData = accessoriesData;
        document.dispatchEvent(new CustomEvent('accessoriesDataReady'));

    } catch (e) {
        console.error('[AccessoriesData] Lỗi không xác định:', e.message);
        showAccessoriesError('Đã xảy ra lỗi không mong muốn. Vui lòng tải lại trang.');
    }
}

/** Định dạng giá tiền VND */
function formatPrice(price) {
    if (!price && price !== 0) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

if (typeof window.ProductsAPI !== 'undefined') {
    loadAccessoriesData();
} else {
    document.addEventListener('supabaseReady', loadAccessoriesData, { once: true });
}

// ============================================================
// RENDER — hiển thị sản phẩm ra giao diện
// ============================================================

const ITEMS_PER_PAGE = 8;
let currentPage = 1;
let activeCategory = 'all';
let searchKeyword = '';

function getFilteredItems() {
    return accessoriesData.filter(item => {
        const matchCat = activeCategory === 'all'
            ? true
            : activeCategory === 'new'
                ? item.isNew
                : item.category === activeCategory;
        const matchSearch = !searchKeyword ||
            item.name.toLowerCase().includes(searchKeyword.toLowerCase());
        return matchCat && matchSearch;
    });
}

function renderCategories() {
    const list = document.getElementById('accessories-categories');
    if (!list) return;

    list.innerHTML = accessoriesCategories.map(cat => `
        <li class="accessories-category-item ${cat.id === 'all' ? 'active' : ''}"
            data-category="${cat.id}">
            <i class="fas ${cat.icon}"></i>${cat.name}
        </li>
    `).join('');

    list.querySelectorAll('.accessories-category-item').forEach(item => {
        item.addEventListener('click', () => {
            list.querySelectorAll('.accessories-category-item')
                .forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            activeCategory = item.dataset.category;
            currentPage = 1;
            renderProducts();
        });
    });
}

function renderProducts() {
    const grid = document.getElementById('accessories-grid');
    const countEl = document.getElementById('accessories-count');
    const emptyEl = document.getElementById('accessories-empty');
    const loadMoreBtn = document.getElementById('accessories-load-more-btn');
    if (!grid) return;

    const filtered = getFilteredItems();
    const paged = filtered.slice(0, currentPage * ITEMS_PER_PAGE);

    if (countEl) countEl.textContent = filtered.length;

    if (filtered.length === 0) {
        grid.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }

    grid.style.display = '';
    if (emptyEl) emptyEl.style.display = 'none';
    if (loadMoreBtn)
        loadMoreBtn.style.display = paged.length < filtered.length ? 'block' : 'none';

    grid.innerHTML = paged.map(item => `
    <div class="accessories-item" data-id="${item.id}">
        <div class="accessories-item-img-wrapper">
          <img class="accessories-item-img"
     src="${item.img}" alt="${item.name}"
     onerror="this.onerror=null;this.src='https://printpro.com.vn/wp-content/uploads/2022/02/woocommerce-placeholder.png'">
            ${item.isNew ? '<span class="accessories-item-new">Mới</span>' : ''}
            ${item.discount ? `<span class="accessories-item-discount">-${item.discount}%</span>` : ''}
        </div>
            <div class="accessories-item-info">
                <p class="accessories-item-vehicle">${item.categoryName}</p>
                <h4 class="accessories-item-name">${item.name}</h4>
                <div class="accessories-item-price">
                    <span class="accessories-item-current-price">${formatPrice(item.price)}</span>
                    ${item.price_old ? `<span class="accessories-item-old-price">${formatPrice(item.price_old)}</span>` : ''}
                </div>
                <div class="accessories-item-actions">
                    <button class="accessories-item-btn accessories-item-btn-primary"
                       onclick="addToCart('${item.id}')"
                        <i class="fas fa-cart-plus me-1"></i> Thêm vào giỏ
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function initAccessoriesUI() {
    renderCategories();
    renderProducts();

    // Load more
    document.getElementById('accessories-load-more-btn')
        ?.addEventListener('click', () => {
            currentPage++;
            renderProducts();
        });

    // Search
    const searchInput = document.getElementById('accessories-search-input');
    const searchBtn = document.getElementById('accessories-search-btn');
    const doSearch = () => {
        searchKeyword = searchInput?.value.trim() || '';
        currentPage = 1;
        renderProducts();
    };
    searchBtn?.addEventListener('click', doSearch);
    searchInput?.addEventListener('keydown', e => e.key === 'Enter' && doSearch());
}

// Lắng nghe event từ loadAccessoriesData()
document.addEventListener('accessoriesDataReady', initAccessoriesUI, { once: true });