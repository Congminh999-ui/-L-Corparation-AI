/**
 * L-Corparation — News Plugin v7.0
 * Compact auto-slide: ảnh trái, chữ phải, click mở reader full
 *
 * CSS: ../Css/news.css  ← cần thêm <link> vào index.html
 */
(function () {
    'use strict';

    const NEWS = [
        {
            id: 1, cat: 'xe-may',
            tag: { vi: 'Kỷ lục', en: 'Record' }, tagColor: '#c8102e',
            title: { vi: 'VinFast lập kỷ lục 135.000 đơn hàng xe máy điện trong tháng 3/2026', en: 'VinFast Sets Record 135,000 E-Scooter Orders in March 2026' },
            desc: { vi: 'Tháng 3/2026, VinFast nhận hơn 135.000 đơn đặt hàng và xuất xưởng hơn 93.000 xe máy điện — mức doanh số tháng cao nhất từ trước đến nay.', en: 'In March 2026, VinFast received over 135,000 orders and shipped over 93,000 e-scooters — the highest monthly sales ever.' },
            body: {
                vi: `<p>Ngày 3/4/2026, VinFast công bố kết quả kinh doanh tháng 3 với con số kỷ lục chưa từng có: <strong>hơn 135.000 đơn đặt hàng</strong> từ các đại lý phân phối trên toàn quốc và <strong>hơn 93.000 xe</strong> đã xuất xưởng ra thị trường.</p><h3>Evo và Feliz dẫn đầu</h3><p>Hơn <strong>52.000 xe Evo</strong> và <strong>24.000 xe Feliz</strong> đến tay khách hàng trong tháng 3 — chiếm gần 82% tổng sản lượng.</p><h3>Vì sao doanh số bùng nổ?</h3><p>Giá xăng biến động mạnh, chương trình <strong>"Thu xăng — Đổi điện"</strong> gia hạn đến 30/4/2026 và chính sách hỗ trợ mua trả góp 0 đồng là 3 yếu tố chính.</p>`,
                en: `<p>On April 3, 2026, VinFast announced record-breaking March figures: <strong>over 135,000 orders</strong> and <strong>over 93,000 units</strong> shipped to market.</p><h3>Evo and Feliz Lead</h3><p>Over <strong>52,000 Evo</strong> and <strong>24,000 Feliz</strong> units reached customers — accounting for nearly 82% of total output.</p>`
            },
            video: '../Data/Images/news/YTSave.com_YouTube_XE-MAY-DIEN-VINFAST-LAP-KY-LUC-DOANH-SO-_Media_IWEsAWlV_tE_002_720p.mp4',
            date: '2026-04-03', source: 'Báo Công An Nhân Dân',
            readTime: { vi: '4 phút', en: '4 min' },
            img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
        },
        {
            id: 2, cat: 'o-to',
            tag: { vi: 'Ô tô điện', en: 'EV Car' }, tagColor: '#1a56db',
            title: { vi: 'VinFast chính thức nhận đặt cọc VF MPV 7 tại Ấn Độ — xe đa dụng 7 chỗ', en: 'VinFast Opens VF MPV 7 Bookings in India — 7-Seat MPV' },
            desc: { vi: 'VinFast chính thức nhận đặt cọc mẫu xe điện thứ ba tại Ấn Độ, VF MPV 7 — đánh dấu bước mở rộng mạnh sang thị trường Nam Á.', en: 'VinFast officially opened bookings for the VF MPV 7 — marking a bold expansion into South Asia.' },
            body: {
                vi: `<p>Ngày 02/04/2026, VinFast mở nhận đặt cọc <strong>VF MPV 7</strong> tại Ấn Độ — mẫu xe điện đa dụng 7 chỗ, sản phẩm thứ ba tại thị trường tỷ dân này.</p><h3>Thông số kỹ thuật</h3><p>Pin 75 kWh, tầm hoạt động ~450 km (WLTP), màn hình 15,6 inch, sạc nhanh 150 kW DC.</p>`,
                en: `<p>On April 2, 2026, VinFast opened bookings for the <strong>VF MPV 7</strong> in India.</p><h3>Specifications</h3><p>75 kWh battery, ~450 km WLTP range, 15.6-inch display, 150 kW DC fast charging.</p>`
            },
            date: '2026-04-02', source: 'VinFast Global',
            readTime: { vi: '3 phút', en: '3 min' },
            img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80'
        },
        {
            id: 3, cat: 'o-to',
            tag: { vi: 'Kỷ lục', en: 'Record' }, tagColor: '#047857',
            title: { vi: 'VinFast bàn giao hơn 3.520 ô tô điện trong một ngày 28/3', en: 'VinFast Delivers Over 3,520 Electric Cars in a Single Day' },
            desc: { vi: 'Ngày 28/3/2026, VinFast bàn giao 3.520 đơn hàng ô tô điện — kỷ lục bàn giao đơn ngày chưa từng có tại Việt Nam.', en: 'VinFast delivered 3,520 electric car orders in a single day — unprecedented in Vietnam.' },
            body: {
                vi: `<p>VinFast tổ chức sự kiện bàn giao lịch sử với <strong>3.520 ô tô điện</strong> trong một ngày.</p><h3>VF5, VF6, VF7 dẫn đầu</h3><p>VF5 chiếm ~42%, VF6 ~31%, VF7 ~18%.</p>`,
                en: `<p>VinFast delivered <strong>3,520 electric cars</strong> in a single day.</p><h3>VF5, VF6 and VF7 Lead</h3><p>VF5 ~42%, VF6 ~31%, VF7 ~18%.</p>`
            },
            date: '2026-03-28', source: 'VinFast Official',
            readTime: { vi: '3 phút', en: '3 min' },
            img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80'
        },
        {
            id: 4, cat: 'chinh-sach',
            tag: { vi: 'Chính sách', en: 'Policy' }, tagColor: '#d97706',
            title: { vi: '"Thu xăng — Đổi điện": VinFast gia hạn ưu đãi 5% đến 30/4/2026', en: '"Trade Gas for Electric": VinFast Extends 5% Discount to April 30' },
            desc: { vi: 'Chương trình "Thu xăng — Đổi điện" gia hạn đến 30/4/2026, tặng thêm 5% giá xe khi chuyển từ xe xăng sang xe máy điện VinFast.', en: 'VinFast extends program to April 30, 2026, giving an extra 5% discount when switching from gasoline.' },
            body: {
                vi: `<p>VinFast gia hạn <strong>"Thu xăng — Đổi điện"</strong> đến hết <strong>30/4/2026</strong>. Thêm 5% giá xe khi đổi xe xăng cũ, cộng dồn ưu đãi 6% và hỗ trợ 100% lệ phí trước bạ.</p>`,
                en: `<p>VinFast extends <strong>"Trade Gas for Electric"</strong> through April 30 with an extra 5% discount on trading in a gasoline vehicle.</p>`
            },
            date: '2026-03-20', source: 'CafeF',
            readTime: { vi: '3 phút', en: '3 min' },
            img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80'
        },
        {
            id: 5, cat: 'xe-may',
            tag: { vi: 'Ra mắt', en: 'Launch' }, tagColor: '#059669',
            title: { vi: 'Honda CUV e: chính thức mở bán từ 26/3/2026 — giá từ 45 triệu', en: 'Honda CUV e: On Sale from March 26, 2026 — From 45M VND' },
            desc: { vi: 'Honda Việt Nam mở bán CUV e: với 2 gói: kèm pin 65 triệu hoặc không pin 45 triệu. Màn hình TFT 7 inch, Honda RoadSync Duo, tốc độ 80km/h.', en: 'Honda Vietnam launched CUV e: with 7-inch TFT, 80km/h top speed, two battery packages.' },
            body: {
                vi: `<p>Honda Việt Nam chính thức mở bán <strong>CUV e:</strong> từ 26/3/2026.</p><h3>Hai gói</h3><p>Kèm pin: <strong>65 triệu</strong>. Không pin: <strong>45 triệu</strong> + thuê 250.000đ/tháng.</p>`,
                en: `<p>Honda Vietnam opened sales of <strong>CUV e:</strong> from March 26, 2026.</p><h3>Two Packages</h3><p>With battery: <strong>65M VND</strong>. Without: <strong>45M VND</strong> + rental.</p>`
            },
            video: 'https://www.youtube.com/embed/DtXCGBrZIUE',
            date: '2026-03-26', source: 'Honda Việt Nam',
            readTime: { vi: '4 phút', en: '4 min' },
            img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80'
        },
        {
            id: 6, cat: 'chinh-sach',
            tag: { vi: 'Hạ tầng', en: 'Infrastructure' }, tagColor: '#b45309',
            title: { vi: 'Mạng lưới trạm sạc V-Green: Sạc miễn phí đến tháng 5/2027', en: 'V-Green Network: Free Charging Until May 2027' },
            desc: { vi: 'V-Green cung cấp sạc miễn phí tại trạm công cộng cho chủ xe VinFast đến hết 31/5/2027. Hơn 150.000 cổng sạc trên 63 tỉnh thành.', en: 'V-Green provides free public charging for VinFast owners until May 31, 2027 across 63 provinces.' },
            body: {
                vi: `<p>V-Green duy trì <strong>sạc miễn phí</strong> tại hơn <strong>150.000 cổng sạc</strong> — toàn bộ Vincom, Vinhomes, Vinpearl và cao tốc Bắc–Nam.</p>`,
                en: `<p>V-Green maintains <strong>free charging</strong> at over <strong>150,000 ports</strong> nationwide until May 2027.</p>`
            },
            date: '2026-02-20', source: 'VinFast Official',
            readTime: { vi: '4 phút', en: '4 min' },
            img: 'https://images.unsplash.com/photo-1649433391420-542fcd3d9adb?w=800&q=80'
        },
        {
            id: 7, cat: 'xe-may',
            tag: { vi: 'Mới 2026', en: 'New 2026' }, tagColor: '#7c3aed',
            title: { vi: 'VinFast ra mắt 5 mẫu xe máy điện đời mới 2026: Amio, Feliz II, Evo đổi pin...', en: 'VinFast Launches 5 New 2026 E-Scooter Models' },
            desc: { vi: 'Chỉ trong tháng 1/2026, VinFast trình làng 5 mẫu xe mới: Amio, Feliz II, Evo đổi pin, Viper và Flazz.', en: 'In January 2026, VinFast unveiled 5 new e-scooter models: Amio, Feliz II, Evo battery-swap, Viper, and Flazz.' },
            body: {
                vi: `<p>VinFast đồng loạt trình làng <strong>5 mẫu xe máy điện mới</strong> trong tháng 1/2026.</p><h3>Amio</h3><p>Pin LFP 1,024 kWh cố định, tầm 65 km, không cần bằng lái.</p><h3>Evo đổi pin</h3><p>Tích hợp đổi pin tại trạm V-Green.</p>`,
                en: `<p>VinFast unveiled <strong>5 all-new e-scooter models</strong> in January 2026.</p><h3>Amio</h3><p>Fixed 1.024 kWh LFP, 65 km range, no license required.</p>`
            },
            date: '2026-01-27', source: 'Websosanh.vn',
            readTime: { vi: '5 phút', en: '5 min' },
            img: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80'
        },
        {
            id: 8, cat: 'o-to',
            tag: { vi: 'Tài chính', en: 'Finance' }, tagColor: '#0369a1',
            title: { vi: 'VinFast ghi nhận tăng trưởng doanh số ô tô điện 68% — Q1/2026', en: 'VinFast Records 68% EV Sales Growth — Q1/2026' },
            desc: { vi: 'Quý 1/2026, VinFast tăng trưởng 68% doanh số ô tô điện so với cùng kỳ 2025 với hơn 18.500 xe bán ra.', en: 'Q1/2026, VinFast recorded 68% electric car sales growth with over 18,500 cars sold.' },
            body: {
                vi: `<p>VinFast ghi nhận <strong>tăng trưởng 68%</strong> Q1/2026 với <strong>hơn 18.500 xe</strong>. VF5 dẫn đầu (~39%), VF6 (~28%), VF7 (~21%).</p>`,
                en: `<p>VinFast recorded <strong>68% growth</strong> in Q1/2026. VF5 led (~39%), VF6 (~28%), VF7 (~21%).</p>`
            },
            date: '2026-04-01', source: 'VinFast Official',
            readTime: { vi: '3 phút', en: '3 min' },
            img: 'https://images.unsplash.com/photo-1558981285-6f0c68243f18?w=800&q=80'
        }
    ];

    // ── LANG ─────────────────────────────────────────────────────
    const L = {
        vi: {
            navLabel: 'Tin tức', heading: 'Tin tức Xe Điện',
            sub: 'Cập nhật thị trường xe điện Việt Nam',
            close: 'Đóng', video: 'Video liên quan', minread: 'phút đọc',
            prev: '‹', next: '›', readmore: 'Đọc tiếp →',
            of: 'của'
        },
        en: {
            navLabel: 'News', heading: 'EV News',
            sub: 'Vietnam electric vehicle market updates',
            close: 'Close', video: 'Related Video', minread: 'min read',
            prev: '‹', next: '›', readmore: 'Read more →',
            of: 'of'
        }
    };

    const g = () => (typeof window.currentLang !== 'undefined' ? window.currentLang : 'vi');
    const l = k => (L[g()] || L.vi)[k];
    const tx = o => (o ? o[g()] || o.vi || '' : '');
    const fd = s => { const d = new Date(s); return isNaN(d) ? s : d.toLocaleDateString(g() === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }); };

    // ── STATE ─────────────────────────────────────────────────────
    let currentSlide = 0;
    let autoTimer = null;
    const AUTO_INTERVAL = 5000;

    // ── READER ────────────────────────────────────────────────────
    let rdr, prog;
    function buildReader() {
        if (document.getElementById('nw7-reader')) { rdr = document.getElementById('nw7-reader'); prog = document.getElementById('nw7-prog'); return; }
        prog = document.createElement('div'); prog.id = 'nw7-prog'; prog.className = 'nw7-prog';
        rdr = document.createElement('div'); rdr.id = 'nw7-reader'; rdr.className = 'nw7-reader';
        rdr.innerHTML = `
            <div class="nw7-rbar">
                <span class="nw7-rbrand">L-Corparation</span>
                <span class="nw7-rtitle" id="nw7-rtitle"></span>
                <button class="nw7-rclose" id="nw7-rclose">← Đóng</button>
            </div>
            <div class="nw7-rarticle" id="nw7-rarticle"></div>`;
        document.body.appendChild(prog);
        document.body.appendChild(rdr);
        document.getElementById('nw7-rclose').addEventListener('click', closeReader);
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && rdr.classList.contains('open')) closeReader(); });
        rdr.addEventListener('scroll', () => {
            const h = rdr.scrollHeight - rdr.clientHeight;
            prog.style.width = (h > 0 ? (rdr.scrollTop / h) * 100 : 0) + '%';
        });
    }

    function openReader(art) {
        buildReader();
        document.getElementById('nw7-rtitle').textContent = tx(art.title);
        document.getElementById('nw7-rclose').innerHTML = `← ${l('close')}`;
        const isLocalVideo = art.video && (art.video.endsWith('.mp4') || art.video.endsWith('.webm'));
        const videoHTML = art.video ? `<div class="nw7-r-video"><div class="nw7-r-video-label">${l('video')}</div>${isLocalVideo
                ? `<video controls style="width:100%;aspect-ratio:16/9;display:block;background:#000;" preload="metadata"><source src="${art.video}" type="video/mp4">Trình duyệt không hỗ trợ video.</video>`
                : `<iframe src="${art.video}" allowfullscreen loading="lazy"></iframe>`
            }</div>` : '';
        document.getElementById('nw7-rarticle').innerHTML = `
            <span class="nw7-r-tag" style="background:${art.tagColor}">${tx(art.tag)}</span>
            <h1 class="nw7-r-title">${tx(art.title)}</h1>
            <div class="nw7-r-meta">
                <span class="nw7-r-src">${art.source}</span><span>·</span>
                <span>${fd(art.date)}</span><span>·</span>
                <span>${tx(art.readTime)} ${l('minread')}</span>
            </div>
            <img class="nw7-r-img" src="${art.img}" alt="${tx(art.title)}" onerror="this.style.display='none'">
            ${videoHTML}
            <div class="nw7-r-body">${tx(art.body)}</div>`;
        rdr.scrollTop = 0;
        prog.style.width = '0%';
        requestAnimationFrame(() => rdr.classList.add('open'));
        document.body.style.overflow = 'hidden';
    }

    function closeReader() {
        rdr && rdr.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ── NAV DROPDOWN ──────────────────────────────────────────────
    let navDropdown = null;

    function buildNavDropdown() {
        if (document.getElementById('nw7-nav-dropdown')) {
            navDropdown = document.getElementById('nw7-nav-dropdown');
            updateNavDropdown();
            return;
        }
        navDropdown = document.createElement('div');
        navDropdown.id = 'nw7-nav-dropdown';
        navDropdown.className = 'nw7-nav-dropdown';
        navDropdown.innerHTML = `
            <div class="nw7-nav-panel">
                <div class="nw7-nav-header">
                    <span class="nw7-nav-htitle">📰 ${l('heading')}</span>
                    <button class="nw7-nav-hclose" id="nw7-nav-close">✕ ${l('close')}</button>
                </div>
                <div class="nw7-nav-list" id="nw7-nav-list"></div>
            </div>`;
        document.body.appendChild(navDropdown);

        document.getElementById('nw7-nav-close').addEventListener('click', closeNavDropdown);
        navDropdown.addEventListener('click', e => { if (e.target === navDropdown) closeNavDropdown(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && navDropdown.classList.contains('open')) closeNavDropdown(); });
        updateNavDropdown();
    }

    function updateNavDropdown() {
        const list = document.getElementById('nw7-nav-list');
        if (!list) return;
        list.innerHTML = NEWS.map(a => `
            <div class="nw7-nav-item" data-id="${a.id}">
                <div class="nw7-nav-img"><img src="${a.img}" loading="lazy" alt="" onerror="this.parentElement.style.display='none'"></div>
                <div class="nw7-nav-ibody">
                    <span class="nw7-nav-itag" style="background:${a.tagColor}">${tx(a.tag)}</span>
                    <div class="nw7-nav-ititle">${tx(a.title)}</div>
                    <div class="nw7-nav-imeta">
                        <span class="nw7-nav-isrc">${a.source}</span>
                        <span>·</span><span>${fd(a.date)}</span>
                    </div>
                </div>
            </div>`).join('');
        list.querySelectorAll('.nw7-nav-item').forEach(el => {
            el.addEventListener('click', () => {
                const art = NEWS.find(a => a.id === parseInt(el.dataset.id));
                if (art) { closeNavDropdown(); openReader(art); }
            });
        });
        const htitle = navDropdown.querySelector('.nw7-nav-htitle');
        if (htitle) htitle.textContent = '📰 ' + l('heading');
        const hclose = document.getElementById('nw7-nav-close');
        if (hclose) hclose.textContent = '✕ ' + l('close');
    }

    function openNavDropdown() {
        buildNavDropdown();
        navDropdown.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeNavDropdown() {
        navDropdown && navDropdown.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ── NAV LINK ──────────────────────────────────────────────────
    function scrollToNews() {
        const section = document.getElementById('news-section-root');
        if (!section) return;
        const navbar = document.getElementById('mainNavbar');
        const offset = navbar ? navbar.offsetHeight + 8 : 70;
        const top = section.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }

    function injectNavLink() {
        const existing = document.querySelector('[data-i18n="nav_news"]');
        if (existing) {
            existing.style.cursor = 'pointer';
            existing.textContent = l('navLabel');
            const fresh = existing.cloneNode(true);
            existing.parentNode.replaceChild(fresh, existing);
            fresh.addEventListener('click', e => { e.preventDefault(); scrollToNews(); });
            return;
        }
        const navList = document.querySelector('.navbar-nav');
        if (!navList) return;
        if (document.getElementById('nw7-nav-link')) return;
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.innerHTML = `<a class="nav-link" href="#news-section-root" id="nw7-nav-link">${l('navLabel')}</a>`;
        const aboutLi = [...navList.querySelectorAll('.nav-item')].find(i => i.querySelector('[data-i18n="nav_about"]'));
        if (aboutLi) navList.insertBefore(li, aboutLi);
        else navList.appendChild(li);
        li.querySelector('a').addEventListener('click', e => { e.preventDefault(); scrollToNews(); });
    }

    // ── SLIDER ────────────────────────────────────────────────────
    function goTo(idx) {
        currentSlide = (idx + NEWS.length) % NEWS.length;
        const track = document.getElementById('nw7-track');
        if (track) {
            const slide = track.children[currentSlide] || track.children[0];
            const w = slide ? slide.offsetWidth : track.offsetWidth;
            track.style.transform = 'translateX(-' + (currentSlide * w) + 'px)';
        }
        document.querySelectorAll('.nw7-dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));

        const bar = document.getElementById('nw7-pbar');
        if (bar) {
            bar.style.transition = 'none';
            bar.style.width = '0%';
            requestAnimationFrame(() => {
                bar.style.transition = `width ${AUTO_INTERVAL}ms linear`;
                bar.style.width = '100%';
            });
        }
    }

    function startAuto() {
        stopAuto();
        autoTimer = setInterval(() => goTo(currentSlide + 1), AUTO_INTERVAL);
        const bar = document.getElementById('nw7-pbar');
        if (bar) {
            bar.style.transition = 'none';
            bar.style.width = '0%';
            requestAnimationFrame(() => {
                bar.style.transition = `width ${AUTO_INTERVAL}ms linear`;
                bar.style.width = '100%';
            });
        }
    }

    function stopAuto() {
        if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    // ── RENDER SECTION ────────────────────────────────────────────
    function render() {
        const root = document.getElementById('news-section-root');
        if (!root) return;

        const slidesHTML = NEWS.map((a, i) => `
            <div class="nw7-slide" data-id="${a.id}">
                <div class="nw7-slide-img">
                    <img src="${a.img}" loading="${i === 0 ? 'eager' : 'lazy'}" alt="" onerror="this.parentElement.style.display='none'">
                    <span class="nw7-slide-tag" style="background:${a.tagColor}">${tx(a.tag)}</span>
                </div>
                <div class="nw7-slide-body">
                    <div class="nw7-slide-cat" style="color:${a.tagColor}">${tx(a.tag)}</div>
                    <div class="nw7-slide-headline">${tx(a.title)}</div>
                    <p class="nw7-slide-desc">${tx(a.desc)}</p>
                    <div class="nw7-slide-meta">
                        <span class="nw7-slide-src">${a.source}</span>
                        <span>·</span><span>${fd(a.date)}</span>
                        <span>·</span><span>${tx(a.readTime)} ${l('minread')}</span>
                    </div>
                    <span class="nw7-slide-readmore">${l('readmore')}</span>
                </div>
            </div>`).join('');

        const dotsHTML = NEWS.map((_, i) =>
            `<button class="nw7-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Slide ${i + 1}"></button>`
        ).join('');

        root.innerHTML = `
            <div class="nw7-wrap">
                <div class="nw7-header">
                    <div>
                        <span class="nw7-label">L-Corparation Journal</span>
                        <h2 class="nw7-title">${l('heading').split(' ')[0]} <span>${l('heading').split(' ').slice(1).join(' ') || 'Xe Điện'}</span></h2>
                        <p class="nw7-sub">${l('sub')}</p>
                    </div>
                </div>
                <div class="nw7-slider-outer" id="nw7-slider">
                    <div class="nw7-slider-track" id="nw7-track">${slidesHTML}</div>
                </div>
                <div class="nw7-controls">
                    <div class="nw7-dots" id="nw7-dots">${dotsHTML}</div>
                    <div class="nw7-progress"><div class="nw7-progress-bar" id="nw7-pbar"></div></div>
                    <div class="nw7-arrows">
                        <button class="nw7-arrow" id="nw7-prev" aria-label="Prev">${l('prev')}</button>
                        <button class="nw7-arrow" id="nw7-next" aria-label="Next">${l('next')}</button>
                    </div>
                </div>
            </div>`;

        root.querySelectorAll('.nw7-slide').forEach(el => {
            el.addEventListener('click', () => {
                const art = NEWS.find(a => a.id === parseInt(el.dataset.id));
                if (art) openReader(art);
            });
        });

        root.querySelectorAll('.nw7-dot').forEach(d => {
            d.addEventListener('click', () => { stopAuto(); goTo(parseInt(d.dataset.i)); startAuto(); });
        });

        document.getElementById('nw7-prev').addEventListener('click', () => { stopAuto(); goTo(currentSlide - 1); startAuto(); });
        document.getElementById('nw7-next').addEventListener('click', () => { stopAuto(); goTo(currentSlide + 1); startAuto(); });

        const slider = document.getElementById('nw7-slider');
        slider.addEventListener('mouseenter', stopAuto);
        slider.addEventListener('mouseleave', startAuto);

        let tx0 = 0;
        slider.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
        slider.addEventListener('touchend', e => {
            const diff = tx0 - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) { stopAuto(); goTo(diff > 0 ? currentSlide + 1 : currentSlide - 1); startAuto(); }
        });

        goTo(0);
        startAuto();
    }

    // ── ĐĂNG KÝ LẮNG NGHE SỰ KIỆN NGÔN NGỮ ─────────────────────
    function registerLangListener() {
        if (!window.__langListeners) window.__langListeners = [];
        window.__langListeners.push(function () {
            render();
            injectNavLink();
            if (navDropdown) updateNavDropdown();
        });
    }

    // ── INIT ──────────────────────────────────────────────────────
    function init() {
        buildReader();
        render();
        injectNavLink();
        registerLangListener();
    }
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();