/**
 * L-Corparation - Credit Manager
 * Handles user credits, payments, and bank API integration (VietQR)
 */

(function () {
    'use strict';

    const CONVERSION_RATE = 10000; // 10,000 VND = 1 Credit
    const BANK_ID = 'tpbank'; // As per the QR icon
    const ACCOUNT_NO = '86581988888'; // From the provided image
    const ACCOUNT_NAME = 'NGUYEN MINH TUAN';

    // --- State ---
    let userCredits = 0;

    function saveCredits(credits) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            user.credits = credits;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Sync with registeredUsers
            let registered = JSON.parse(localStorage.getItem('registeredUsers')) || [];
            const idx = registered.findIndex(u => u.email === user.email);
            if (idx > -1) {
                registered[idx].credits = credits;
                localStorage.setItem('registeredUsers', JSON.stringify(registered));
            }
        }
        updateCreditUI();
    }

    function loadCredits() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            userCredits = user.credits || 0;
        } else {
            userCredits = 0;
        }
        updateCreditUI();
    }

    // --- UI Update ---
    function updateCreditUI() {
        const creditDisplays = document.querySelectorAll('.user-credit-balance');
        creditDisplays.forEach(el => {
            el.textContent = userCredits.toLocaleString() + ' Credits';
        });
    }

    // --- QR Generation (VietQR API) ---
    function generateQR(amount) {
        const description = `NAP CREDIT ${JSON.parse(localStorage.getItem('currentUser'))?.username || 'USER'}`;
        // VietQR API endpoint: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
        return `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;
    }

    // --- Core Logic ---
    function openTopUpModal() {
        const overlay = document.getElementById('creditTopUpOverlay');
        if (!overlay) return;

        overlay.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Reset modal state
        document.getElementById('qrContainer').style.display = 'none';
        document.getElementById('topUpStep1').style.display = 'block';
        document.getElementById('topUpAmount').value = '';
    }

    function closeTopUpModal() {
        const overlay = document.getElementById('creditTopUpOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }

    // --- Init ---
    document.addEventListener('DOMContentLoaded', () => {
        loadCredits();

        const topUpBtn = document.getElementById('topUpCreditsBtn');
        const overlay = document.getElementById('creditTopUpOverlay');
        const closeBtn = document.getElementById('creditTopUpClose');
        const generateBtn = document.getElementById('generateQRBtn');

        if (topUpBtn) topUpBtn.addEventListener('click', openTopUpModal);
        
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeTopUpModal();
            });
        }
        
        if (closeBtn) closeBtn.addEventListener('click', closeTopUpModal);

        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                const amountInput = document.getElementById('topUpAmount');
                const amount = parseInt(amountInput.value);
                
                if (!amount || amount < 10000) {
                    alert('Vui lòng nhập số tiền nạp tối thiểu 10,000đ');
                    return;
                }

                const qrUrl = generateQR(amount);
                const qrImg = document.getElementById('topUpQRImg');
                const creditsToReceive = Math.floor(amount / CONVERSION_RATE);
                
                document.getElementById('creditsLabel').textContent = creditsToReceive;
                qrImg.src = qrUrl;
                
                document.getElementById('topUpStep1').style.display = 'none';
                document.getElementById('qrContainer').style.display = 'block';
            });
        }

    });

    // --- Global Export ---
    window.CreditManager = {
        openTopUp: openTopUpModal,
        closeTopUp: closeTopUpModal,
        addCredits: (amount) => {
            userCredits += amount;
            saveCredits(userCredits);
        },
        getCredits: () => userCredits
    };

})();
