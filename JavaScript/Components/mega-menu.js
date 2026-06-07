/**
 * L-Corparation - Mega Menu Functions
 * Version: Supabase async
 */

function renderMegaMenuContent() {
    const carsTrack = document.getElementById('cars-track');
    const scootersTrack = document.getElementById('scooters-track');

    if (!carsTrack || !scootersTrack) return;

    carsTrack.innerHTML = '';
    scootersTrack.innerHTML = '';

    const createItemHTML = (vehicle) => {
        const targetId = vehicle.type === 'car' ? '#featured-cars' : '#featured-scooters';
        return `
        <div class="carousel-card">
            <a href="${targetId}" class="mega-menu-item" onclick="event.preventDefault(); navigateToVehicle('${vehicle.type}', '${vehicle.id}')">
                <div class="mega-menu-img-wrapper">
                    <img src="${vehicle.img}" alt="${vehicle.name}" onerror="this.src='https://placehold.co/200x100?text=No+Image'">
                </div>
                <span class="mega-menu-item-name">${vehicle.name}</span>
                <span class="mega-menu-details-link">${t('btn_detail')}</span>
            </a>
        </div>
    `};

    // Chỉ render nếu data đã có
    if (typeof carData !== 'undefined' && carData.length > 0) {
        carData.forEach(vehicle => { carsTrack.innerHTML += createItemHTML(vehicle); });
    }
    if (typeof scooterData !== 'undefined' && scooterData.length > 0) {
        scooterData.forEach(vehicle => { scootersTrack.innerHTML += createItemHTML(vehicle); });
    }

    initCarousels();
}

// Lắng nghe event từ Supabase → re-render mega menu
document.addEventListener('carDataReady', renderMegaMenuContent);
document.addEventListener('scooterDataReady', renderMegaMenuContent);

function initCarousels() {
    const carousels = document.querySelectorAll('.carousel-wrapper');

    carousels.forEach(wrapper => {
        const track = wrapper.querySelector('.carousel-track');
        const nextBtn = wrapper.querySelector('.carousel-btn.next');
        const prevBtn = wrapper.querySelector('.carousel-btn.prev');

        if (!track || !nextBtn || !prevBtn) return;

        let currentIndex = 0;

        const updateButtons = () => {
            const items = track.children;
            if (items.length === 0) return;
            const itemWidth = items[0].getBoundingClientRect().width;
            const trackWidth = track.getBoundingClientRect().width;
            const totalWidth = items.length * itemWidth;
            const maxIndex = Math.max(0, Math.ceil((totalWidth - trackWidth) / itemWidth));
            prevBtn.disabled = currentIndex <= 0;
            nextBtn.disabled = currentIndex >= maxIndex;
        };

        const moveCarousel = (direction) => {
            const items = track.children;
            if (items.length === 0) return;
            const itemWidth = items[0].getBoundingClientRect().width;
            if (direction === 'next') currentIndex++;
            else currentIndex--;
            track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
            updateButtons();
        };

        nextBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); moveCarousel('next'); });
        prevBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); moveCarousel('prev'); });
        window.addEventListener('resize', () => {
            track.style.transform = 'translateX(0)';
            currentIndex = 0;
            updateButtons();
        });
    });
}