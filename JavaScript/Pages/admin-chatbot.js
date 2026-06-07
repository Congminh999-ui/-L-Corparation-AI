/* ============================================================
   admin-chatbot.js — L-Corporation Admin Chatbot v3
   UI full-panel, không logo, đẹp chuyên nghiệp
   ============================================================ */

(function () {

  /* ── 1. INJECT CSS ─────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `

    /* ── Window (right main-content panel) ── */
    #adminChatWindow {
      position: fixed !important;
      left: 260px;
      top: 64px;
      right: 0;
      bottom: 0;
      z-index: 900;
      height: calc(100vh - 64px);
      background: #f4f6f9;
      display: flex; flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      transform: translateX(102%);
      opacity: 0;
      pointer-events: none;
      transition: transform .3s cubic-bezier(.22,1,.36,1), opacity .2s;
    }
    #adminChatWindow.open {
      transform: translateX(0);
      opacity: 1;
      pointer-events: all;
    }

    /* ── Header ── */
    .acb-header {
      background: #fff;
      padding: 0 24px;
      height: 60px;
      display: flex; align-items: center; gap: 12px;
      flex-shrink: 0;
      border-bottom: 1px solid #e9ecef;
      box-shadow: 0 1px 4px rgba(0,0,0,.06);
    }
    .acb-header-text { flex: 1; min-width: 0; }
    .acb-header-name {
      color: #1a202c; font-weight: 700; font-size: .88rem;
      letter-spacing: .2px; line-height: 1.2;
    }
    .acb-header-status {
      color: #6b7280; font-size: .69rem;
      display: flex; align-items: center; gap: 5px; margin-top: 2px;
    }
    .acb-dot-pulse {
      width: 6px; height: 6px;
      background: #16a34a; border-radius: 50%;
      animation: acbDot 2s ease-in-out infinite;
    }
    @keyframes acbDot {
      0%,100% { opacity:1; transform:scale(1); }
      50%     { opacity:.4; transform:scale(.75); }
    }
    .acb-header-actions { display:flex; gap:4px; }
    .acb-icon-btn {
      background: none;
      border: 1px solid #e9ecef; cursor: pointer;
      width: 32px; height: 32px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; color: #6b7280;
      transition: background .15s, color .15s, border-color .15s;
    }
    .acb-icon-btn:hover { background: #f3f4f6; color: #374151; border-color: #d1d5db; }
    .acb-icon-btn.danger:hover { background: #fef2f2; color: #dc2626; border-color: #fca5a5; }

    /* ── Quick chips ── */
    .acb-quick {
      display: flex; flex-wrap: wrap; gap: 8px;
      padding: 12px 20px;
      background: #fff;
      border-bottom: 1px solid #f1f3f5;
      flex-shrink: 0;
    }
    .acb-qbtn {
      padding: 6px 14px;
      border-radius: 20px;
      border: 1.5px solid #e2e8f0;
      background: #fff; color: #374151;
      font-size: .73rem; font-weight: 600;
      cursor: pointer; white-space: nowrap;
      transition: all .15s;
      display: flex; align-items: center; gap: 5px;
    }
    .acb-qbtn i { color: #16a34a; font-size: .7rem; }
    .acb-qbtn:hover {
      background: #f0fdf4; color: #15803d;
      border-color: #86efac;
      box-shadow: 0 2px 8px rgba(22,163,74,.12);
    }

    /* ── Messages ── */
    .acb-messages {
      flex: 1; overflow-y: auto;
      padding: 24px 20px 12px;
      display: flex; flex-direction: column; gap: 12px;
      background: #f4f6f9;
      scroll-behavior: smooth;
    }
    .acb-messages::-webkit-scrollbar { width: 4px; }
    .acb-messages::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:4px; }
    .acb-messages::-webkit-scrollbar-track { background: transparent; }

    /* Date divider */
    .acb-date-divider {
      text-align: center; font-size: .65rem; color: #9ca3af;
      margin: 4px 0;
      display: flex; align-items: center; gap: 10px;
    }
    .acb-date-divider::before, .acb-date-divider::after {
      content: ''; flex: 1; border-top: 1px solid #e5e7eb;
    }

    .acb-msg { display:flex; gap:8px; align-items:flex-end; animation: acbMsgIn .2s ease both; }
    @keyframes acbMsgIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
    .acb-msg.bot  { justify-content: flex-start; max-width: 70%; }
    .acb-msg.user { justify-content: flex-end; margin-left: auto; max-width: 70%; }

    .acb-msg-avatar {
      width: 30px; height: 30px; border-radius: 10px;
      background: linear-gradient(135deg,#16a34a,#15803d);
      display: flex; align-items: center; justify-content: center;
      font-size: .75rem; color: #fff; flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(22,163,74,.25);
    }
    .acb-bubble {
      padding: 10px 15px;
      border-radius: 14px; font-size: .82rem;
      line-height: 1.65; word-break: break-word;
    }
    .acb-msg.bot .acb-bubble {
      background: #fff; color: #1e293b;
      border: 1px solid #e9ecef;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,.05);
    }
    .acb-msg.user .acb-bubble {
      background: linear-gradient(135deg,#16a34a,#15803d);
      color: #fff; border-bottom-right-radius: 4px;
      box-shadow: 0 2px 8px rgba(22,163,74,.3);
    }
    .acb-time {
      font-size: .58rem; color: #9ca3af;
      margin-top: 4px; display: block;
    }
    .acb-msg.user .acb-time { text-align:right; color:rgba(255,255,255,.65); }

    /* typing dots */
    .acb-typing .acb-bubble { display:flex; gap:5px; align-items:center; padding:12px 16px; }
    .acb-tdot {
      width: 7px; height: 7px; background: #d1d5db;
      border-radius: 50%;
      animation: acbBounce 1s ease-in-out infinite;
    }
    .acb-tdot:nth-child(2) { animation-delay:.16s; }
    .acb-tdot:nth-child(3) { animation-delay:.32s; }
    @keyframes acbBounce { 0%,80%,100%{transform:translateY(0);background:#d1d5db} 40%{transform:translateY(-6px);background:#16a34a} }

    /* streaming cursor */
    .acb-cursor::after { content:'▋'; animation:acbBlink .65s infinite; font-size:.72rem; color:#16a34a; }
    @keyframes acbBlink { 0%,100%{opacity:1} 50%{opacity:0} }

    /* data card */
    .acb-data-card {
      background:#f0fdf4; border:1px solid #bbf7d0;
      border-left:3px solid #16a34a; border-radius:8px;
      padding:8px 12px; margin-top:6px; font-size:12.5px;
    }
    .adc-row {
      display:flex; justify-content:space-between;
      align-items:center; padding:4px 0;
      border-bottom:1px solid #dcfce7; gap:10px;
    }
    .adc-row:last-child { border-bottom:none; }
    .adc-row span  { color:#6b7280; font-size:12px; }
    .adc-row strong{ color:#1a1a1a; font-size:13px; text-align:right; }

    /* ── Input area ── */
    .acb-input-area {
      padding: 14px 20px 14px;
      border-top: 1px solid #e9ecef;
      display: flex; gap: 10px; align-items: flex-end;
      flex-shrink: 0; background: #fff;
    }
    #adminChatInput {
      flex: 1; border: 1.5px solid #e2e8f0;
      border-radius: 12px; padding: 11px 16px;
      font-size: .84rem; outline: none;
      font-family: inherit; color: #1e293b;
      resize: none; min-height: 44px; max-height: 100px;
      line-height: 1.5; background: #f8fafc;
      transition: border-color .2s, background .2s, box-shadow .2s;
    }
    #adminChatInput:focus {
      border-color: #16a34a; background: #fff;
      box-shadow: 0 0 0 3px rgba(22,163,74,.1);
    }
    #adminChatInput::placeholder { color: #9ca3af; }
    #chatSendBtn {
      width: 42px; height: 42px;
      border-radius: 12px; border: none;
      background: linear-gradient(135deg,#16a34a,#15803d);
      color: #fff; cursor: pointer; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: .88rem;
      transition: transform .15s, opacity .15s;
      opacity: .4;
    }
    #chatSendBtn.active { opacity: 1; }
    #chatSendBtn.active:hover { transform: scale(1.07); }
    #chatSendBtn.active:active { transform: scale(.94); }
    #chatSendBtn:disabled { opacity: .25; cursor: not-allowed; }

    .acb-input-hint {
      font-size: .65rem; color: #9ca3af;
      padding: 0 2px 8px 2px; flex-shrink: 0;
      background: #fff; text-align: center;
    }

    /* ── Responsive ── */
    @media(max-width:768px){
      #adminChatWindow { left: 0; top: 56px; height: calc(100vh - 56px); }
      .acb-msg.bot, .acb-msg.user { max-width: 88%; }
    }
  `;
  document.head.appendChild(style);

  /* ── 2. INJECT HTML ────────────────────────────────────── */
  document.body.insertAdjacentHTML('beforeend', `
    <div id="adminChatWindow">
      <div class="acb-header">
        <div class="acb-header-text">
          <div class="acb-header-name">L-Corp AI Assistant</div>
          <div class="acb-header-status">
            <span class="acb-dot-pulse"></span>Trực tuyến · Sẵn sàng hỗ trợ
          </div>
        </div>
        <div class="acb-header-actions">
          <button class="acb-icon-btn danger" id="chatClearBtn" title="Xoá lịch sử">
            <i class="fa-solid fa-trash-can"></i>
          </button>
          <button class="acb-icon-btn" id="chatMinimizeBtn" title="Đóng chat">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <div class="acb-quick" id="chatQuickActions"></div>
      <div class="acb-messages" id="chatMessages"></div>

      <div class="acb-input-area">
        <textarea id="adminChatInput" placeholder="Nhập câu hỏi cho AI..." rows="1"></textarea>
        <button id="chatSendBtn" disabled title="Gửi (Enter)">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </div>
      <div class="acb-input-hint">Nhấn <kbd style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:4px;padding:1px 5px;font-size:.65rem">Enter</kbd> để gửi · <kbd style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:4px;padding:1px 5px;font-size:.65rem">Shift+Enter</kbd> xuống dòng</div>
    </div>
  `);

  /* ── 3. STATE ──────────────────────────────────────────── */
  const SERVER_URL = 'https://l-corparation-ai.onrender.com/admin-chat';
  const SESSION_ID = (() => {
    const key = 'acbot_sid';
    let sid = sessionStorage.getItem(key);
    if (!sid) {
      sid = (crypto.randomUUID?.() || Math.random().toString(36).slice(2)) + Date.now();
      sessionStorage.setItem(key, sid);
    }
    return sid;
  })();

  const win = document.getElementById('adminChatWindow');
  const msgs = document.getElementById('chatMessages');
  const input = document.getElementById('adminChatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  const clearBtn = document.getElementById('chatClearBtn');
  const minimizeBtn = document.getElementById('chatMinimizeBtn');
  const quickEl = document.getElementById('chatQuickActions');

  let isOpen = false;
  let isBusy = false;
  let msgHistory = [];

  const getTime = () =>
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const scrollBottom = () =>
    setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 50);

  /* ── 4. RENDER ─────────────────────────────────────────── */
  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function appendMessage(role, text) {
    msgHistory.push({ role, text });
    const html = renderMarkdown(text);
    const t = getTime();

    const wrap = document.createElement('div');
    wrap.className = `acb-msg ${role}`;

    if (role === 'bot') {
      wrap.innerHTML = `
        <div class="acb-msg-avatar"><i class="fa-solid fa-leaf"></i></div>
        <div>
          <div class="acb-bubble">${html}</div>
          <span class="acb-time">${t}</span>
        </div>`;
    } else {
      wrap.innerHTML = `
        <div>
          <div class="acb-bubble">${html}</div>
          <span class="acb-time">${t}</span>
        </div>`;
    }

    msgs.appendChild(wrap);
    scrollBottom();
    return wrap;
  }

  function createStreamBubble() {
    const wrap = document.createElement('div');
    wrap.className = 'acb-msg bot';
    wrap.innerHTML = `
      <div class="acb-msg-avatar"><i class="fa-solid fa-leaf"></i></div>
      <div>
        <div class="acb-bubble acb-cursor" id="acb-streaming"></div>
        <span class="acb-time">${getTime()}</span>
      </div>`;
    msgs.appendChild(wrap);
    scrollBottom();
    return wrap.querySelector('#acb-streaming');
  }

  function showTyping() {
    if (document.getElementById('acb-typing')) return;
    const w = document.createElement('div');
    w.id = 'acb-typing';
    w.className = 'acb-msg bot acb-typing';
    w.innerHTML = `
      <div class="acb-msg-avatar"><i class="fa-solid fa-leaf"></i></div>
      <div class="acb-bubble">
        <span class="acb-tdot"></span>
        <span class="acb-tdot"></span>
        <span class="acb-tdot"></span>
      </div>`;
    msgs.appendChild(w);
    scrollBottom();
  }
  function hideTyping() {
    const el = document.getElementById('acb-typing');
    if (el) el.remove();
  }

  function buildDataCard(rows) {
    const items = rows.map(r =>
      `<div class="adc-row"><span>${r.label}</span><strong>${r.value}</strong></div>`
    ).join('');
    return `<div class="acb-data-card">${items}</div>`;
  }

  /* ── 5. QUICK CHIPS ────────────────────────────────────── */
  const QUICK_CHIPS = [
    { icon: 'fa-box', label: 'Tồn kho', msg: 'Tổng sản phẩm hiện tại là bao nhiêu?' },
    { icon: 'fa-receipt', label: 'Đơn hôm nay', msg: 'Có bao nhiêu đơn hàng hôm nay?' },
    { icon: 'fa-fire', label: 'Bán chạy', msg: 'Sản phẩm nào đang bán chạy nhất?' },
    { icon: 'fa-headset', label: 'Tư vấn mới', msg: 'Có tư vấn nào chưa xử lý không?' },
    { icon: 'fa-chart-line', label: 'Doanh thu', msg: 'Doanh thu tháng này là bao nhiêu?' },
  ];

  function renderQuickChips() {
    quickEl.innerHTML = QUICK_CHIPS.map(c =>
      `<button class="acb-qbtn" data-msg="${c.msg}">
        <i class="fa-solid ${c.icon}"></i> ${c.label}
      </button>`
    ).join('');
    quickEl.querySelectorAll('.acb-qbtn').forEach(btn => {
      btn.addEventListener('click', () => {
        quickEl.innerHTML = '';
        sendMessage(btn.dataset.msg);
      });
    });
  }

  /* ── 6. API CALL — dùng cùng server với user chatbot ──── */
  async function callAI(userText) {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText, sessionId: SESSION_ID }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  }

  /* ── 7. SEND MESSAGE ───────────────────────────────────── */
  async function sendMessage(text) {
    if (!text?.trim() || isBusy) return;
    const userText = text.trim();

    input.value = '';
    autoResize(input);
    updateSendBtn();
    quickEl.innerHTML = '';

    appendMessage('user', userText);
    isBusy = true;
    sendBtn.disabled = true;

    // Thử dùng ChatRouter trước (local pattern matching)
    if (window.ChatRouter) {
      const localPatterns = [
        /thuế|doanh\s*thu|tài\s*chính|lương|tiền\s*điện|chi\s*phí|lợi\s*nhuận/i,
        /bán\s*chậm|tồn\s*kho|insight|khách\s*hàng|nhu\s*cầu|phân\s*tích/i,
        /thêm\s*sản\s*phẩm|import|upload|nhập\s*file/i,
        /cảnh\s*báo|alert|tồn\s*thấp|đơn\s*trễ/i,
      ];
      const hasLocalMatch = localPatterns.some(p => p.test(userText));

      if (hasLocalMatch) {
        showTyping();
        try {
          const reply = await window.ChatRouter.route(userText);
          hideTyping();
          appendMessage('bot', reply);
        } catch (e) {
          hideTyping();
          appendMessage('bot', '⚠️ Có lỗi xảy ra khi xử lý yêu cầu.');
        }
        isBusy = false;
        sendBtn.disabled = false;
        updateSendBtn();
        renderQuickChips();
        return;
      }
    }

    // Gọi Anthropic API với streaming
    showTyping();
    try {
      const response = await callAI(userText);
      hideTyping();

      const bubble = createStreamBubble();
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
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') continue;
          try {
            const json = JSON.parse(raw);

            if (json.error) {
              if (bubble) { bubble.classList.remove('acb-cursor'); bubble.innerHTML = renderMarkdown(json.reply || '⚠️ Lỗi server.'); }
              break;
            }

            if (json.delta && bubble) {
              fullText += json.delta;
              bubble.innerHTML = renderMarkdown(fullText);
              scrollBottom();
            }

            if (json.done) {
              if (bubble) bubble.classList.remove('acb-cursor');
            }
          } catch { /* bỏ qua */ }
        }
      }

      if (bubble) bubble.classList.remove('acb-cursor');
      msgHistory.push({ role: 'bot', text: fullText });

    } catch (err) {
      hideTyping();
      console.error('[AdminChatbot]', err);
      appendMessage('bot', '⚠️ Không thể kết nối máy chủ AI. Vui lòng thử lại sau hoặc gọi **1800-1234**!');
    }

    isBusy = false;
    sendBtn.disabled = false;
    updateSendBtn();
    renderQuickChips();
  }

  /* ── 8. HELPERS ────────────────────────────────────────── */
  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 80) + 'px';
  }

  function updateSendBtn() {
    sendBtn.classList.toggle('active', input.value.trim().length > 0);
    sendBtn.disabled = input.value.trim() === '' || isBusy;
  }

  /* ── 9. OPEN / CLOSE ───────────────────────────────────── */
  function openChat() {
    isOpen = true;
    win.classList.add('open');
    // Xóa active tất cả nav-item trước, rồi chỉ set chat
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item[data-page="chat"]').forEach(el => el.classList.add('active'));

    if (msgs.children.length === 0) {
      setTimeout(() => {
        appendMessage('bot',
          '👋 Xin chào Admin! Tôi là **L-Bot** — trợ lý AI nội bộ của L-Corporation.\n\nTôi có thể giúp bạn:\n• 📦 Kiểm tra tồn kho & sản phẩm\n• 🧾 Xem đơn hàng & khách hàng\n• 📊 Phân tích doanh thu\n• 🔔 Kiểm tra cảnh báo hệ thống\n\nHãy hỏi tôi bất kỳ điều gì!'
        );
        renderQuickChips();
      }, 280);
    }
    setTimeout(() => input.focus(), 350);
  }

  function closeChat() {
    isOpen = false;
    win.classList.remove('open');
    document.querySelectorAll('.nav-item[data-page="chat"]').forEach(el => el.classList.remove('active'));
  }

  /* ── Hook: đóng chat khi click bất kỳ nav-item nào khác ── */
  document.addEventListener('click', (e) => {
    if (!isOpen) return;
    const navItem = e.target.closest('.nav-item');
    if (!navItem) return;
    const page = navItem.dataset.page;
    // Đóng chat nếu click nav-item không phải "chat"
    if (!page || page !== 'chat') {
      closeChat();
    }
  }, true); // capture phase

  /* ── 10. EVENTS ────────────────────────────────────────── */
  minimizeBtn.addEventListener('click', closeChat);

  clearBtn.addEventListener('click', () => {
    msgHistory = [];
    msgs.innerHTML = '';
    renderQuickChips();
  });

  sendBtn.addEventListener('click', () => sendMessage(input.value));

  input.addEventListener('input', () => { autoResize(input); updateSendBtn(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeChat();
  });

  /* ── 11. PUBLIC API ────────────────────────────────────── */
  window.AdminChatbot = {
    appendMessage,
    showTyping,
    hideTyping,
    buildDataCard,
    open: openChat,
    close: closeChat,
  };

})();