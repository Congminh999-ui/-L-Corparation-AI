/**
 * L-Corporation - Main JavaScript Entry Point
 */

// ─── Loading Animation (CSS nên đặt trong file .css, nhưng giữ ở đây nếu không có file CSS riêng) ───
const style = document.createElement('style');
style.textContent = `
    body { opacity: 0; transition: opacity 0.3s ease; }
    body.loaded { opacity: 1; }
`;
document.head.appendChild(style);

window.addEventListener('load', function () {
    document.body.classList.add('loaded');
});

// ─── Scrollbar Width CSS Variable ───
(function () {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.cssText = 'width:99px;height:99px;overflow:scroll;position:absolute;top:-9999px';
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    document.documentElement.style.setProperty('--scrollbar-width', scrollbarWidth + 'px');
})();

// ─── DOMContentLoaded (gộp tất cả vào 1 listener) ───
document.addEventListener('DOMContentLoaded', function () {

    // 1. Render content
    if (typeof renderMegaMenuContent === 'function') renderMegaMenuContent();
    if (typeof initVehicleSpecCarousel === 'function') initVehicleSpecCarousel();

    // 2. Initialize functionalities
    if (typeof initNavbarScroll === 'function') initNavbarScroll();
    if (typeof initSmoothScroll === 'function') initSmoothScroll();
    if (typeof initCarousels === 'function') initCarousels();

    // 3. Accessories — CHỈ gọi nếu data đã có,
    //    còn không thì để event 'accessoriesDataReady' trong accessories-render.js tự xử lý
    if (typeof initAccessories === 'function') initAccessories();

    // 4. About Us Read More/Less toggle
    initAboutReadMore();

    // 5. Avatar fallback
    initAvatarFallback();
});

// ─── About Us Read More/Less ───
function initAboutReadMore() {
    const btn = document.getElementById('aboutReadMoreBtn');
    const content = document.getElementById('aboutMoreContent');
    if (!btn || !content) return;

    content.addEventListener('shown.bs.collapse', function () {
        const span = btn.querySelector('span');
        const icon = btn.querySelector('i');
        if (span) { span.setAttribute('data-i18n', 'about_read_less'); span.textContent = t('about_read_less'); }
        if (icon) { icon.classList.replace('fa-chevron-down', 'fa-chevron-up'); }
    });

    content.addEventListener('hidden.bs.collapse', function () {
        const span = btn.querySelector('span');
        const icon = btn.querySelector('i');
        if (span) { span.setAttribute('data-i18n', 'about_read_more'); span.textContent = t('about_read_more'); }
        if (icon) { icon.classList.replace('fa-chevron-up', 'fa-chevron-down'); }
    });
}

// ─── Avatar Fallback (fix lỗi 404 default-avatar.png) ───
function initAvatarFallback() {
    const avatar = document.getElementById('profileAvatar');
    if (!avatar) return;

    avatar.onerror = function () {
        this.onerror = null; // tránh loop vô hạn
        this.src = 'https://ui-avatars.com/api/?name=User&background=cccccc&color=ffffff&size=128';
    };
}

// ─── Open Vehicle Specs Modal ───
// Ưu tiên load specs từ Supabase nếu có, fallback về data local
async function openSpecsModal(vehicleId) {
    let vehicle = null;
    if (typeof carData !== 'undefined') vehicle = carData.find(v => v.id === vehicleId);
    if (!vehicle && typeof scooterData !== 'undefined') vehicle = scooterData.find(v => v.id === vehicleId);
    if (!vehicle) { console.error(`Vehicle ${vehicleId} not found`); return; }

    document.getElementById('vehicleSpecModalLabel').textContent = t('modal_title');

    const contentTarget = document.getElementById('specsModalContent');
    contentTarget.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary"></div></div>';

    const modal = new bootstrap.Modal(document.getElementById('vehicleSpecModal'));
    modal.show();

    // Thử load specs từ Supabase trước
    let specs = [];
    try {
        if (window.ProductsAPI) {
            const product = await window.ProductsAPI.getByCode(vehicleId);
            if (product?.vehicle_specs?.length > 0) {
                specs = product.vehicle_specs
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map(s => ({ label: s.label, value: s.value }));
            }
        }
    } catch (e) {
        console.warn('Supabase specs load failed, falling back to local data.', e);
    }

    // Fallback về specs local nếu Supabase không có
    if (specs.length === 0 && vehicle.specs?.length > 0) {
        specs = vehicle.specs;
    }

    let specsHTML = '';
    if (specs.length > 0) {
        specsHTML = `
            <div class="col-lg-5 order-2 order-lg-1">
                <div class="table-responsive" style="max-height:70vh;overflow-y:auto;">
                    <table class="table align-middle mb-0"><tbody>
                        ${specs.map(item => `
                        <tr>
                            <td class="fw-bold" style="width:40%">${t(item.label) || item.label}</td>
                            <td class="text-dark">${item.value}</td>
                        </tr>`).join('')}
                    </tbody></table>
                </div>
            </div>
            <div class="col-lg-7 order-1 order-lg-2 d-flex align-items-center justify-content-center rounded-4 mb-4 mb-lg-0" style="background-color:#f5f6f7;">
                <img src="${vehicle.img}" alt="${vehicle.name}" class="img-fluid" style="max-height:500px;width:100%;object-fit:contain;">
            </div>`;
    } else {
        specsHTML = `<div class="col-12"><p class="text-center text-muted">${t('modal_updating')}</p></div>`;
    }

    contentTarget.innerHTML = specsHTML;

    const preOrderBtn = document.getElementById('modalPreOrderBtn');
    if (preOrderBtn) preOrderBtn.setAttribute('data-vehicle-id', vehicleId);
}