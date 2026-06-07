/**
 * L-Corparation - Car Data (Supabase)
 * Giữ nguyên biến carData để featured-carousel.js không cần sửa
 */

let carData = [];

function mapCarFromSupabase(p) {
    return {
        id: p.product_code,
        name: p.name,
        type: 'car',
        img: p.image_url,
        price: new Intl.NumberFormat('vi-VN').format(p.price) + ' VNĐ',
        price_old: p.price_old ? new Intl.NumberFormat('vi-VN').format(p.price_old) + ' VND' : null,
        range: (p.range_km || 0) + ' km',
        seats: p.seats || 5,
        power: (p.power_kw || 0) + ' kW',
        acceleration: p.acceleration || 'N/A',
        link: p.detail_link || '#',
        isNew: p.is_new || false,
        specs: [] // specs load riêng khi mở modal qua SpecsAPI
    };
}

async function loadCarData() {
    try {
        const rows = await window.ProductsAPI.getCars();
        if (!rows) return;
        carData = rows.map(mapCarFromSupabase);
        document.dispatchEvent(new CustomEvent('carDataReady'));
    } catch (e) {
        console.error('[CarData]', e);
    }
}

// Chờ Supabase client sẵn rồi load
if (window.ProductsAPI) {
    loadCarData();
} else {
    window.addEventListener('load', loadCarData);
}