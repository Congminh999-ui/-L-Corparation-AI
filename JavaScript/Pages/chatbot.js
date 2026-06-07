/**
 * L-Corparation — AI Chatbot v4.1
 * UI nâng cấp: thân thiện hơn, hiệu ứng mượt hơn
 * Logic giữ nguyên hoàn toàn từ v4.0
 *
 * CSS: ../Css/chatbot.css  ← cần thêm <link> vào index.html
 */

(function () {
    'use strict';

    // ============================================================
    // CONFIG
    // ============================================================
    const SERVER_URL = 'https://l-corparation-ai.onrender.com/chat';
    const STORAGE_KEY = 'lcbot_history_v1';
    const MAX_STORED = 30;

    const SESSION_ID = (() => {
        const key = 'lcbot_sid';
        let sid = sessionStorage.getItem(key);
        if (!sid) {
            sid = (crypto.randomUUID?.() || Math.random().toString(36).slice(2)) + Date.now();
            sessionStorage.setItem(key, sid);
        }
        return sid;
    })();

    const lang = () => (typeof window.currentLang !== 'undefined' ? window.currentLang : 'vi');
    const tx = obj => obj[lang()] || obj.vi || '';

    const WELCOME = {
        vi: '👋 Xin chào! Tôi là **L-Bot**, trợ lý tư vấn xe điện của L-Corparation.\n\nTôi có thể giúp bạn về:\n• 🚗 Ô tô điện VinFast\n• 🛵 Xe máy điện\n• ⚡ Trạm sạc V-Green\n• 💰 Giá & ưu đãi\n• 🔧 Bảo hành & trả góp\n\nBạn cần tư vấn gì?',
        en: '👋 Hello! I\'m **L-Bot**, L-Corparation\'s EV advisor.\n\nI can help with:\n• 🚗 VinFast electric cars\n• 🛵 Electric scooters\n• ⚡ V-Green charging\n• 💰 Prices & deals\n• 🔧 Warranty & financing\n\nHow can I help?'
    };
    const WELCOME_QUICK = {
        vi: ['🚗 Ô tô điện', '🛵 Xe máy điện', '💰 Bảng giá', '⚡ Trạm sạc'],
        en: ['🚗 Electric cars', '🛵 E-Scooters', '💰 Prices', '⚡ Charging']
    };
    const ERR_MSG = {
        vi: '⚠️ Không kết nối được đến máy chủ. Vui lòng thử lại hoặc gọi **1800-1234**!',
        en: '⚠️ Unable to reach server. Please try again or call **1800-1234**!'
    };
    const DEFAULT_QUICK = {
        vi: ['🚗 Xem ô tô điện', '🛵 Xe máy điện', '💰 Bảng giá', '📞 Liên hệ'],
        en: ['🚗 Electric cars', '🛵 E-Scooters', '💰 Price list', '📞 Contact']
    };

    // ============================================================
    // DOM
    // ============================================================
    function buildWidget() {
        if (document.getElementById('lcb-toggle')) return;

        const btn = document.createElement('button');
        btn.id = 'lcb-toggle';
        btn.setAttribute('aria-label', 'Mở chat');
        btn.innerHTML = `<span id="lcb-icon"><i class="fas fa-leaf"></i></span><span id="lcb-badge">1</span>`;
        document.body.appendChild(btn);

        const win = document.createElement('div');
        win.id = 'lcb-window';
        win.setAttribute('role', 'dialog');
        win.setAttribute('aria-label', 'L-Bot Chat');
        win.innerHTML = `
            <div class="lcb-header">
                <div class="lcb-avatar"><i class="fas fa-leaf"></i></div>
                <div>
                    <div class="lcb-header-name">L-CORPARATION</div>
                    <div class="lcb-header-status"><span class="lcb-dot-pulse"></span>Đang hoạt động</div>
                </div>
                <div class="lcb-header-actions">
                    <button class="lcb-icon-btn" id="lcb-clear" title="Xoá lịch sử" aria-label="Xoá lịch sử">🗑</button>
                    <button class="lcb-icon-btn" id="lcb-close" aria-label="Đóng">✕</button>
                </div>
            </div>
            <div class="lcb-messages" id="lcb-messages"></div>
            <div class="lcb-quick" id="lcb-quick"></div>
            <div class="lcb-input-area">
                <button class="lcb-emoji-btn" id="lcb-emoji" title="Emoji" aria-label="Emoji">😊</button>
                <textarea class="lcb-input" id="lcb-input" placeholder="Nhập câu hỏi..." rows="1"></textarea>
                <button class="lcb-send" id="lcb-send" aria-label="Gửi">➤</button>
            </div>
            <div class="lcb-footer">L-Corparation AI Assistant 🌿</div>`;
        document.body.appendChild(win);
    }

    // ============================================================
    // LOCAL STORAGE
    // ============================================================
    function saveHistory(role, text) {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            stored.push({ role, text, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) });
            if (stored.length > MAX_STORED) stored.splice(0, stored.length - MAX_STORED);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        } catch { }
    }

    function loadHistory() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
        catch { return []; }
    }

    function clearHistory() { localStorage.removeItem(STORAGE_KEY); }

    // ============================================================
    // RENDER HELPERS
    // ============================================================
    const getTime = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const scrollBot = () => { const c = $('lcb-messages'); if (c) c.scrollTop = c.scrollHeight; };
    const $ = id => document.getElementById(id);

    function renderMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    function appendMessage(role, text, time) {
        const container = $('lcb-messages');
        if (!container) return null;

        const html = renderMarkdown(text);
        const t = time || getTime();

        const wrap = document.createElement('div');
        wrap.className = `lcb-msg ${role}`;

        wrap.innerHTML = role === 'bot'
            ? `<div class="lcb-msg-avatar"><i class="fas fa-leaf"></i></div>
               <div><div class="lcb-bubble">${html}</div><span class="lcb-time">${t}</span></div>`
            : `<div><div class="lcb-bubble">${html}</div><span class="lcb-time">${t}</span></div>`;

        container.appendChild(wrap);
        scrollBot();
        return wrap;
    }

    function createStreamBubble() {
        const container = $('lcb-messages');
        if (!container) return null;

        const wrap = document.createElement('div');
        wrap.className = 'lcb-msg bot';
        wrap.innerHTML = `<div class="lcb-msg-avatar"><i class="fas fa-leaf"></i></div>
            <div><div class="lcb-bubble lcb-cursor"></div><span class="lcb-time">${getTime()}</span></div>`;
        container.appendChild(wrap);
        scrollBot();
        return wrap.querySelector('.lcb-bubble');
    }

    function showTyping() {
        const c = $('lcb-messages');
        if (!c || $('lcb-typing')) return;
        const w = document.createElement('div');
        w.className = 'lcb-msg bot lcb-typing'; w.id = 'lcb-typing';
        w.innerHTML = `<div class="lcb-msg-avatar"><i class="fas fa-leaf"></i></div>
                       <div class="lcb-bubble"><span class="lcb-tdot"></span><span class="lcb-tdot"></span><span class="lcb-tdot"></span></div>`;
        c.appendChild(w); scrollBot();
    }
    function hideTyping() { const el = $('lcb-typing'); if (el) el.remove(); }

    function showQuickReplies(list) {
        const c = $('lcb-quick');
        if (!c) return;
        c.innerHTML = '';
        (list || []).forEach(r => {
            if (!r) return;
            const b = document.createElement('button');
            b.className = 'lcb-qbtn'; b.textContent = r;
            b.addEventListener('click', () => { c.innerHTML = ''; sendMessage(r); });
            c.appendChild(b);
        });
    }

    // ============================================================
    // SEND MESSAGE
    // ============================================================
    let isBusy = false;

    async function sendMessage(text) {
        if (!text?.trim() || isBusy) return;
        const msg = text.trim();

        const input = $('lcb-input');
        if (input) { input.value = ''; autoResize(input); }
        updateSendBtn();
        const quick = $('lcb-quick');
        if (quick) quick.innerHTML = '';

        appendMessage('user', msg);
        saveHistory('user', msg);

        isBusy = true;
        showTyping();

        try {
            const res = await fetch(SERVER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, sessionId: SESSION_ID })
            });

            hideTyping();

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const bubble = createStreamBubble();
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const json = JSON.parse(line.slice(6));

                        if (json.error) {
                            if (bubble) { bubble.classList.remove('lcb-cursor'); bubble.innerHTML = renderMarkdown(json.reply); }
                            showQuickReplies(tx(DEFAULT_QUICK));
                            isBusy = false;
                            return;
                        }

                        if (json.delta && bubble) {
                            fullText += json.delta;
                            bubble.innerHTML = renderMarkdown(fullText);
                            scrollBot();
                        }

                        if (json.done) {
                            if (bubble) bubble.classList.remove('lcb-cursor');
                            saveHistory('bot', fullText);
                            showQuickReplies(tx(DEFAULT_QUICK));
                        }
                    } catch { }
                }
            }

        } catch (err) {
            hideTyping();
            appendMessage('bot', tx(ERR_MSG));
            showQuickReplies(tx(DEFAULT_QUICK));
        }

        isBusy = false;
    }

    // ============================================================
    // HELPERS
    // ============================================================
    function autoResize(el) {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 80) + 'px';
    }

    function updateSendBtn() {
        const input = $('lcb-input');
        const btn = $('lcb-send');
        if (input && btn) btn.classList.toggle('active', input.value.trim().length > 0);
    }

    // ============================================================
    // OPEN / CLOSE
    // ============================================================
    let isOpen = false;

    function openChat() {
        const win = $('lcb-window');
        const fab = $('lcb-toggle');
        if (win) win.classList.add('open');
        if (fab) fab.classList.add('is-open');
        $('lcb-icon').innerHTML = '✕';
        $('lcb-badge')?.classList.remove('show');
        isOpen = true;

        const msgs = $('lcb-messages');
        if (msgs && msgs.children.length === 0) {
            const history = loadHistory();
            if (history.length > 0) {
                const banner = document.createElement('div');
                banner.className = 'lcb-history-banner';
                banner.textContent = '💬 Lịch sử cuộc trò chuyện trước';
                msgs.appendChild(banner);
                history.forEach(({ role, text, time }) => appendMessage(role, text, time));
            }

            setTimeout(() => {
                appendMessage('bot', tx(WELCOME));
                showQuickReplies(tx(WELCOME_QUICK));
            }, history.length > 0 ? 0 : 300);
        }

        setTimeout(() => $('lcb-input')?.focus(), 350);
    }

    function closeChat() {
        $('lcb-window')?.classList.remove('open');
        const fab = $('lcb-toggle');
        if (fab) fab.classList.remove('is-open');
        $('lcb-icon').innerHTML = '<i class="fas fa-leaf"></i>';
        isOpen = false;
    }

    function confirmClearHistory() {
        if (!confirm('Xoá toàn bộ lịch sử chat?')) return;
        clearHistory();
        const msgs = $('lcb-messages');
        if (msgs) msgs.innerHTML = '';
        appendMessage('bot', '🗑 Lịch sử đã được xoá.');
        setTimeout(() => showQuickReplies(tx(WELCOME_QUICK)), 300);
    }

    // ============================================================
    // EVENTS
    // ============================================================
    function bindEvents() {
        $('lcb-toggle')?.addEventListener('click', () => isOpen ? closeChat() : openChat());
        $('lcb-close')?.addEventListener('click', closeChat);
        $('lcb-clear')?.addEventListener('click', confirmClearHistory);

        $('lcb-emoji')?.addEventListener('click', () => {
            const input = $('lcb-input');
            if (input) { input.focus(); }
        });

        const input = $('lcb-input');
        if (input) {
            input.addEventListener('input', () => { autoResize(input); updateSendBtn(); });
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }
            });
        }
        $('lcb-send')?.addEventListener('click', () => sendMessage($('lcb-input')?.value));
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closeChat(); });
    }

    // ============================================================
    // INIT
    // ============================================================
    function init() {
        buildWidget();
        bindEvents();
        setTimeout(() => {
            if (!isOpen) $('lcb-badge')?.classList.add('show');
        }, 3000);
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();

    window.LChatbot = { open: openChat, close: closeChat, clearHistory };
})();