/**
 * L-Corparation — AI Server v4.0
 * Node.js + Express + Groq (Llama 3.3) + Supabase
 * ✅ Lấy dữ liệu xe/sản phẩm từ Supabase
 * ✅ Lưu lịch sử chat vào Supabase
 * ✅ Session GC, rate limit, CORS an toàn
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.set('trust proxy', 1); // ✅ FIX: Cần thiết khi deploy trên Render/Heroku/proxy
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname)));

// ============================================================
// SUPABASE CONFIG
// ============================================================
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// ============================================================
// GROQ CONFIG
// ============================================================
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const PORT = process.env.PORT || 3000;
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const ALLOWED_ORIGINS = (
    process.env.ALLOWED_ORIGINS || 'http://localhost:5500,http://127.0.0.1:5500'
).split(',');

// ============================================================
// CORS
// ============================================================
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// ============================================================
// RATE LIMITING
// ============================================================
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { reply: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút nhé!' },
    standardHeaders: true,
    legacyHeaders: false,
});

const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { reply: 'Bạn nhắn quá nhanh! Hãy thư giãn 1 chút rồi hỏi lại nhé.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(generalLimiter);

// ============================================================
// SESSION STORE
// ============================================================
const sessions = new Map();
const MAX_MSGS = 20;
const SESSION_TTL = 30 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [id, session] of sessions) {
        if (now - session.lastActive > SESSION_TTL) {
            sessions.delete(id);
            cleaned++;
        }
    }
    if (cleaned > 0) console.log(`[Session GC] Đã xoá ${cleaned} session hết hạn`);
}, 10 * 60 * 1000);

function getSession(sessionId) {
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, { history: [], lastActive: Date.now() });
    }
    const session = sessions.get(sessionId);
    session.lastActive = Date.now();
    return session;
}

// ============================================================
// SYSTEM PROMPT ĐỘNG TỪ SUPABASE
// ============================================================
async function buildSystemPrompt() {
    const { data: cars } = await supabase
        .from('products')
        .select('name, price, range_km, seats, power_kw, acceleration')
        .eq('vehicle_type', 'car')
        .eq('is_active', true)
        .order('price', { ascending: true });

    const { data: scooters } = await supabase
        .from('products')
        .select('name, price, range_km, top_speed, charge_time')
        .eq('vehicle_type', 'scooter')
        .eq('is_active', true)
        .order('price', { ascending: true });

    const carTable = (cars || []).map(c =>
        `| ${c.name} | ${formatPrice(c.price)} | ${c.range_km ?? '?'}km | ${c.seats ?? '?'} chỗ | ${c.power_kw ?? '?'}kW | ${c.acceleration ?? '?'} |`
    ).join('\n');

    const scooterList = (scooters || []).map(s =>
        `- ${s.name}: ${formatPrice(s.price)} | ${s.range_km ?? '?'}km | Max ${s.top_speed ?? '?'}km/h | Sạc ${s.charge_time ?? '?'}`
    ).join('\n');

    return `
Bạn là L-Bot, trợ lý tư vấn xe điện của L-Corparation.
Chỉ trả lời bằng tiếng Việt. Thân thiện, ngắn gọn, chuyên nghiệp. Dùng emoji phù hợp.

=== Ô TÔ ĐIỆN (dữ liệu thực từ hệ thống) ===
| Mẫu | Giá | Quãng đường | Chỗ | Công suất | Tăng tốc |
${carTable}

=== XE MÁY ĐIỆN (dữ liệu thực từ hệ thống) ===
${scooterList}

=== CHÍNH SÁCH VÀNG ===
- Trả góp 0% / 12 tháng (0đ vốn đối ứng)
- Miễn 100% lệ phí trước bạ
- Bảo hành Ô tô: 10 năm hoặc 200.000km
- Bảo hành Xe máy: 5 năm hoặc 50.000km

=== HỆ THỐNG V-GREEN ===
- Trạm sạc: 150.000+ cổng sạc phủ khắp 63 tỉnh thành
- Sạc MIỄN PHÍ đến 31/05/2027
- DC 120kW sạc 18 phút đi được 200km
- Đổi pin xe máy < 60 giây

=== LIÊN HỆ L-CORPORATION ===
- Hotline: 1800-1234 (8h–22h) | Email: support@lcorp.com
- HCM: 45A Lý Tự Trọng, Q.1
- HN : 123 Phạm Văn Đồng, Cầu Giấy
- ĐN : 89 Nguyễn Văn Linh

Nếu câu hỏi nằm ngoài phạm vi xe điện VinFast và L-Corparation,
lịch sự từ chối và hướng khách về tư vấn xe điện.
`.trim();
}

function formatPrice(price) {
    if (!price) return '?';
    if (price >= 1_000_000_000) return (price / 1_000_000_000).toFixed(3).replace('.', ',') + ' tỷ';
    return (price / 1_000_000).toFixed(0) + ' triệu';
}

let cachedPrompt = null;
let cachedPromptTime = 0;
const PROMPT_TTL = 5 * 60 * 1000;

async function getSystemPrompt() {
    if (cachedPrompt && Date.now() - cachedPromptTime < PROMPT_TTL) {
        return cachedPrompt;
    }
    cachedPrompt = await buildSystemPrompt();
    cachedPromptTime = Date.now();
    return cachedPrompt;
}

// ============================================================
// LƯU LỊCH SỬ CHAT
// ============================================================
async function saveChatHistory({ sessionId, role, content }) {
    try {
        await supabase.from('chat_history').insert({ session_id: sessionId, role, content });
    } catch (err) {
        console.warn('[ChatHistory] Không lưu được:', err.message);
    }
}

// ============================================================
// HANDLER CHUNG — dùng lại cho cả /chat và /admin-chat
// ============================================================
async function handleChat(req, res, isAdmin = false) {
    const { message, sessionId } = req.body;

    if (!message?.trim()) {
        return res.status(400).json({ reply: 'Vui lòng nhập nội dung tin nhắn!' });
    }
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 64) {
        return res.status(400).json({ reply: 'Session không hợp lệ!' });
    }

    const storeSessionId = isAdmin ? 'admin_' + sessionId : sessionId;
    const session = getSession(storeSessionId);
    session.history.push({ role: 'user', content: message.trim() });
    saveChatHistory({ sessionId: storeSessionId, role: 'user', content: message.trim() });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

    try {
        const basePrompt = await getSystemPrompt();
        const systemPrompt = isAdmin
            ? basePrompt + `\n\n=== CHẾ ĐỘ ADMIN ===\nBạn đang hỗ trợ admin nội bộ. Có thể trả lời các câu hỏi về tồn kho, doanh thu, đơn hàng, khách hàng và vận hành hệ thống.`
            : basePrompt;

        const response = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...session.history
                ],
                temperature: 0.7,
                max_tokens: 1024,
                stream: true
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error('[Groq Error]', response.status, err);
            send({ error: true, reply: '🔧 L-Bot đang bảo trì, vui lòng thử lại sau!' });
            return res.end();
        }

        let fullReply = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const lines = decoder.decode(value, { stream: true }).split('\n');
            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const raw = line.slice(6).trim();
                if (raw === '[DONE]') continue;
                try {
                    const json = JSON.parse(raw);
                    const delta = json.choices?.[0]?.delta?.content;
                    if (delta) { fullReply += delta; send({ delta }); }
                } catch { /* bỏ qua */ }
            }
        }

        saveChatHistory({ sessionId: storeSessionId, role: 'assistant', content: fullReply });
        session.history.push({ role: 'assistant', content: fullReply });
        if (session.history.length > MAX_MSGS) session.history = session.history.slice(-MAX_MSGS);

        send({ done: true });

    } catch (err) {
        console.error('[L-Bot Error]', err.message);
        send({ error: true, reply: '🔧 L-Bot đang bảo trì, vui lòng thử lại hoặc gọi 1800-1234!' });
    }

    res.end();
}

// ============================================================
// ROUTES
// ============================================================
app.post('/chat', chatLimiter, (req, res) => handleChat(req, res, false));
app.post('/admin-chat', chatLimiter, (req, res) => handleChat(req, res, true));  // ✅ FIX: Route admin riêng

app.get('/history/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    if (!sessionId || sessionId.length > 64) {
        return res.status(400).json({ error: 'Session không hợp lệ' });
    }
    const { data, error } = await supabase
        .from('chat_history')
        .select('role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(100);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ history: data });
});

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', sessions: sessions.size, uptime: Math.floor(process.uptime()) + 's' });
});

// ============================================================
// Start
// ============================================================
app.listen(PORT, () => {
    console.log('=====================================');
    console.log('  L-Bot AI Server v4.0 — READY');
    console.log(`  http://localhost:${PORT}`);
    console.log(`  Model    : ${GROQ_MODEL}`);
    console.log(`  Supabase : ${process.env.SUPABASE_URL}`);
    console.log(`  Origins  : ${ALLOWED_ORIGINS.join(', ')}`);
    console.log('=====================================');
});