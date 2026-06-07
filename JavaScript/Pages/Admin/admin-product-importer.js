/**
 * admin-product-importer.js
 * Drag-drop / file input → AI validate + map schema → preview → confirm → import
 */

window.ImporterModule = (() => {

    const TARGET_SCHEMA = ['product_code', 'category_id', 'name', 'price', 'price_old', 'stock', 'image_url', 'is_active'];

    // ── UI ────────────────────────────────────────────────────────────────────

    function _getOrCreateContainer() {
        let el = document.getElementById('importerContainer');
        if (!el) {
            el = document.createElement('div');
            el.id = 'importerContainer';
            el.style.cssText = 'display:none;padding:20px;max-width:900px;margin:0 auto';
            document.body.appendChild(el);
        }
        return el;
    }

    function _renderDropzone(container) {
        container.innerHTML = `
      <h2 style="color:#fff;font-size:18px;margin-bottom:16px">
        <i class="fa-solid fa-file-import"></i> Nhập sản phẩm bằng AI
      </h2>

      <div id="importDropzone" style="
        border: 2px dashed #555;
        border-radius: 12px;
        padding: 48px 24px;
        text-align: center;
        cursor: pointer;
        transition: border-color .2s, background .2s;
      ">
        <i class="fa-solid fa-cloud-arrow-up" style="font-size:40px;color:#888;display:block;margin-bottom:12px"></i>
        <p style="color:#aaa;margin:0">Kéo thả file <b>CSV</b> hoặc <b>JSON</b> vào đây</p>
        <p style="color:#666;font-size:12px;margin-top:6px">hoặc click để chọn file</p>
        <input type="file" id="importFileInput" accept=".csv,.json" style="display:none">
      </div>

      <div id="importStatus" style="margin-top:16px;font-size:13px;color:#aaa"></div>
      <div id="importPreview" style="margin-top:16px;overflow-x:auto"></div>
      <div id="importActions" style="margin-top:16px"></div>
    `;

        // Events
        const dz = document.getElementById('importDropzone');
        const input = document.getElementById('importFileInput');

        dz.addEventListener('click', () => input.click());
        dz.addEventListener('dragover', e => { e.preventDefault(); dz.style.borderColor = '#1de9b6'; dz.style.background = 'rgba(29,233,182,.05)'; });
        dz.addEventListener('dragleave', () => { dz.style.borderColor = '#555'; dz.style.background = ''; });
        dz.addEventListener('drop', e => {
            e.preventDefault();
            dz.style.borderColor = '#555';
            dz.style.background = '';
            const file = e.dataTransfer.files[0];
            if (file) _handleFile(file);
        });
        input.addEventListener('change', () => { if (input.files[0]) _handleFile(input.files[0]); });
    }

    // ── File handling ─────────────────────────────────────────────────────────

    async function _handleFile(file) {
        const status = document.getElementById('importStatus');
        const preview = document.getElementById('importPreview');
        const actions = document.getElementById('importActions');

        preview.innerHTML = '';
        actions.innerHTML = '';
        status.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang đọc file <b>${file.name}</b>…`;

        let rawContent;
        try {
            rawContent = await file.text();
        } catch (e) {
            status.innerHTML = `<span style="color:#E53935">❌ Không đọc được file: ${e.message}</span>`;
            return;
        }

        status.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> AI đang phân tích & map schema…`;

        let mappedRows;
        try {
            mappedRows = await _aiMapSchema(file.name, rawContent);
        } catch (e) {
            status.innerHTML = `<span style="color:#E53935">❌ AI không xử lý được: ${e.message}</span>`;
            return;
        }

        if (!mappedRows || !mappedRows.length) {
            status.innerHTML = `<span style="color:#E53935">❌ Không tìm thấy dữ liệu hợp lệ.</span>`;
            return;
        }

        status.innerHTML = `✅ AI đã map được <b>${mappedRows.length}</b> sản phẩm. Kiểm tra trước khi nhập:`;
        _renderPreview(preview, mappedRows);
        _renderActions(actions, mappedRows, file.name);
    }

    // ── AI schema mapping ─────────────────────────────────────────────────────

    async function _aiMapSchema(filename, content) {
        // Giới hạn content để không vượt token
        const trimmed = content.slice(0, 8000);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                system: `Bạn là hệ thống map dữ liệu sản phẩm xe máy điện.
Từ dữ liệu đầu vào (CSV hoặc JSON thô), hãy trích xuất và map vào schema chuẩn.
Trả về ONLY JSON array hợp lệ, không backtick, không giải thích.
Schema mỗi phần tử:
{
  "product_code": "string (bắt buộc, unique)",
  "category_id": "number hoặc null",
  "name": "string (bắt buộc)",
  "price": "number (đơn vị VND, bắt buộc)",
  "price_old": "number hoặc null",
  "stock": "number (mặc định 0)",
  "image_url": "string hoặc null",
  "is_active": "boolean (mặc định true)"
}
Nếu thiếu trường bắt buộc → bỏ qua dòng đó. Số tối đa 200 dòng.`,
                messages: [{ role: 'user', content: `File: ${filename}\nNội dung:\n${trimmed}` }]
            })
        });

        if (!response.ok) throw new Error(`API ${response.status}`);
        const data = await response.json();
        const text = (data.content?.[0]?.text || '[]').replace(/```json|```/g, '').trim();
        return JSON.parse(text);
    }

    // ── Preview table ─────────────────────────────────────────────────────────

    function _renderPreview(container, rows) {
        const cols = TARGET_SCHEMA;
        let html = `<table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead>
        <tr style="background:#1a1a2e;color:#aaa">
          ${cols.map(c => `<th style="padding:8px 10px;text-align:left;border-bottom:1px solid #333">${c}</th>`).join('')}
        </tr>
      </thead>
      <tbody>`;

        rows.slice(0, 50).forEach((row, i) => {
            html += `<tr style="background:${i % 2 ? '#111' : '#0d0d1a'}">
        ${cols.map(c => `<td style="padding:6px 10px;color:#ddd;border-bottom:1px solid #222;white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis">${row[c] !== undefined && row[c] !== null ? row[c] : '<span style="color:#555">—</span>'}</td>`).join('')}
      </tr>`;
        });

        if (rows.length > 50) {
            html += `<tr><td colspan="${cols.length}" style="padding:8px;text-align:center;color:#666;font-style:italic">…và ${rows.length - 50} sản phẩm khác</td></tr>`;
        }

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    // ── Action buttons ────────────────────────────────────────────────────────

    function _renderActions(container, rows, filename) {
        container.innerHTML = `
      <button id="btnConfirmImport" style="
        background:#1de9b6;color:#000;border:none;padding:10px 24px;
        border-radius:8px;font-weight:700;cursor:pointer;font-size:14px;
        margin-right:12px;transition:opacity .15s
      ">
        <i class="fa-solid fa-upload"></i> Nhập ${rows.length} sản phẩm
      </button>
      <button id="btnCancelImport" style="
        background:#333;color:#aaa;border:none;padding:10px 18px;
        border-radius:8px;cursor:pointer;font-size:14px
      ">Huỷ</button>
      <div id="importProgress" style="margin-top:12px;font-size:13px"></div>
    `;

        document.getElementById('btnConfirmImport').addEventListener('click', () => _doImport(rows, filename));
        document.getElementById('btnCancelImport').addEventListener('click', () => {
            document.getElementById('importPreview').innerHTML = '';
            container.innerHTML = '';
            document.getElementById('importStatus').innerHTML = '';
        });
    }

    // ── Actual import ─────────────────────────────────────────────────────────

    async function _doImport(rows, filename) {
        const btn = document.getElementById('btnConfirmImport');
        const progress = document.getElementById('importProgress');

        btn.disabled = true;
        btn.style.opacity = '0.5';

        let successCount = 0;
        const errors = [];

        for (let i = 0; i < rows.length; i++) {
            progress.innerHTML = `Đang nhập ${i + 1}/${rows.length}…`;
            try {
                if (typeof window.ProductsAPI !== 'undefined') {
                    await window.ProductsAPI.create(rows[i]);
                } else {
                    // Fallback trực tiếp
                    const { error } = await window.db.from('products').insert([rows[i]]);
                    if (error) throw error;
                }
                successCount++;
            } catch (e) {
                errors.push({ row: i + 1, name: rows[i].name, error: e.message });
            }
        }

        // Lưu log
        await _saveImportLog(filename, rows.length, successCount, errors);

        // Kết quả
        if (errors.length === 0) {
            progress.innerHTML = `<span style="color:#1de9b6">✅ Nhập thành công ${successCount}/${rows.length} sản phẩm!</span>`;
            if (typeof showToast === 'function') showToast(`Đã nhập ${successCount} sản phẩm`, 'success');
        } else {
            const errHTML = errors.slice(0, 5).map(e => `Dòng ${e.row} (${e.name}): ${e.error}`).join('<br>');
            progress.innerHTML = `<span style="color:#ff9800">⚠️ Nhập xong: ${successCount} thành công, ${errors.length} lỗi:</span><br>
        <span style="color:#E53935;font-size:12px">${errHTML}</span>`;
        }

        btn.style.display = 'none';
    }

    async function _saveImportLog(filename, totalRows, successRows, errors) {
        try {
            await window.db.from('import_logs').insert([{
                filename,
                status: errors.length === 0 ? 'success' : successRows > 0 ? 'partial' : 'failed',
                total_rows: totalRows,
                success_rows: successRows,
                errors: errors.length ? errors.slice(0, 50) : null
            }]);
        } catch (e) {
            console.warn('[ImporterModule] Không lưu được import_logs:', e.message);
        }
    }

    // ── Public ────────────────────────────────────────────────────────────────

    function init() {
        const container = _getOrCreateContainer();
        container.style.display = 'block';
        _renderDropzone(container);

        // Cuộn xuống vùng importer
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return { init };
})();