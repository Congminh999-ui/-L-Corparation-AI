/**
 * admin-chatbot-router.js
 * Phân loại intent từ câu hỏi → gọi đúng module
 * v2.0 — Gọi qua server Render, không dùng API key trực tiếp
 */

window.ChatRouter = {

    // ── Config ──────────────────────────────────────────────
    _SERVER: 'https://l-corparation-ai.onrender.com',
    _TOKEN: 'admin-lcorp-2024', // TODO: ADD_API_KEY — sẽ ẩn sau

    // ── Session ID ──────────────────────────────────────────
    _getSessionId() {
        const key = 'acbot_admin_sid';
        let sid = sessionStorage.getItem(key);
        if (!sid) {
            sid = (crypto.randomUUID?.() || Math.random().toString(36).slice(2)) + Date.now();
            sessionStorage.setItem(key, sid);
        }
        return sid;
    },

    // ── Patterns: intent → module ───────────────────────────
    _patterns: [
        {
            regex: /thuế|doanh\s*thu|tài\s*chính|lương|tiền\s*điện|chi\s*phí|lợi\s*nhuận|báo\s*cáo\s*tài/i,
            handler: async (text) => {
                if (typeof window.FinanceModule === 'undefined')
                    return '<b>Module tài chính chưa tải.</b>';
                const now = new Date();
                return await window.FinanceModule.getSummary(now.getMonth() + 1, now.getFullYear());
            }
        },
        {
            regex: /bán\s*chậm|tồn\s*kho|insight|khách\s*hàng|nhu\s*cầu|phân\s*tích|xu\s*hướng/i,
            handler: async (text) => {
                if (typeof window.InsightModule === 'undefined')
                    return '<b>Module phân tích chưa tải.</b>';
                return await window.InsightModule.analyze();
            }
        },
        {
            regex: /thêm\s*sản\s*phẩm|import|upload|nhập\s*file|nhập\s*sp|tải\s*lên|file\s*csv|file\s*json/i,
            handler: async (text) => {
                if (typeof window.ImporterModule === 'undefined')
                    return '<b>Module nhập sản phẩm chưa tải.</b>';
                window.ImporterModule.init();
                return 'Đã mở giao diện <b>Nhập sản phẩm AI</b>. Bạn có thể kéo thả file CSV/JSON vào đó.';
            }
        },
        {
            regex: /cảnh\s*báo|alert|tồn\s*thấp|đơn\s*trễ|thông\s*báo|kiểm\s*tra\s*hệ\s*thống/i,
            handler: async (text) => {
                if (typeof window.AlertEngine === 'undefined')
                    return '<b>Alert Engine chưa tải.</b>';
                await window.AlertEngine.run();
                return 'Đã chạy lại kiểm tra cảnh báo. Xem thông báo phía trên màn hình.';
            }
        }
    ],

    // ── Fallback: gọi server /admin-chat (SSE stream) ───────
    async _callAI(userText) {
        const response = await fetch(this._SERVER + '/admin-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userText,
                sessionId: this._getSessionId(),
                token: this._TOKEN
            })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader = response.body.getReader();
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
                    if (json.delta) fullText += json.delta;
                    if (json.error) throw new Error(json.reply);
                } catch { /* bỏ qua parse lỗi */ }
            }
        }
        return fullText;
    },

    // ── Main route ──────────────────────────────────────────
    async route(userText) {
        if (!userText?.trim()) return 'Bạn muốn hỏi gì?';

        // Thử match pattern trước
        for (const pattern of this._patterns) {
            if (pattern.regex.test(userText)) {
                try {
                    return await pattern.handler(userText);
                } catch (e) {
                    console.error('[ChatRouter] handler error:', e);
                    return `⚠️ Lỗi xử lý: ${e.message}`;
                }
            }
        }

        // Không match → gọi AI server
        try {
            return await this._callAI(userText);
        } catch (e) {
            console.error('[ChatRouter] AI error:', e);
            return `⚠️ Lỗi AI: ${e.message || 'Vui lòng thử lại sau.'}`;
        }
    }
};