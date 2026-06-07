/**
 * admin-sales-insight.js
 * Phân tích sản phẩm bán chậm + trích xuất insight từ chat_history
 * v2.0 — Gọi qua server /admin-ai, không dùng API key trực tiếp
 */

window.InsightModule = {

    _SERVER: 'https://l-corparation-ai.onrender.com',
    _TOKEN: 'admin-lcorp-2024', // TODO: ADD_API_KEY

    async analyze() {
        const results = { slowProducts: [], insights: {}, errors: [] };
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 3600 * 1000).toISOString();

        // --- 1. Sản phẩm bán chậm (0 đơn trong 30 ngày) ---
        try {
            const { data: activeItems } = await window.db
                .from('order_items')
                .select('product_id, orders!inner(created_at)')
                .gte('orders.created_at', thirtyDaysAgo);

            const activeIds = new Set((activeItems || []).map(i => i.product_id));

            const { data: allProducts, error } = await window.db
                .from('products')
                .select('id, name, stock, price, category_id')
                .eq('is_active', true);

            if (error) throw error;
            results.slowProducts = (allProducts || []).filter(p => !activeIds.has(p.id));
        } catch (e) {
            results.errors.push('Lỗi phân tích sản phẩm: ' + e.message);
        }

        // --- 2. Trích insight từ chat_history qua server ---
        try {
            const { data: messages, error } = await window.db
                .from('chat_history')
                .select('content, session_id, created_at')
                .eq('role', 'user')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            if (messages && messages.length > 0) {
                const msgText = messages.map(m => `- "${m.content}"`).join('\n');

                const aiResponse = await fetch(this._SERVER + '/admin-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        task: 'analyze_chat',
                        messages: msgText,
                        token: this._TOKEN
                    })
                });

                if (aiResponse.ok) {
                    const { result } = await aiResponse.json();
                    if (result) {
                        results.insights = result;
                        await this._saveInsights(messages, result);
                    }
                }
            }
        } catch (e) {
            results.errors.push('Lỗi phân tích chat: ' + e.message);
        }

        return this._buildHTML(results);
    },

    async _saveInsights(messages, parsed) {
        try {
            const rows = messages.slice(0, 10).map(m => ({
                session_id: m.session_id || null,
                raw_message: m.content,
                product_interest: (parsed.top_interests || []).join(', '),
                use_case: (parsed.use_cases || [])[0] || 'other'
            }));
            await window.db.from('customer_insights').insert(rows);
        } catch (e) {
            console.warn('[InsightModule] Không lưu được customer_insights:', e.message);
        }
    },

    _buildHTML(results) {
        let html = '';

        // Sản phẩm bán chậm
        if (results.slowProducts.length) {
            const cards = results.slowProducts.slice(0, 8).map(p => ({
                label: p.name,
                value: `Tồn: ${p.stock} | ${window.formatVND ? window.formatVND(p.price) : p.price}`
            }));
            if (typeof window.AdminChatbot !== 'undefined' && window.AdminChatbot.buildDataCard) {
                html += `<b>📦 ${results.slowProducts.length} sản phẩm chưa bán trong 30 ngày:</b>`;
                html += window.AdminChatbot.buildDataCard(cards);
            } else {
                html += `<b>Sản phẩm bán chậm:</b><ul>` +
                    cards.map(c => `<li>${c.label}: ${c.value}</li>`).join('') + '</ul>';
            }
        } else {
            html += '<p>✅ Tất cả sản phẩm đều có đơn hàng trong 30 ngày.</p>';
        }

        // Insights từ chat
        const ins = results.insights;
        if (ins && Object.keys(ins).length) {
            html += '<hr style="border-color:#ddd;margin:10px 0">';
            html += '<b>🧠 Insight từ chat khách hàng:</b><br>';

            if (ins.summary) html += `<p style="color:#666;font-size:13px">${ins.summary}</p>`;

            const insCards = [];
            if (ins.top_interests?.length) insCards.push({ label: 'Quan tâm nhiều nhất', value: ins.top_interests.join(', ') });
            if (ins.use_cases?.length) insCards.push({ label: 'Mục đích sử dụng', value: ins.use_cases.join(', ') });
            if (ins.pain_points?.length) insCards.push({ label: 'Lo ngại của khách', value: ins.pain_points.join(', ') });

            if (insCards.length && window.AdminChatbot?.buildDataCard) {
                html += window.AdminChatbot.buildDataCard(insCards);
            } else {
                html += '<ul>' + insCards.map(c => `<li><b>${c.label}:</b> ${c.value}</li>`).join('') + '</ul>';
            }
        }

        if (results.errors.length) {
            html += `<div style="color:#E53935;font-size:12px;margin-top:6px">⚠️ ${results.errors.join('<br>')}</div>`;
        }

        return html || '<p>Không có dữ liệu để phân tích.</p>';
    }
};