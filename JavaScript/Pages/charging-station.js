/**
 * L-Corparation — Charging Station Section Plugin v3
 * ---------------------------------------------------
 * 1. Thêm vào HTML: <section id="cs-root"></section>
 * 2. Thêm vào <head>: <link rel="stylesheet" href="../Css/charging-station.css">
 * 3. Thêm script trước </body>:
 *    <script src="../JavaScript/Pages/charging-station.js"></script>
 */

(function () {
    'use strict';

    // ============================================================
    // DỮ LIỆU
    // ============================================================
    const csData = {
        car: {
            tab: 'Ô Tô Điện',
            sectionTitle: 'Các loại trụ sạc công cộng cho Ô tô điện',
            sectionSub: 'L-Corporation cung cấp đa dạng giải pháp sạc để đáp ứng nhu cầu sử dụng của Khách hàng một cách thuận tiện nhất.',
            types: [
                {
                    img: '../Data/Images/charging/C 250kW.png',
                    name: 'Trụ sạc ô tô – Sạc siêu nhanh DC 250kW',
                    desc: 'Thiết bị sạc Ô tô điện DC 250kW cung cấp nguồn điện một chiều sạc trực tiếp cho pin, thiết kế dạng tủ đứng, 1 cổng sạc, công suất 250kW.',
                    specs: [
                        { label: 'Kiểu dáng', value: 'Tủ đứng' },
                        { label: 'Điện áp hoạt động', value: '400VAC ± 10%, 3 pha' },
                        { label: 'Điện áp đầu ra', value: '200–1000 VDC' },
                        { label: 'Công suất', value: '250 kW/cổng sạc' },
                        { label: 'Số lượng đầu ra', value: '1 cổng/trụ sạc' },
                        { label: 'Nhiệt độ hoạt động', value: '-30°C đến 55°C' },
                        { label: 'Bảo vệ', value: 'Quá tải/quá nhiệt/ngắn mạch/IP54' }
                    ]
                },
                {
                    img: '../Data/Images/charging/DC 150kW.png',
                    name: 'Trụ sạc ô tô – Sạc siêu nhanh DC 150kW',
                    desc: 'Thiết kế dạng tủ đứng, mỗi thiết bị được trang bị 2 cổng sạc, công suất sạc có thể lên tới 150kW.',
                    specs: [
                        { label: 'Kiểu dáng', value: 'Tủ đứng' },
                        { label: 'Điện áp hoạt động', value: '3 pha, 304–456 VAC' },
                        { label: 'Điện áp đầu ra', value: '200–1000 VDC' },
                        { label: 'Tần số hoạt động', value: '50 ± 5% Hz' },
                        { label: 'Công suất', value: '150kW/cổng sạc' },
                        { label: 'Số lượng đầu ra', value: '2 cổng/trụ sạc' },
                        { label: 'Bảo vệ', value: 'Quá tải/quá nhiệt/ngắn mạch/IP54' }
                    ]
                },
                {
                    img: '../Data/Images/charging/DC 60kW.png',
                    name: 'Trụ sạc ô tô – Sạc nhanh DC 60kW',
                    desc: 'Thiết kế dạng tủ đứng, mỗi thiết bị được trang bị 2 cổng sạc, công suất 60 kW/1 cổng sạc.',
                    specs: [
                        { label: 'Kiểu dáng', value: 'Tủ đứng' },
                        { label: 'Điện áp hoạt động', value: '3 pha, 304–456 VAC' },
                        { label: 'Tần số hoạt động', value: '50 ± 5% Hz' },
                        { label: 'Điện áp đầu ra', value: '200–1000 VDC' },
                        { label: 'Công suất', value: '60 kW/cổng sạc' },
                        { label: 'Số lượng đầu ra', value: '2 cổng/trụ sạc' },
                        { label: 'Bảo vệ', value: 'Quá tải/quá nhiệt/ngắn mạch/IP54' }
                    ]
                },
                {
                    img: '../Data/Images/charging/DC 30kW.png',
                    name: 'Trụ sạc ô tô – Sạc nhanh DC 30kW',
                    desc: 'Trụ sạc DC Ô tô điện dùng tại điểm dừng nghỉ, bãi đỗ xe công cộng. Kiểu treo tường hoặc tủ đứng linh hoạt.',
                    specs: [
                        { label: 'Kiểu dáng', value: 'Treo tường & Tủ đứng' },
                        { label: 'Điện áp hoạt động', value: '3 pha, 304–456 VAC' },
                        { label: 'Tần số hoạt động', value: '50 ± 5% Hz' },
                        { label: 'Công suất', value: '30 kW/cổng sạc' },
                        { label: 'Giao thức', value: 'CAN Protocol' },
                        { label: 'Số lượng đầu ra', value: '1 cổng/trụ sạc' },
                        { label: 'Bảo vệ', value: 'Quá tải/quá nhiệt/ngắn mạch/IP54' }
                    ]
                }
            ]
        },
        bike: {
            tab: 'Xe Máy Điện',
            sectionTitle: 'Các loại trụ sạc công cộng cho Xe máy điện',
            sectionSub: 'L-Corporation cung cấp giải pháp sạc thông minh, tiện lợi cho xe máy điện — phủ khắp khu dân cư, trường học, văn phòng trên toàn quốc.',
            types: [
                {
                    img: '../Data/Images/charging/Swap Station.png',
                    name: 'Trạm đổi pin – Swap Station',
                    desc: 'Công nghệ đổi pin thông minh — thay pin đầy trong vòng 60 giây, không cần chờ sạc. Phù hợp cho người dùng cần di chuyển liên tục.',
                    specs: [
                        { label: 'Kiểu dáng', value: 'Tủ đứng ngoài trời' },
                        { label: 'Số ngăn pin', value: '10–20 ngăn/trạm' },
                        { label: 'Thời gian đổi pin', value: '< 60 giây' },
                        { label: 'Kết nối', value: '4G / Wi-Fi' },
                        { label: 'Thanh toán', value: 'App / QR Code' },
                        { label: 'Hoạt động', value: '24/7' },
                        { label: 'Bảo vệ', value: 'Chống nước IP55' }
                    ]
                },
                {
                    img: '../Data/Images/charging/3,3kW.png',
                    name: 'Trụ sạc xe máy – Sạc nhanh 3,3kW',
                    desc: 'Trụ sạc AC tiêu chuẩn cho xe máy điện, sạc đầy trong khoảng 2 giờ. Thiết kế gọn, lắp đặt linh hoạt tại nhiều địa điểm.',
                    specs: [
                        { label: 'Kiểu dáng', value: 'Treo tường / Cột đứng' },
                        { label: 'Điện áp hoạt động', value: '220VAC, 1 pha' },
                        { label: 'Công suất', value: '3,3 kW/cổng' },
                        { label: 'Số cổng sạc', value: '2–4 cổng/trụ' },
                        { label: 'Thời gian sạc', value: '~2 giờ đầy pin' },
                        { label: 'Kết nối', value: '4G / Wi-Fi' },
                        { label: 'Bảo vệ', value: 'Quá tải/IP54' }
                    ]
                },
                {
                    img: '../Data/Images/charging/Home Charger.png',
                    name: 'Trụ sạc tại nhà – Home Charger',
                    desc: 'Giải pháp sạc tại nhà tiện lợi, lắp đặt đơn giản. Sạc qua đêm là đủ năng lượng cho cả ngày di chuyển.',
                    specs: [
                        { label: 'Kiểu dáng', value: 'Treo tường' },
                        { label: 'Điện áp hoạt động', value: '220VAC, 1 pha' },
                        { label: 'Công suất', value: '1,5 kW/cổng' },
                        { label: 'Số cổng sạc', value: '1 cổng/thiết bị' },
                        { label: 'Thời gian sạc', value: '~4–6 giờ đầy pin' },
                        { label: 'Cáp sạc', value: 'Tích hợp sẵn 1,5m' },
                        { label: 'Bảo vệ', value: 'Quá nhiệt/ngắn mạch' }
                    ]
                },
                {
                    img: '../Data/Images/charging/Multi Port 6,6kW.png',
                    name: 'Trụ sạc cộng đồng – Multi Port 6,6kW',
                    desc: 'Trụ sạc nhiều cổng dành cho khu chung cư, bãi đỗ xe, văn phòng. Quản lý thông minh qua app, chia sẻ dễ dàng.',
                    specs: [
                        { label: 'Kiểu dáng', value: 'Cột đứng ngoài trời' },
                        { label: 'Điện áp hoạt động', value: '220VAC, 1 pha' },
                        { label: 'Công suất', value: '6,6 kW tổng' },
                        { label: 'Số cổng sạc', value: '4–6 cổng/trụ' },
                        { label: 'Quản lý', value: 'App + màn hình LCD' },
                        { label: 'Thanh toán', value: 'App / QR / Thẻ' },
                        { label: 'Bảo vệ', value: 'Quá tải/IP55' }
                    ]
                }
            ]
        }
    };

    // ============================================================
    // NAV LINK
    // ============================================================
    function scrollToCS() {
        var section = document.getElementById('cs-root');
        if (!section) return;
        var navbar = document.getElementById('mainNavbar');
        var offset = navbar ? navbar.offsetHeight + 8 : 70;
        var top = section.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
    }

    function injectNavLink() {
        if (document.getElementById('cs-nav-link')) return;

        var navList = document.querySelector('.navbar-nav');
        if (!navList) return;

        var afterItem = null;
        var allItems = navList.querySelectorAll('.nav-item');
        for (var i = 0; i < allItems.length; i++) {
            var txt = allItems[i].textContent.trim();
            if (txt.indexOf('Trạm sạc') !== -1 || txt.indexOf('Trạm Sạc') !== -1) {
                afterItem = allItems[i];
                break;
            }
        }

        var li = document.createElement('li');
        li.className = 'nav-item';

        var a = document.createElement('a');
        a.id = 'cs-nav-link';
        a.className = 'nav-link';
        a.href = '#cs-root';
        a.textContent = 'Chi tiết trạm sạc';
        a.style.cursor = 'pointer';
        a.addEventListener('click', function (e) {
            e.preventDefault();
            scrollToCS();
        });

        li.appendChild(a);

        if (afterItem && afterItem.nextSibling) {
            navList.insertBefore(li, afterItem.nextSibling);
        } else if (afterItem) {
            navList.appendChild(li);
        } else {
            navList.appendChild(li);
        }
    }

    // ============================================================
    // LIGHTBOX
    // ============================================================
    function createLightbox() {
        if (document.getElementById('cs-lightbox')) return;

        const lb = document.createElement('div');
        lb.id = 'cs-lightbox';
        lb.className = 'cs-lightbox';

        const inner = document.createElement('div');
        inner.className = 'cs-lightbox-inner';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'cs-lightbox-close';
        closeBtn.textContent = '✕';
        closeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            closeLightbox();
        });

        const img = document.createElement('img');
        img.id = 'cs-lb-img';
        img.className = 'cs-lightbox-img';
        img.addEventListener('click', function (e) { e.stopPropagation(); });

        const cap = document.createElement('div');
        cap.id = 'cs-lb-cap';
        cap.className = 'cs-lightbox-caption';

        inner.appendChild(closeBtn);
        inner.appendChild(img);
        inner.appendChild(cap);
        lb.appendChild(inner);

        lb.addEventListener('click', closeLightbox);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeLightbox();
        });

        document.body.appendChild(lb);
    }

    function openLightbox(src, name) {
        const lb = document.getElementById('cs-lightbox');
        const img = document.getElementById('cs-lb-img');
        const cap = document.getElementById('cs-lb-cap');
        if (!lb || !img) return;
        img.src = src;
        img.alt = name;
        cap.textContent = name;
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        const lb = document.getElementById('cs-lightbox');
        if (!lb) return;
        lb.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ============================================================
    // PLACEHOLDER
    // ============================================================
    function createPlaceholder() {
        const wrap = document.createElement('div');
        wrap.className = 'cs-img-placeholder';
        wrap.innerHTML = '<svg viewBox="0 0 24 24" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
        return wrap;
    }

    // ============================================================
    // TẠO CARD
    // ============================================================
    function createCard(t) {
        const card = document.createElement('div');
        card.className = 'cs-card';

        const imgWrap = document.createElement('div');
        imgWrap.className = 'cs-card-img-wrap';
        imgWrap.title = 'Nhấn để phóng to';

        const img = document.createElement('img');
        img.className = 'cs-card-img';
        img.src = t.img;
        img.alt = t.name;
        img.loading = 'lazy';
        img.addEventListener('error', function () {
            imgWrap.replaceChild(createPlaceholder(), img);
            imgWrap.style.cursor = 'default';
        });
        imgWrap.appendChild(img);

        const hint = document.createElement('div');
        hint.className = 'cs-zoom-hint';
        hint.innerHTML = '<svg viewBox="0 0 24 24" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>Phóng to';
        imgWrap.appendChild(hint);

        imgWrap.addEventListener('click', function () {
            if (document.contains(img)) { openLightbox(t.img, t.name); }
        });

        const body = document.createElement('div');
        body.className = 'cs-card-body';

        const name = document.createElement('div');
        name.className = 'cs-card-name';
        name.textContent = t.name;

        const desc = document.createElement('div');
        desc.className = 'cs-card-desc';
        desc.textContent = t.desc;

        const table = document.createElement('table');
        table.className = 'cs-specs';
        t.specs.forEach(function (s) {
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.textContent = s.label;
            const td2 = document.createElement('td');
            td2.textContent = s.value;
            tr.appendChild(td1);
            tr.appendChild(td2);
            table.appendChild(tr);
        });

        body.appendChild(name);
        body.appendChild(desc);
        body.appendChild(table);
        card.appendChild(imgWrap);
        card.appendChild(body);
        return card;
    }

    // ============================================================
    // RENDER PANE
    // ============================================================
    function renderPane(key) {
        const d = csData[key];

        const pane = document.createElement('div');
        pane.className = 'cs-tab-pane active';
        pane.id = 'cs-pane-' + key;

        const header = document.createElement('div');
        header.className = 'cs-section-header';
        header.innerHTML = '<h2>' + d.sectionTitle + '</h2><p>' + d.sectionSub + '</p>';

        const grid = document.createElement('div');
        grid.className = 'cs-cards-wrap';
        d.types.forEach(function (t) { grid.appendChild(createCard(t)); });

        pane.appendChild(header);
        pane.appendChild(grid);
        return pane;
    }

    // ============================================================
    // RENDER ROOT
    // ============================================================
    function render() {
        const root = document.getElementById('cs-root');
        if (!root) return;
        root.innerHTML = '';

        const tabbar = document.createElement('div');
        tabbar.className = 'cs-tabbar';

        const carIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l2-4h12l2 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>';
        const bikeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h-5l-3 6h10l-1-4h-4"/><path d="M12 6V3"/></svg>';

        [
            { key: 'car', label: 'Ô Tô Điện', icon: carIcon },
            { key: 'bike', label: 'Xe Máy Điện', icon: bikeIcon }
        ].forEach(function (def, i) {
            const btn = document.createElement('button');
            btn.className = 'cs-tabbar-btn' + (i === 0 ? ' active' : '');
            btn.dataset.tab = def.key;
            btn.innerHTML = def.icon + ' ' + def.label;
            tabbar.appendChild(btn);
        });

        const panesWrap = document.createElement('div');
        panesWrap.className = 'cs-panes';
        panesWrap.appendChild(renderPane('car'));

        root.appendChild(tabbar);
        root.appendChild(panesWrap);

        bindTabs(panesWrap);
        initAnim();
    }

    // ============================================================
    // BIND TABS
    // ============================================================
    function bindTabs(panesWrap) {
        document.querySelectorAll('.cs-tabbar-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const key = btn.dataset.tab;
                document.querySelectorAll('.cs-tabbar-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                panesWrap.innerHTML = '';
                panesWrap.appendChild(renderPane(key));
                initAnim();
            });
        });
    }

    // ============================================================
    // ANIMATION
    // ============================================================
    function initAnim() {
        const cards = document.querySelectorAll('.cs-card');
        if (!cards.length) return;

        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (e, i) {
                    if (e.isIntersecting) {
                        setTimeout(function () { e.target.classList.add('visible'); }, i * 80);
                        obs.unobserve(e.target);
                    }
                });
            }, { threshold: 0.1 });

            cards.forEach(function (c) { obs.observe(c); });
        } else {
            cards.forEach(function (c) { c.classList.add('visible'); });
        }
    }

    // ============================================================
    // INIT
    // ============================================================
    function init() {
        createLightbox();
        render();
        injectNavLink();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();