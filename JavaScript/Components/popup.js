/**
 * L-Corparation — Popup Manager
 * Popup 1: Promo Banner — auto-shows on page load
 * Popup 2: Consultation Form — opens from navbar button, with vehicle selector
 * Popup 3: Order / Deposit Form
 * Popup 4: Login / Register / Profile (Supabase Auth)
 */

(function () {
    'use strict';

    const PROMO_DELAY_MS = 1500;

    // ============================================================
    // GENERIC OPEN / CLOSE HELPERS
    // ============================================================
    function openPopup(overlay) {
        if (!overlay) return;
        overlay.classList.add('active');
        document.body.classList.add('modal-open');
        overlay.querySelectorAll('.lazy-load').forEach(img => {
            if (typeof loadImage === 'function') loadImage(img);
        });
    }

    function closePopup(overlay) {
        if (!overlay) return;
        overlay.classList.remove('active');
        overlay.classList.add('closing');
        document.body.classList.remove('modal-open');
        setTimeout(() => overlay.classList.remove('closing'), 400);
    }

    function setupPopupClose(overlay, closeBtn) {
        if (closeBtn) {
            closeBtn.addEventListener('click', e => { e.preventDefault(); closePopup(overlay); });
        }
        overlay.addEventListener('click', e => { if (e.target === overlay) closePopup(overlay); });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) closePopup(overlay);
        });
    }

    // ============================================================
    // VEHICLE SELECTOR (shared giữa Consult & Order popup)
    // ============================================================
    function getAllVehicles() {
        const cars = typeof carData !== 'undefined' ? carData : [];
        const scooters = typeof scooterData !== 'undefined' ? scooterData : [];
        return [...cars, ...scooters];
    }

    function initVehicleSelect(selectId, popupId, imgId) {
        const selectEl = document.getElementById(selectId);
        const popupEl = document.getElementById(popupId);
        const imgEl = document.getElementById(imgId);
        if (!selectEl || !popupEl) return;

        const cars = typeof carData !== 'undefined' ? carData : [];
        const scooters = typeof scooterData !== 'undefined' ? scooterData : [];

        selectEl.innerHTML = '<option value="" disabled selected>Chọn mẫu xe...</option>';
        popupEl.classList.remove('has-vehicle');

        const addGroup = (label, vehicles) => {
            if (!vehicles.length) return;
            const group = document.createElement('optgroup');
            group.label = label;
            vehicles.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v.id;
                opt.textContent = v.name;
                group.appendChild(opt);
            });
            selectEl.appendChild(group);
        };
        addGroup('Xe Ô tô (Cars)', cars);
        addGroup('Xe máy điện (Scooters)', scooters);
        selectEl.value = '';

        selectEl.addEventListener('change', e => {
            const all = [...cars, ...scooters];
            const vehicle = all.find(v => v.id === e.target.value);
            if (vehicle) {
                popupEl.classList.add('has-vehicle');
                if (imgEl) updatePreviewImage(imgId, vehicle.img);
            } else {
                popupEl.classList.remove('has-vehicle');
            }
        });
    }

    function updatePreviewImage(imgId, imgSrc) {
        const img = document.getElementById(imgId);
        if (!img) return;
        img.style.opacity = '0';
        img.style.transform = 'scale(0.96) translateX(15px)';
        setTimeout(() => {
            img.src = imgSrc;
            setTimeout(() => {
                img.style.transform = 'scale(1) translateX(0)';
                img.style.opacity = '1';
            }, 50);
        }, 300);
    }

    // ============================================================
    // ADMIN ROLE CHECK — dùng Supabase (server-side kiểm tra role)
    // ============================================================
    async function checkAdminRole() {
        try {
            if (typeof window.AuthAPI === 'undefined') return false;
            const user = await window.AuthAPI.getUser();
            if (!user) return false;
            const profile = await window.AuthAPI.getProfile();
            return profile?.role === 'admin';
        } catch (e) {
            console.warn('[Auth] Không thể kiểm tra quyền admin:', e.message);
            return false;
        }
    }

    // Hiển thị nút vào trang Admin nếu user là admin
    function renderAdminBtn(isAdmin) {
        const existing = document.getElementById('profileAdminBtn');
        if (existing) existing.remove();
        if (!isAdmin) return;

        const logoutBtn = document.getElementById('logoutBtn');
        if (!logoutBtn) return;

        const btn = document.createElement('a');
        btn.id = 'profileAdminBtn';
        btn.href = '../Pages/Admin.html';
        btn.innerHTML = '<i class="fas fa-shield-alt me-2"></i>Trang Admin';
        btn.style.cssText = `
            display: flex; align-items: center; justify-content: center; gap: 6px;
            width: 100%; padding: 10px 16px; margin-bottom: 10px;
            background: #00c896; color: #fff; border-radius: 8px;
            font-weight: 600; font-size: 0.9rem; text-decoration: none;
            transition: background 0.2s;
        `;
        btn.addEventListener('mouseenter', () => btn.style.background = '#009e78');
        btn.addEventListener('mouseleave', () => btn.style.background = '#00c896');
        logoutBtn.parentNode.insertBefore(btn, logoutBtn);
    }

    // ============================================================
    // NAVBAR — cập nhật hiển thị user sau khi login / logout
    // ============================================================
    function updateNavbarUser(user) {
        const loginToggleBtn = document.getElementById('loginToggleBtn');
        if (!loginToggleBtn) return;
        if (user) {
            const name = user.user_metadata?.full_name || user.email || 'User';
            const avatarSrc = user.user_metadata?.avatar_url;
            const avatarHtml = avatarSrc
                ? `<img src="${avatarSrc}" class="navbar-avatar" alt="avatar">`
                : '<i class="fas fa-user-check text-success me-2"></i>';
            loginToggleBtn.innerHTML = `${avatarHtml}<span class="navbar-user-name text-success">${name}</span>`;
        } else {
            loginToggleBtn.innerHTML = '<i class="fas fa-user"></i>';
        }
    }

    // ============================================================
    // SESSION CACHE — fetch 1 lần khi trang load, dùng lại khi click
    // ============================================================
    let _cachedUser = null;
    let _cachedIsAdmin = null;

    // ============================================================
    // MAIN INIT
    // ============================================================
    document.addEventListener('DOMContentLoaded', () => {

        // ── Popup 1: Promo Banner (auto-show) ──────────────────
        const promoOverlay = document.getElementById('promoPopupOverlay');
        const promoClose = document.getElementById('promoPopupClose');
        if (promoOverlay) {
            setupPopupClose(promoOverlay, promoClose);
            setTimeout(() => openPopup(promoOverlay), PROMO_DELAY_MS);
        }

        // ── Popup 2: Consultation Form ─────────────────────────
        const consultOverlay = document.getElementById('consultPopupOverlay');
        const consultPopup = document.getElementById('consultPopup');
        const consultClose = document.getElementById('consultPopupClose');
        const navConsultBtn = document.getElementById('navConsultBtn');

        if (consultOverlay) {
            setupPopupClose(consultOverlay, consultClose);
            initVehicleSelect('consultVehicleSelect', 'consultPopup', 'consultVehicleImg');

            if (navConsultBtn) {
                navConsultBtn.addEventListener('click', e => {
                    e.preventDefault();
                    consultPopup?.classList.remove('has-vehicle');
                    const sel = document.getElementById('consultVehicleSelect');
                    if (sel) sel.value = '';
                    const img = document.getElementById('consultVehicleImg');
                    if (img) { img.src = ''; img.style.opacity = '0'; }
                    openPopup(consultOverlay);
                });
            }

            const consultForm = document.getElementById('consultForm');
            if (consultForm) {
                consultForm.addEventListener('submit', e => {
                    e.preventDefault();
                    const sel = document.getElementById('consultVehicleSelect');
                    const vehicleName = sel ? sel.options[sel.selectedIndex]?.text : '';
                    const msg = typeof t === 'function'
                        ? (t('popup_success') || 'Đăng ký thành công!')
                        : 'Đăng ký thành công! Chúng tôi sẽ liên hệ bạn sớm.';
                    alert(`${msg}${vehicleName ? `\nMẫu xe: ${vehicleName}` : ''}`);
                    consultForm.reset();
                    consultPopup?.classList.remove('has-vehicle');
                    closePopup(consultOverlay);
                });
            }
        }

        // ── Popup 3: Order / Deposit Form ─────────────────────
        const orderOverlay = document.getElementById('orderPopupOverlay');
        const orderPopup = document.getElementById('orderPopup');
        const orderClose = document.getElementById('orderPopupClose');
        const orderBtn = document.querySelector('.hero-btn-primary');
        const preOrderBtn = document.getElementById('modalPreOrderBtn');

        if (orderOverlay) {
            setupPopupClose(orderOverlay, orderClose);
            initVehicleSelect('orderVehicleSelect', 'orderPopup', 'orderVehicleImg');

            const openOrder = e => {
                e.preventDefault();
                orderPopup?.classList.remove('has-vehicle');
                const sel = document.getElementById('orderVehicleSelect');
                if (sel) sel.value = '';
                const img = document.getElementById('orderVehicleImg');
                if (img) { img.src = ''; img.style.opacity = '0'; }
                openPopup(orderOverlay);
            };

            if (orderBtn) orderBtn.addEventListener('click', openOrder);
            if (preOrderBtn) {
                preOrderBtn.addEventListener('click', e => {
                    e.preventDefault();
                    const vid = preOrderBtn.getAttribute('data-vehicle-id');
                    if (vid && typeof window.openOrderWithVehicle === 'function') {
                        window.openOrderWithVehicle(vid);
                    } else {
                        openOrder(e);
                    }
                });
            }

            const orderForm = document.getElementById('orderForm');
            if (orderForm) {
                orderForm.addEventListener('submit', e => {
                    e.preventDefault();
                    const sel = document.getElementById('orderVehicleSelect');
                    const vehicleName = sel ? sel.options[sel.selectedIndex]?.text : '';
                    const orderNameEl = document.getElementById('orderName');
                    alert(`Đặt cọc thành công!\nQuý khách: ${orderNameEl ? orderNameEl.value : ''}\nMẫu xe: ${vehicleName}`);
                    orderForm.reset();
                    orderPopup?.classList.remove('has-vehicle');
                    closePopup(orderOverlay);
                });
            }
        }

        // ── Popup 4: Auth (Login / Register / Profile) ─────────
        const loginOverlay = document.getElementById('loginPopupOverlay');
        const loginClose = document.getElementById('loginPopupClose');
        const loginToggleBtn = document.getElementById('loginToggleBtn');
        const loginFormState = document.getElementById('loginFormState');
        const registerFormState = document.getElementById('registerFormState');
        const loginSuccessState = document.getElementById('loginSuccessState');
        const showRegisterBtn = document.getElementById('showRegisterBtn');
        const showLoginBtn = document.getElementById('showLoginBtn');
        const togglePassword = document.getElementById('togglePassword');
        const logoutBtn = document.getElementById('logoutBtn');

        if (!loginOverlay) return;
        setupPopupClose(loginOverlay, loginClose);

        // Toggle hiện/ẩn mật khẩu
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const passInput = document.getElementById('loginPassword');
                const isText = passInput.getAttribute('type') === 'text';
                passInput.setAttribute('type', isText ? 'password' : 'text');
                togglePassword.classList.toggle('fa-eye', isText);
                togglePassword.classList.toggle('fa-eye-slash', !isText);
            });
        }

        // Chuyển giữa Login ↔ Register
        if (showRegisterBtn) showRegisterBtn.addEventListener('click', () => {
            loginFormState.style.display = 'none';
            registerFormState.style.display = 'block';
        });
        if (showLoginBtn) showLoginBtn.addEventListener('click', () => {
            registerFormState.style.display = 'none';
            loginFormState.style.display = 'block';
        });

        // Tab Profile
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const isInfo = tab.dataset.tab === 'info';
                document.getElementById('tabContentInfo')?.classList.toggle('d-none', !isInfo);
                document.getElementById('tabContentSecurity')?.classList.toggle('d-none', isInfo);
            });
        });

        // ── Fetch session 1 lần khi trang load, cache lại dùng sau ──
        (async () => {
            try {
                _cachedUser = await window.AuthAPI?.getUser();
                if (_cachedUser) {
                    updateNavbarUser(_cachedUser);
                    _cachedIsAdmin = await checkAdminRole();
                }
            } catch (_) { /* không có session */ }
        })();

        // ── Mở popup — dùng cache, hiện ngay không chờ ──────────
        if (loginToggleBtn) {
            loginToggleBtn.addEventListener('click', async e => {
                e.preventDefault();

                if (_cachedUser) {
                    loginFormState.style.display = 'none';
                    registerFormState.style.display = 'none';
                    loginSuccessState.style.display = 'block';
                    openPopup(loginOverlay);
                    await populateProfile(_cachedUser);
                    renderAdminBtn(_cachedIsAdmin);
                } else {
                    loginSuccessState.style.display = 'none';
                    registerFormState.style.display = 'none';
                    loginFormState.style.display = 'block';
                    openPopup(loginOverlay);
                }
            });
        }

        async function populateProfile(user) {
            try {
                const profile = await window.AuthAPI?.getProfile();
                const name = profile?.full_name || user.user_metadata?.full_name || user.email;
                const email = user.email;
                const avatar = profile?.avatar_url || user.user_metadata?.avatar_url;

                const nameEl = document.getElementById('profileNameDisplay');
                if (nameEl) nameEl.textContent = name;

                const emailEl = document.getElementById('profileEmailDisplay');
                if (emailEl) emailEl.textContent = email;

                const avatarImg = document.getElementById('profileAvatar');
                if (avatarImg && avatar) avatarImg.src = avatar;

                const profName = document.getElementById('profName');
                if (profName) profName.setAttribute('value', profile?.full_name || '');

                const profEmail = document.getElementById('profEmail');
                if (profEmail) profEmail.setAttribute('value', email);

                const profDOB = document.getElementById('profDOB');
                if (profDOB) profDOB.setAttribute('value', profile?.dob || '');

                const profCCCD = document.getElementById('profCCCD');
                if (profCCCD) profCCCD.setAttribute('value', profile?.cccd || '');

                const profAddress = document.getElementById('profAddress');
                if (profAddress) profAddress.value = profile?.address || '';

            } catch (e) {
                console.warn('[Profile] Lỗi điền thông tin:', e.message);
            }
        }

        // Thay đổi avatar
        const avatarInput = document.getElementById('changeAvatar');
        if (avatarInput) {
            avatarInput.addEventListener('change', async e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async evt => {
                    const avatarImg = document.getElementById('profileAvatar');
                    if (avatarImg) avatarImg.src = evt.target.result;
                    await window.AuthAPI?.updateProfile({ avatar_url: evt.target.result });
                };
                reader.readAsDataURL(file);
            });
        }

        // Cập nhật thông tin cá nhân
        const profileInfoForm = document.getElementById('profileInfoForm');
        if (profileInfoForm) {
            profileInfoForm.addEventListener('submit', async e => {
                e.preventDefault();
                const payload = {
                    full_name: document.getElementById('profName')?.value,
                    dob: document.getElementById('profDOB')?.value,
                    cccd: document.getElementById('profCCCD')?.value,
                    address: document.getElementById('profAddress')?.value,
                };
                const result = await window.AuthAPI?.updateProfile(payload);
                if (result) {
                    alert('Cập nhật thông tin thành công!');
                    const nameEl = document.getElementById('profileNameDisplay');
                    if (nameEl) nameEl.textContent = payload.full_name;
                    // Cập nhật cache
                    if (_cachedUser) _cachedUser.user_metadata.full_name = payload.full_name;
                } else {
                    alert('Cập nhật thất bại, vui lòng thử lại.');
                }
            });
        }

        // Đổi mật khẩu
        const profileSecurityForm = document.getElementById('profileSecurityForm');
        if (profileSecurityForm) {
            profileSecurityForm.addEventListener('submit', async e => {
                e.preventDefault();
                const newPass = document.getElementById('profNewPass')?.value;
                if (!newPass) { alert('Vui lòng nhập mật khẩu mới.'); return; }
                try {
                    const { error } = await window.db.auth.updateUser({ password: newPass });
                    if (error) throw error;
                    alert('Đã đổi mật khẩu thành công!');
                    const profNewPass = document.getElementById('profNewPass');
                    if (profNewPass) profNewPass.value = '';
                } catch (err) {
                    alert('Đổi mật khẩu thất bại: ' + err.message);
                }
            });
        }

        // ── ĐĂNG NHẬP (Supabase Auth) ──────────────────────────
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async e => {
                e.preventDefault();
                const email = document.getElementById('loginEmail')?.value.trim();
                const password = document.getElementById('loginPassword')?.value;
                const submitBtn = loginForm.querySelector('[type="submit"]');

                if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang đăng nhập...'; }

                try {
                    const result = await window.AuthAPI.login(email, password);
                    if (!result) throw new Error('Email hoặc mật khẩu không đúng.');
                    location.reload();
                } catch (err) {
                    alert('Đăng nhập thất bại: ' + (err.message || 'Sai email hoặc mật khẩu.'));
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Đăng nhập'; }
                }
            });
        }

        // ── ĐĂNG KÝ (Supabase Auth) ────────────────────────────
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async e => {
                e.preventDefault();
                const username = document.getElementById('regUsername')?.value.trim();
                const email = document.getElementById('regEmail')?.value.trim();
                const password = document.getElementById('regPassword')?.value;
                const submitBtn = registerForm.querySelector('[type="submit"]');

                if (!username || !email || !password) {
                    alert('Vui lòng điền đầy đủ thông tin!');
                    return;
                }
                if (password.length < 6) {
                    alert('Mật khẩu phải có ít nhất 6 ký tự!');
                    return;
                }

                if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang đăng ký...'; }

                try {
                    const result = await window.AuthAPI.register(email, password, username);
                    if (!result) throw new Error('Đăng ký thất bại.');
                    alert('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.');
                    registerForm.reset();
                    showLoginBtn?.click();
                } catch (err) {
                    alert('Đăng ký thất bại: ' + (err.message || 'Vui lòng thử lại.'));
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Đăng ký'; }
                }
            });
        }

        // ── ĐĂNG XUẤT ──────────────────────────────────────────
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await window.AuthAPI?.logout();
                _cachedUser = null;
                _cachedIsAdmin = null;
                updateNavbarUser(null);
                closePopup(loginOverlay);
                location.reload();
            });
        }
    });

    // ============================================================
    // GLOBAL: Mở Order popup với xe được chọn sẵn
    // ============================================================
    window.openOrderWithVehicle = vehicleId => {
        const orderOverlay = document.getElementById('orderPopupOverlay');
        const orderPopup = document.getElementById('orderPopup');
        const orderSelect = document.getElementById('orderVehicleSelect');

        if (!orderOverlay || !orderSelect) return;

        orderSelect.value = vehicleId;
        const vehicle = getAllVehicles().find(v => v.id === vehicleId);
        if (vehicle) {
            orderPopup?.classList.add('has-vehicle');
            updatePreviewImage('orderVehicleImg', vehicle.img);
        } else {
            orderPopup?.classList.remove('has-vehicle');
        }
        openPopup(orderOverlay);
    };

})();