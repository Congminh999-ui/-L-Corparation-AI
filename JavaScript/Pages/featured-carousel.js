/**
 * L-Corparation - Featured Vehicle Carousel Functions
 * Version: Supabase async - chờ event carDataReady / scooterDataReady
 */

// Track init state để tránh double-init
let _carCarouselInited = false;
let _scooterCarouselInited = false;

function initVehicleSpecCarousel() {
    // Hàm này được section-loader.js gọi khi section visible
    // Data có thể chưa về → chỉ init nếu đã có data
    if (carData.length > 0 && !_carCarouselInited) {
        _carCarouselInited = true;
        setupCarousel(carData, 'car-main-img', 'car-info-box', 'car-prev-btn', 'car-next-btn', 'car-bullets');
    }
    if (scooterData.length > 0 && !_scooterCarouselInited) {
        _scooterCarouselInited = true;
        setupCarousel(scooterData, 'scooter-main-img', 'scooter-info-box', 'scooter-prev-btn', 'scooter-next-btn', 'scooter-bullets');
    }
}

// Khi Supabase trả data về → init carousel (dù section-loader đã gọi sớm hơn)
document.addEventListener('carDataReady', () => {
    if (_carCarouselInited) return;
    _carCarouselInited = true;
    setupCarousel(carData, 'car-main-img', 'car-info-box', 'car-prev-btn', 'car-next-btn', 'car-bullets');
    // Cập nhật mega-menu cars
    if (typeof renderMegaMenuContent === 'function') renderMegaMenuContent();
});

document.addEventListener('scooterDataReady', () => {
    if (_scooterCarouselInited) return;
    _scooterCarouselInited = true;
    setupCarousel(scooterData, 'scooter-main-img', 'scooter-info-box', 'scooter-prev-btn', 'scooter-next-btn', 'scooter-bullets');
    if (typeof renderMegaMenuContent === 'function') renderMegaMenuContent();
});

function setupCarousel(data, imgId, infoId, prevBtnId, nextBtnId, bulletsId) {
    const imgElement = document.getElementById(imgId);
    const infoBox = document.getElementById(infoId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    const bulletsContainer = document.getElementById(bulletsId);

    if (!imgElement || !infoBox || !prevBtn || !nextBtn || !bulletsContainer || data.length === 0) return;

    let currentIndex = 0;

    // Generate bullet buttons
    bulletsContainer.innerHTML = '';
    data.forEach((_, index) => {
        const bullet = document.createElement('button');
        bullet.className = 'bullet-btn' + (index === 0 ? ' active' : '');
        bullet.setAttribute('aria-label', `Go to slide ${index + 1}`);
        bullet.addEventListener('click', () => {
            currentIndex = index;
            updateDisplay(currentIndex);
            updateBullets();
        });
        bulletsContainer.appendChild(bullet);
    });

    function updateBullets() {
        const bullets = bulletsContainer.querySelectorAll('.bullet-btn');
        bullets.forEach((bullet, index) => {
            bullet.classList.toggle('active', index === currentIndex);
        });
    }

    const firstVehicle = data[0];
    const typeLabel = firstVehicle.type === 'car' ? t('badge_car') : t('badge_scooter');
    let specsHTML = '';

    const generateSpecItem = (specKey, dataKey, staticValue = null) => {
        const valueHTML = staticValue
            ? `<span class="spec-value-minimal mt-1">${t(staticValue)}</span>`
            : `<span class="spec-value-minimal mt-1" data-spec="${dataKey}"></span>`;
        return `
            <div class="col-6 col-md spec-block-minimal mb-4">
                <span class="spec-label-minimal">${t(specKey)}</span>
                ${valueHTML}
            </div>
        `;
    };

    if (firstVehicle.type === 'car') {
        specsHTML = `
            ${generateSpecItem('spec_range', 'range')}
            ${generateSpecItem('spec_seats', 'seats')}
            ${generateSpecItem('spec_power', 'power')}
        `;
    } else {
        specsHTML = `
            ${generateSpecItem('spec_range', 'range')}
            ${generateSpecItem('spec_trunk', null, 'spec_trunk_val')}
            ${generateSpecItem('spec_max_speed', 'speed')}
        `;
    }

    infoBox.innerHTML = `
        <hr class="vehicle-divider mb-2 mt-0">
        <div class="row text-center mb-2 justify-content-center w-100 mx-auto">
            <div class="col-6 col-md spec-block-minimal mb-4">
                <span class="spec-label-minimal">${t('Vehicle Type')}</span>
                <span class="spec-value-minimal mt-1" id="${infoId}-name"></span>
            </div>
            ${specsHTML}
            <div class="col-6 col-md spec-block-minimal mb-0 d-flex flex-column align-items-center">
                <span class="spec-label-minimal">${t('spec_price_from')}</span>
                <div class="d-flex flex-column align-items-center" style="min-height: 60px;">
                    <span class="spec-value-minimal lh-1 mt-1" id="${infoId}-price"></span>
                    <div class="text-decoration-line-through text-muted fw-normal" style="font-size: 0.8rem; display: none; line-height: 1.2;" id="${infoId}-price-old"></div>
                    <div class="badge bg-danger rounded-pill mt-1" id="${infoId}-discount" style="font-size: 0.7rem; font-weight: 700; line-height: 1.2; padding: 0.35em 0.65em;"></div>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-center gap-3 mb-4 mt-0">
            <a href="#" class="btn btn-primary rounded-1 px-5 py-2 fw-bold tesla-btn-primary" id="${infoId}-order-btn">${t('btn_order')}</a>
            <a href="#" class="btn btn-outline-primary rounded-1 px-5 py-2 fw-bold tesla-btn-outline" id="${infoId}-link">${t('btn_detail')}</a>
        </div>
        <span id="${infoId}-new-badge" style="display: none;"></span>
    `;

    const nameEl      = document.getElementById(`${infoId}-name`);
    const newBadgeEl  = document.getElementById(`${infoId}-new-badge`);
    const priceEl     = document.getElementById(`${infoId}-price`);
    const priceOldEl  = document.getElementById(`${infoId}-price-old`);
    const discountEl  = document.getElementById(`${infoId}-discount`);
    const linkEl      = document.getElementById(`${infoId}-link`);
    const orderEl     = document.getElementById(`${infoId}-order-btn`);
    const specValueEls = infoBox.querySelectorAll('.spec-value-minimal[data-spec]');

    // Di chuyển bullets vào infoBox trước nút bấm
    const buttonsWrapper = infoBox.querySelector('.d-flex.justify-content-center.gap-3');
    if (bulletsContainer && buttonsWrapper) {
        bulletsContainer.classList.replace('mt-4', 'mt-1');
        bulletsContainer.classList.replace('pb-2', 'mb-3');
        infoBox.insertBefore(bulletsContainer, buttonsWrapper);
    }

    function updateDisplay(index) {
        const vehicle = data[index];

        imgElement.src = vehicle.img;
        imgElement.classList.remove('slide-in-img');
        void imgElement.offsetWidth;
        imgElement.classList.add('slide-in-img');

        if (vehicle.isNew) {
            newBadgeEl.style.display = 'inline-block';
            newBadgeEl.classList.remove('fade-in');
            void newBadgeEl.offsetWidth;
            newBadgeEl.classList.add('fade-in');
        } else {
            newBadgeEl.style.display = 'none';
        }

        nameEl.textContent = vehicle.name;
        nameEl.classList.remove('slide-in-name');
        void nameEl.offsetWidth;
        nameEl.classList.add('slide-in-name');

        priceEl.textContent = vehicle.price;
        priceEl.classList.remove('fade-in-price');
        void priceEl.offsetWidth;
        priceEl.classList.add('fade-in-price');

        if (vehicle.price_old) {
            priceOldEl.textContent = vehicle.price_old;
            priceOldEl.style.display = 'block';
        } else {
            priceOldEl.style.display = 'none';
        }

        const discountText = vehicle.type === 'car' ? t('spec_discount_10') : t('spec_discount_8');
        discountEl.textContent = discountText;

        linkEl.href = '#';
        linkEl.onclick = (e) => {
            e.preventDefault();
            openSpecsModal(vehicle.id);
        };

        if (orderEl) {
            orderEl.href = '#';
            orderEl.onclick = (e) => {
                e.preventDefault();
                if (typeof window.openOrderWithVehicle === 'function') {
                    window.openOrderWithVehicle(vehicle.id);
                }
            };
        }

        specValueEls.forEach(el => {
            const key = el.getAttribute('data-spec');
            let value = vehicle[key];
            if (!value) {
                if (key === 'power' || key === 'acceleration') value = 'N/A';
                if (key === 'charge') value = '4h';
                if (key === 'waterproof') value = 'IP67';
            }
            if (key === 'seats' && value) value = `${value} Seats`;
            el.textContent = value;
        });
    }

    // Register controller cho Mega Menu click
    window.carouselControllers = window.carouselControllers || {};
    window.carouselControllers[data[0].type] = {
        goTo: (id) => {
            const idx = data.findIndex(v => v.id === id);
            if (idx !== -1) {
                currentIndex = idx;
                updateDisplay(currentIndex);
                updateBullets();
            }
        }
    };

    updateDisplay(currentIndex);
    updateBullets();

    // Clone để xóa event cũ
    const freshPrev = prevBtn.cloneNode(true);
    const freshNext = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(freshPrev, prevBtn);
    nextBtn.parentNode.replaceChild(freshNext, nextBtn);

    freshPrev.addEventListener('click', () => {
        currentIndex = (currentIndex === 0) ? data.length - 1 : currentIndex - 1;
        updateDisplay(currentIndex);
        updateBullets();
    });

    freshNext.addEventListener('click', () => {
        currentIndex = (currentIndex === data.length - 1) ? 0 : currentIndex + 1;
        updateDisplay(currentIndex);
        updateBullets();
    });
}

window.navigateToVehicle = function (type, id) {
    const sectionId = type === 'car' ? 'featured-cars' : 'featured-scooters';
    const section = document.getElementById(sectionId);
    if (section) {
        const navbarHeight = document.getElementById('mainNavbar')?.offsetHeight || 0;
        const targetPosition = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
    if (window.carouselControllers?.[type]) {
        window.carouselControllers[type].goTo(id);
    }
};