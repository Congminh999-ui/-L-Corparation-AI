/**
 * L-Corparation - Scooter Data (Supabase)
 * Giữ nguyên biến scooterData để featured-carousel.js không cần sửa
 */

let scooterData = [];

function mapScooterFromSupabase(p) {
    return {
        id: p.product_code,
        name: p.name,
        type: 'scooter',
        img: p.image_url,
        price: new Intl.NumberFormat('vi-VN').format(p.price) + ' VND',
        price_old: p.price_old ? new Intl.NumberFormat('vi-VN').format(p.price_old) + ' VND' : null,
        range: (p.range_km || 0) + ' km',
        speed: (p.top_speed || 0) + ' km/h',
        charge: p.charge_time || '4h',
        waterproof: p.waterproof || 'IP67',
        link: p.detail_link || '#',
        isNew: p.is_new || false,
        specs: []
    };
}

async function loadScooterData() {
    try {
        const rows = await window.ProductsAPI.getScooters();
        if (!rows) return;
        scooterData = rows.map(mapScooterFromSupabase);
        document.dispatchEvent(new CustomEvent('scooterDataReady'));
    } catch (e) {
        console.error('[ScooterData]', e);
    }
}

if (window.ProductsAPI) {
    loadScooterData();
} else {
    window.addEventListener('load', loadScooterData);
}