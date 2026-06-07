/**
 * L-Corparation — History Section Plugin
 * Layout: VinFast-style grid — ảnh to trên, text dưới, thanh năm ở cuối
 *
 * CSS: ../Css/history.css  ← cần thêm <link> vào index.html
 */

(function () {
    'use strict';

    const historyData = [
        {
            year: 2017,
            img: '../Data/Images/History/image.png',
            title: 'Khởi nguồn',
            desc: 'L-Corparation được thành lập với tầm nhìn xây dựng hệ sinh thái năng lượng xanh tại Việt Nam, đặt nền móng cho cuộc cách mạng xe điện.'
        },
        {
            year: 2019,
            img: '../Data/Images/History/image copy.png',
            title: 'Ra mắt dòng xe đầu tiên',
            desc: 'Mẫu xe điện đầu tiên chính thức ra mắt thị trường, nhận được phản hồi tích cực từ người tiêu dùng Việt Nam.'
        },
        {
            year: 2021,
            img: '../Data/Images/History/image copy 2.png',
            title: 'Mở rộng quy mô',
            desc: 'Mở rộng mạng lưới phân phối ra 30 tỉnh thành, ra mắt thêm 3 mẫu xe mới và đạt mốc 10.000 xe bàn giao.'
        },
        {
            year: 2022,
            img: '../Data/Images/History/image copy 3.png',
            title: 'Hệ thống sạc toàn quốc',
            desc: 'Triển khai hơn 500 trạm sạc trên toàn quốc, giải quyết bài toán hạ tầng — rào cản lớn nhất của xe điện tại Việt Nam.'
        },
        {
            year: 2023,
            img: '../Data/Images/History/image copy 8.png',
            title: 'Bước ra thế giới',
            desc: 'Lần đầu xuất khẩu xe điện sang thị trường Đông Nam Á và bắt đầu hành trình chinh phục thị trường quốc tế.'
        },
        {
            year: 2024,
            img: '../Data/Images/History/image copy 9.png',
            title: 'Công nghệ AI tích hợp',
            desc: 'Ra mắt thế hệ xe mới tích hợp AI — tự lái cấp độ 2, nhận diện giọng nói tiếng Việt và hệ thống dự đoán bảo dưỡng thông minh.'
        },
        {
            year: 2025,
            img: '../Data/Images/History/image copy 7.png',
            title: 'Dẫn đầu thị trường',
            desc: 'L-Corparation trở thành thương hiệu xe điện số 1 Việt Nam với hơn 100.000 xe lưu thông trên đường, khẳng định vị thế tiên phong.'
        },
        {
            year: 2026,
            img: '../Data/Images/History/image copy 5.png',
            title: 'Tương lai xanh',
            desc: 'Khởi động dự án nhà máy pin thể rắn thế hệ mới, hướng tới mục tiêu trung hoà carbon vào năm 2030 và định hình lại ngành giao thông Việt Nam.'
        }
    ];

    // ── LABEL đa ngôn ngữ ────────────────────────────────────────
    const NAV_LABEL = { vi: 'Lịch sử', en: 'History' };
    const HEADING = { vi: 'Lịch sử thương hiệu', en: 'Brand History' };
    const g = () => typeof window.currentLang !== 'undefined' ? window.currentLang : 'vi';
    const navLabel = () => NAV_LABEL[g()] || NAV_LABEL.vi;
    const heading = () => HEADING[g()] || HEADING.vi;

    // ── INJECT NAV LINK ──────────────────────────────────────────
    function injectNavLink() {
        const existing = document.getElementById('history-nav-link');
        if (existing) { existing.textContent = navLabel(); return; }

        const navList = document.querySelector('.navbar-nav');
        if (!navList) return;

        const li = document.createElement('li');
        li.className = 'nav-item';
        li.innerHTML = `<a class="nav-link" href="#history-section-root" id="history-nav-link">${navLabel()}</a>`;

        const newsTrigger = navList.querySelector('#nw7-nav-link')?.parentElement
            || [...navList.querySelectorAll('.nav-item')].find(i => i.querySelector('[data-i18n="nav_news"]'));
        const aboutTrigger = [...navList.querySelectorAll('.nav-item')].find(i => i.querySelector('[data-i18n="nav_about"]'));

        if (newsTrigger) navList.insertBefore(li, newsTrigger);
        else if (aboutTrigger) navList.insertBefore(li, aboutTrigger);
        else navList.appendChild(li);

        li.querySelector('a').addEventListener('click', e => {
            e.preventDefault();
            scrollToHistory();
        });
    }

    function scrollToHistory() {
        const section = document.getElementById('history-section-root');
        if (!section) return;
        const navbar = document.getElementById('mainNavbar');
        const offset = navbar ? navbar.offsetHeight + 8 : 70;
        const top = section.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }

    // ── STATE ────────────────────────────────────────────────────
    let activeYear = null;
    const sorted = [...historyData].sort((a, b) => b.year - a.year);

    let visibleStart = 0;
    const PAGE = 4;

    function currentItems() {
        return sorted.slice(visibleStart, visibleStart + PAGE);
    }

    // ── RENDER ───────────────────────────────────────────────────
    function renderHistory() {
        const root = document.getElementById('history-section-root');
        if (!root) return;

        const items = currentItems();
        const allYears = sorted.map(d => d.year);
        const activeYr = activeYear || items[0]?.year;

        const cardsHTML = items.map((item, i) => `
        <div class="hs-card" style="transition-delay:${i * 0.07}s">
            <div class="hs-card-img">
                <img src="${item.img}" alt="${item.title}" loading="lazy"
                    onerror="this.parentElement.innerHTML='<div class=\\'hs-card-img-placeholder\\'>—</div>'">
            </div>
            <div class="hs-card-date">${item.year}.&thinsp;${item.title}</div>
            <p class="hs-card-desc">${item.desc}</p>
        </div>`).join('');

        const yearsHTML = allYears.map(y => `
        <div class="hs-year-item${y === activeYr ? ' active' : ''}" data-year="${y}">${y}</div>`).join('');

        root.innerHTML = `
        <div class="hs-wrap">
            <div class="hs-heading">
                <h2>${heading()}</h2>
            </div>
            <div class="hs-grid" id="hs-grid">${cardsHTML}</div>
            <div class="hs-timeline-bar" id="hs-bar">${yearsHTML}</div>
        </div>`;

        root.querySelectorAll('.hs-year-item').forEach(el => {
            el.addEventListener('click', () => {
                const yr = parseInt(el.dataset.year);
                const idx = sorted.findIndex(d => d.year === yr);
                if (idx === -1) return;
                visibleStart = Math.floor(idx / PAGE) * PAGE;
                activeYear = yr;
                renderHistory();
            });
        });

        requestAnimationFrame(() => {
            if ('IntersectionObserver' in window) {
                const obs = new IntersectionObserver(entries => {
                    entries.forEach(e => {
                        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
                    });
                }, { threshold: 0.08 });
                root.querySelectorAll('.hs-card').forEach(c => obs.observe(c));
            } else {
                root.querySelectorAll('.hs-card').forEach(c => c.classList.add('visible'));
            }
        });
    }

    // ── ĐĂNG KÝ LẮNG NGHE SỰ KIỆN NGÔN NGỮ ─────────────────────
    function registerLangListener() {
        if (!window.__langListeners) window.__langListeners = [];
        window.__langListeners.push(function () {
            renderHistory();
            injectNavLink();
        });
    }

    // ── INIT ─────────────────────────────────────────────────────
    function init() {
        renderHistory();
        if (document.querySelector('.navbar-nav')) {
            injectNavLink();
        } else {
            setTimeout(injectNavLink, 500);
        }
        registerLangListener();
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();
})();