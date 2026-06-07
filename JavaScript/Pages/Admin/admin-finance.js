/**
 * admin-finance.js
 * Tổng hợp doanh thu, VAT, chi phí, lợi nhuận từ Supabase
 */

window.FinanceModule = {

    async getSummary(month, year) {
        // Nếu không truyền → tháng hiện tại
        if (!month || !year) {
            const now = new Date();
            month = now.getMonth() + 1;
            year = now.getFullYear();
        }

        const monthStr = String(month).padStart(2, '0');
        const startDate = `${year}-${monthStr}-01T00:00:00.000Z`;
        // Ngày đầu tháng sau
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00.000Z`;

        const errors = [];
        let revenue = 0;
        let taxTotal = 0;
        let expenses = 0;

        // --- Doanh thu & thuế từ orders ---
        try {
            const { data, error } = await window.db
                .from('orders')
                .select('grand_total, tax_amount, status, created_at')
                .eq('status', 'completed')
                .gte('created_at', startDate)
                .lt('created_at', endDate);

            if (error) throw error;
            if (data) {
                revenue = data.reduce((s, o) => s + (o.grand_total || 0), 0);
                taxTotal = data.reduce((s, o) => s + (o.tax_amount || 0), 0);
            }
        } catch (e) {
            errors.push('Không tải được dữ liệu đơn hàng: ' + e.message);
        }

        // --- Chi phí từ finance_entries ---
        const expenseRows = [];
        try {
            const { data, error } = await window.db
                .from('finance_entries')
                .select('category, amount, note, type')
                .eq('type', 'expense')
                .eq('month', month)
                .eq('year', year);

            if (error) throw error;
            if (data) {
                expenses = data.reduce((s, e) => s + (e.amount || 0), 0);
                data.forEach(e => expenseRows.push({ label: e.category || e.note || 'Chi phí', value: window.formatVND ? window.formatVND(e.amount) : e.amount }));
            }
        } catch (e) {
            errors.push('Không tải được chi phí: ' + e.message);
        }

        const profit = revenue - taxTotal - expenses;

        // --- Build card data ---
        const cards = [
            { label: `Doanh thu tháng ${month}/${year}`, value: window.formatVND ? window.formatVND(revenue) : revenue },
            { label: 'Thuế VAT (tích lũy)', value: window.formatVND ? window.formatVND(taxTotal) : taxTotal },
            { label: 'Tổng chi phí nhập', value: window.formatVND ? window.formatVND(expenses) : expenses },
            { label: 'Lợi nhuận ước tính', value: window.formatVND ? window.formatVND(profit) : profit },
            ...expenseRows
        ];

        let html = '';
        if (typeof window.AdminChatbot !== 'undefined' && typeof window.AdminChatbot.buildDataCard === 'function') {
            html = window.AdminChatbot.buildDataCard(cards);
        } else {
            // Fallback plain HTML
            html = `<div style="font-size:13px"><b>Báo cáo tài chính ${month}/${year}</b><ul>` +
                cards.map(c => `<li>${c.label}: <b>${c.value}</b></li>`).join('') +
                '</ul></div>';
        }

        if (errors.length) {
            html += `<div style="color:#E53935;font-size:12px;margin-top:6px">⚠️ ${errors.join('<br>')}</div>`;
        }

        return html;
    }
};