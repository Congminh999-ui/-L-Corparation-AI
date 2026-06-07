/**
 * admin-chatbot-router.js
 * Phân loại intent từ câu hỏi → gọi đúng module
 * Fix: thêm đủ header Anthropic (x-api-key, anthropic-version, browser-access)
 */

window.ChatRouter = {

    // ── Config API Key ──────────────────────────────────────
    // Điền API key của bạn vào đây (hoặc inject từ server/env)
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

    // ── Fallback: gọi Anthropic API (đúng chuẩn browser) ───
    async _callAI(userText) {
        const products = (window._allProducts || []).slice(0, 30);
        const orders = (window._allOrders || []).slice(0, 30);

        const ctxLines = [];
        if (products.length) {
            const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
            const lowStock = products.filter(p => (p.stock || 0) < 5).map(p => p.name);
            ctxLines.push(`Tổng sản phẩm: ${products.length}, tổng tồn kho: ${totalStock}`);
            if (lowStock.length) ctxLines.push(`Tồn thấp (<5): ${lowStock.slice(0, 5).join(', ')}`);
        }
        if (orders.length) {
            const pending = orders.filter(o => o.status === 'pending').length;
            const completed = orders.filter(o => o.status === 'completed').length;
            const revenue = orders
                .filter(o => o.status === 'completed')
                .reduce((s, o) => s + (o.grand_total || 0), 0);
            ctxLines.push(`Đơn hàng: ${orders.length} (pending: ${pending}, completed: ${completed})`);
            if (revenue) ctxLines.push(`Doanh thu: ${(revenue / 1e6).toFixed(1)} triệu VNĐ`);
        }

        const systemPrompt = `Bạn là trợ lý quản trị nội bộ cho L-Corporation — chuỗi xe máy điện.
Trả lời ngắn gọn, chính xác bằng tiếng Việt. Có thể dùng HTML đơn giản (<b>, <ul>, <li>).
Dữ liệu hiện tại:
${ctxLines.join('\n') || 'Chưa có dữ liệu.'}`;

        // ✅ Header đúng chuẩn để gọi Anthropic từ browser
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this._apiKey,
                'anthropic-version': '2023-06-01',
                // Header bắt buộc khi gọi từ browser (thay thế CORS proxy)
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                system: systemPrompt,
                messages: [{ role: 'user', content: userText }],
            }),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const msg = errData.error?.message || `HTTP ${response.status}`;
            console.error('[ChatRouter] API error:', msg);
            throw new Error(msg);
        }

        const data = await response.json();
        return data.content
            ?.filter(b => b.type === 'text')
            .map(b => b.text)
            .join('') || 'Không có phản hồi.';
    },

    // ── Main route ──────────────────────────────────────────
    async route(userText) {
        if (!userText || !userText.trim()) return 'Bạn muốn hỏi gì?';

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

        // Không match pattern → gọi AI
        if (!this._apiKey) {
            return '🔑 <b>Chưa cấu hình API Key.</b><br>Mở file <code>admin-chatbot-router.js</code> và điền key vào <code>_apiKey</code>.';
        }

        try {
            return await this._callAI(userText);
        } catch (e) {
            if (e.message?.includes('401') || e.message?.toLowerCase().includes('api_key')) {
                return '🔑 <b>API Key không hợp lệ.</b> Kiểm tra lại key trong <code>admin-chatbot-router.js</code>.';
            }
            return `⚠️ Lỗi AI: ${e.message || 'Vui lòng thử lại sau.'}`;
        }
    },
};