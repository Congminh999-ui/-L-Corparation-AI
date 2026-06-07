/**
 * L-Corparation - Cart Component
 * Manages shopping cart state, UI, and localStorage persistence
 */

(function () {
    'use strict';

    let cart = [];

    // --- State Persistence ---
    function saveCart() {
        localStorage.setItem('l_corp_cart', JSON.stringify(cart));
        updateCartUI();
    }

    function loadCart() {
        const stored = localStorage.getItem('l_corp_cart');
        if (stored) {
            try {
                cart = JSON.parse(stored);
            } catch (e) {
                cart = [];
            }
        }
        updateCartUI();
    }

    // --- Core Logic ---
    function addToCart(itemId, quantity = 1) {
        const product = (window.accessoriesData || []).find(p => p.id === itemId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === itemId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                img: product.img,
                quantity: quantity
            });
        }

        saveCart();

        // Visual feedback on all cart badges
        const badgeIds = ['cartBadge', 'mobileCartBadge'];
        badgeIds.forEach(id => {
            const b = document.getElementById(id);
            if (b) {
                b.classList.remove('cart-badge-bump');
                void b.offsetWidth;
                b.classList.add('cart-badge-bump');
            }
        });
    }

    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        saveCart();
    }

    function updateQuantity(itemId, delta) {
        const item = cart.find(i => i.id === itemId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                removeFromCart(itemId);
            } else {
                saveCart();
            }
        }
    }

    // --- UI Rendering ---
    function updateCartUI() {
        const badgeIds = ['cartBadge', 'mobileCartBadge'];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        badgeIds.forEach(id => {
            const badge = document.getElementById(id);
            if (badge) {
                badge.textContent = totalItems;
                badge.style.display = totalItems > 0 ? 'flex' : 'none';
            }
        });

        const container = document.getElementById('cartItemsContainer');
        const footer = document.getElementById('cartFooter');
        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="cart-empty-state">
                    <i class="fas fa-shopping-basket mb-3"></i>
                    <p>Giỏ hàng của bạn đang trống</p>
                    <button class="btn btn-outline-dark btn-sm rounded-pill mt-2"
                        onclick="CartManager.close(); if(typeof scrollToAccessoriesTop === 'function') scrollToAccessoriesTop();">
                        Mua sắm ngay
                    </button>
                </div>
            `;
            if (footer) footer.style.display = 'none';
            return;
        }

        if (footer) footer.style.display = 'block';

        let html = '';
        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            html += `
                <div class="cart-item">
                    <div class="cart-item-img">
                        <img src="${item.img}" alt="${item.name}">
                    </div>
                    <div class="cart-item-info">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <div class="cart-item-price">${formatPrice(item.price)}</div>
                        <div class="cart-item-controls">
                            <div class="quantity-input">
                                <button onclick="CartManager.updateQuantity('${item.id}', -1)">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="CartManager.updateQuantity('${item.id}', 1)">+</button>
                            </div>
                            <button class="cart-item-remove" onclick="CartManager.removeItem('${item.id}')">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        const subtotalEl = document.getElementById('cartSubtotal');
        const totalEl = document.getElementById('cartTotalPrice');
        if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
        if (totalEl) totalEl.textContent = formatPrice(subtotal);
    }

    // --- Transitions ---
    function openCart() {
        const overlay = document.getElementById('cartSidebarOverlay');
        const sidebar = document.getElementById('cartSidebar');
        if (overlay && sidebar) {
            overlay.classList.add('active');
            sidebar.classList.add('active');
            document.body.classList.add('modal-open');
        }
    }

    function closeCart() {
        const overlay = document.getElementById('cartSidebarOverlay');
        const sidebar = document.getElementById('cartSidebar');
        if (overlay && sidebar) {
            overlay.classList.remove('active');
            sidebar.classList.remove('active');
            setTimeout(() => {
                document.body.classList.remove('modal-open');
            }, 300);
        }
    }

    // --- Lưu đơn hàng lên Supabase ---
    async function saveOrderToSupabase(customerInfo, paymentMethod) {
        try {
            if (!window.db) {
                console.warn('[Cart] window.db chưa sẵn sàng');
                return null;
            }

            let totalQuantity = 0;
            let subtotal = 0;
            cart.forEach(item => {
                subtotal += item.price * item.quantity;
                totalQuantity += item.quantity;
            });
            const shippingFee = totalQuantity > 5 ? 0 : totalQuantity * 30000;
            const totalAmount = subtotal + shippingFee;

            // Map payment method sang enum Supabase
            const paymentMap = {
                'momo': 'momo',
                'visa': 'bank_transfer',
                'mastercard': 'bank_transfer',
                'cod': 'cod'
            };

            // 1. Tạo order
            const { data: order, error: orderError } = await window.db
                .from('orders')
                .insert({
                    customer_name: customerInfo.name,
                    customer_phone: customerInfo.phone,
                    customer_email: customerInfo.email || null,
                    customer_address: customerInfo.address || null,
                    payment_method: paymentMap[paymentMethod] || 'bank_transfer',
                    payment_status: 'unpaid',
                    status: 'pending',
                    total_amount: totalAmount,
                    notes: customerInfo.notes || null
                })
                .select()
                .single();

            if (orderError) {
                console.error('[Cart] Lỗi tạo order:', orderError.message);
                return null;
            }

            // 2. Tạo order_items
            const items = cart.map(item => ({
                order_id: order.id,
                product_name: item.name,
                unit_price: item.price,
                quantity: item.quantity
            }));

            const { error: itemsError } = await window.db
                .from('order_items')
                .insert(items);

            if (itemsError) {
                console.error('[Cart] Lỗi tạo order_items:', itemsError.message);
            }

            return order;

        } catch (e) {
            console.error('[Cart] Lỗi saveOrderToSupabase:', e.message);
            return null;
        }
    }

    // --- Init ---
    document.addEventListener('DOMContentLoaded', () => {
        loadCart();

        const toggleBtn = document.getElementById('cartToggleBtn');
        const mobileToggleBtn = document.getElementById('mobileCartBtn');
        const closeBtn = document.getElementById('cartSidebarClose');
        const overlay = document.getElementById('cartSidebarOverlay');
        const checkoutBtn = document.getElementById('cartCheckoutBtn');

        if (toggleBtn) toggleBtn.addEventListener('click', openCart);
        if (mobileToggleBtn) mobileToggleBtn.addEventListener('click', openCart);
        if (closeBtn) closeBtn.addEventListener('click', closeCart);
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeCart();
            });
        }

        const checkoutOverlay = document.getElementById('checkoutPopupOverlay');
        const checkoutClose = document.getElementById('checkoutPopupClose');
        const confirmBtn = document.getElementById('confirmOrderBtn');

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                closeCart();
                openCheckoutModal();
            });
        }

        if (checkoutClose) {
            checkoutClose.addEventListener('click', () => {
                if (checkoutOverlay) {
                    checkoutOverlay.classList.remove('active');
                    document.body.classList.remove('modal-open');
                }
            });
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', async () => {
                // Lấy thông tin khách hàng
                const name = document.getElementById('checkoutName')?.value.trim();
                const phone = document.getElementById('checkoutPhone')?.value.trim();
                const email = document.getElementById('checkoutEmail')?.value.trim();
                const address = document.getElementById('checkoutAddress')?.value.trim();
                const notes = document.getElementById('checkoutNotes')?.value.trim();

                if (!name || !phone) {
                    alert('Vui lòng nhập họ tên và số điện thoại!');
                    return;
                }

                const method = document.querySelector('input[name="checkoutPayment"]:checked')?.value;
                if (!method) {
                    alert('Vui lòng chọn phương thức thanh toán!');
                    return;
                }

                // Disable nút tránh bấm 2 lần
                confirmBtn.disabled = true;
                confirmBtn.textContent = 'Đang xử lý...';

                const order = await saveOrderToSupabase(
                    { name, phone, email, address, notes },
                    method
                );

                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Xác nhận đặt hàng';

                if (order) {
                    const orderCode = order.order_code || `#${order.id}`;
                    alert(`✅ Đặt hàng thành công!\nMã đơn: ${orderCode}\nChúng tôi sẽ sớm liên hệ xác nhận.`);
                } else {
                    alert('⚠️ Đặt hàng thành công!\nChúng tôi sẽ sớm liên hệ xác nhận.');
                }

                cart = [];
                saveCart();
                if (checkoutOverlay) checkoutOverlay.classList.remove('active');
                document.body.classList.remove('modal-open');
            });
        }
    });

    function openCheckoutModal() {
        const overlay = document.getElementById('checkoutPopupOverlay');
        if (!overlay) return;
        overlay.classList.add('active');
        document.body.classList.add('modal-open');
        renderCheckout();
    }

    function renderCheckout() {
        const listContainer = document.getElementById('checkoutItemsList');
        if (!listContainer) return;

        let html = '';
        let subtotal = 0;
        let totalQuantity = 0;

        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            totalQuantity += item.quantity;
            html += `
                <div class="checkout-item-row">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="item-details">
                        <h6>${item.name}</h6>
                        <span>Số lượng: ${item.quantity}</span>
                    </div>
                    <div class="item-price-col">
                        ${formatPrice(item.price * item.quantity)}
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html;

        const shippingFee = totalQuantity > 5 ? 0 : totalQuantity * 30000;
        const total = subtotal + shippingFee;

        document.getElementById('checkoutSubtotal').textContent = formatPrice(subtotal);
        document.getElementById('checkoutShipping').textContent = shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee);
        document.getElementById('checkoutTotal').textContent = formatPrice(total);

        const note = document.getElementById('freeShippingNote');
        if (note) note.style.display = totalQuantity > 5 ? 'none' : 'flex';
    }

    // Public API
    window.CartManager = {
        add: addToCart,
        removeItem: removeFromCart,
        updateQuantity: updateQuantity,
        open: openCart,
        close: closeCart
    };

    window.addToCart = addToCart;

})();