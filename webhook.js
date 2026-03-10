// ═══════════════════════════════════════════════
// PRIME MASTER — Fonnte WA Bot Webhook
// Deploy ke Netlify Functions
// ═══════════════════════════════════════════════

const FONNTE_TOKEN  = process.env.FONNTE_TOKEN  || 'LknmUetYdv88hc5jCf1W';
const FIREBASE_KEY  = process.env.FIREBASE_KEY  || 'AIzaSyAGOEil_dMFRlLwv5MB_psvtVdtDbC3uWU';
const PROJECT_ID    = process.env.PROJECT_ID    || 'webnote-b018d';
const ADMIN_NUMBER  = process.env.ADMIN_NUMBER  || ''; // No WA admin

// ── Firebase REST API helpers ──────────────────
async function firestoreQuery(filter) {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${FIREBASE_KEY}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structuredQuery: filter })
    });
    return res.json();
}

async function getRecordByCode(code) {
    const result = await firestoreQuery({
        from: [{ collectionId: 'service_records' }],
        where: {
            fieldFilter: {
                field: { fieldPath: 'code' },
                op: 'EQUAL',
                value: { stringValue: code.toUpperCase() }
            }
        },
        limit: 1
    });

    if (!result[0]?.document) return null;

    const fields = result[0].document.fields;
    return {
        code:        fields.code?.stringValue        || '-',
        date:        fields.date?.stringValue         || '-',
        customer:    fields.customer?.stringValue     || '-',
        phone:       fields.phone?.stringValue        || '-',
        unit:        fields.unit?.stringValue         || '-',
        description: fields.description?.stringValue  || '-',
        note:        fields.note?.stringValue         || '-',
        techNote:    fields.techNote?.stringValue     || '-',
        waNote:      fields.waNote?.stringValue       || '-',
        status:      fields.status?.stringValue       || '-',
    };
}

async function getRecentRecords(limit = 5) {
    const result = await firestoreQuery({
        from: [{ collectionId: 'service_records' }],
        orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
        limit: limit
    });

    return result
        .filter(r => r.document)
        .map(r => {
            const f = r.document.fields;
            return {
                code:     f.code?.stringValue     || '-',
                customer: f.customer?.stringValue  || '-',
                unit:     f.unit?.stringValue      || '-',
                status:   f.status?.stringValue    || '-',
            };
        });
}

async function getPendingRecords() {
    const result = await firestoreQuery({
        from: [{ collectionId: 'service_records' }],
        where: {
            fieldFilter: {
                field: { fieldPath: 'status' },
                op: 'NOT_EQUAL',
                value: { stringValue: 'Selesai' }
            }
        },
        limit: 10
    });

    return result
        .filter(r => r.document)
        .map(r => {
            const f = r.document.fields;
            return {
                code:     f.code?.stringValue     || '-',
                customer: f.customer?.stringValue  || '-',
                unit:     f.unit?.stringValue      || '-',
                status:   f.status?.stringValue    || '-',
            };
        });
}

// ── Kirim WA via Fonnte ────────────────────────
async function kirimWA(target, pesan) {
    const form = new URLSearchParams();
    form.append('target', target.replace(/\D/g, ''));
    form.append('message', pesan);
    form.append('countryCode', '62');

    await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { 'Authorization': FONNTE_TOKEN },
        body: form
    });
}

// ── Format record detail ───────────────────────
function formatRecord(r) {
    const statusIcon = {
        'Pending': '⏳', 'Proses': '🔧', 'Selesai': '✅', 'Diambil': '📦'
    }[r.status] || '📌';

    return `📋 *DETAIL RECORD*
━━━━━━━━━━━━━━━━━━━━
🔖 *Kode       :* ${r.code}
📅 *Tanggal    :* ${r.date}
━━━━━━━━━━━━━━━━━━━━
👤 *Pelanggan  :* ${r.customer}
📱 *No. HP     :* ${r.phone}
━━━━━━━━━━━━━━━━━━━━
📦 *Unit       :* ${r.unit}
🏷️ *Tipe/Seri  :* ${r.description}
💬 *Keluhan    :* ${r.note}
━━━━━━━━━━━━━━━━━━━━
🔩 *Cek Teknisi:* ${r.techNote}
${r.waNote && r.waNote !== '-' ? '📝 *Catatan    :* ' + r.waNote + '\n' : ''}━━━━━━━━━━━━━━━━━━━━
📌 *Status     :* ${statusIcon} ${r.status}
━━━━━━━━━━━━━━━━━━━━`;
}

function formatMenu() {
    return `🤖 *PRIME MASTER BOT*
━━━━━━━━━━━━━━━━━━━━
Perintah yang tersedia:

🔍 */cek [kode]*
Cek detail record
_Contoh: /cek SMG-20260310-001_

📋 */pending*
Lihat semua unit pending

📊 */terbaru*
5 record terbaru

❓ */menu*
Tampilkan menu ini
━━━━━━━━━━━━━━━━━━━━`;
}

// ── Main handler ───────────────────────────────
exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 200, body: 'PRIME MASTER Bot OK' };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return { statusCode: 200, body: 'OK' };
    }

    const sender  = body.sender  || body.from || '';
    const message = (body.message || body.text || '').trim().toLowerCase();

    if (!sender || !message) return { statusCode: 200, body: 'OK' };

    // Hanya balas dari nomor admin (opsional — hapus if ini kalau mau semua bisa akses)
    // if (ADMIN_NUMBER && sender.replace(/\D/g,'') !== ADMIN_NUMBER.replace(/\D/g,'')) {
    //     return { statusCode: 200, body: 'OK' };
    // }

    let balasan = '';

    if (message === '/menu' || message === 'menu' || message === 'halo' || message === 'hi') {
        balasan = formatMenu();

    } else if (message.startsWith('/cek ') || message.startsWith('cek ')) {
        const kode = message.replace(/^\/?(cek)\s+/i, '').trim().toUpperCase();
        if (!kode) {
            balasan = '⚠️ Format: */cek SMG-20260310-001*';
        } else {
            const record = await getRecordByCode(kode);
            if (record) {
                balasan = formatRecord(record);
            } else {
                balasan = `❌ Kode *${kode}* tidak ditemukan.\n\nPastikan kode sudah benar.`;
            }
        }

    } else if (message === '/pending' || message === 'pending') {
        const records = await getPendingRecords();
        if (records.length === 0) {
            balasan = '✅ Tidak ada unit pending saat ini!';
        } else {
            balasan = `⏳ *UNIT PENDING (${records.length})*\n━━━━━━━━━━━━━━━━━━━━\n`;
            records.forEach((r, i) => {
                const icon = r.status === 'Proses' ? '🔧' : '⏳';
                balasan += `${i+1}. ${icon} *${r.code}*\n   👤 ${r.customer}\n   📦 ${r.unit}\n\n`;
            });
            balasan += '━━━━━━━━━━━━━━━━━━━━\nKetik */cek [kode]* untuk detail';
        }

    } else if (message === '/terbaru' || message === 'terbaru') {
        const records = await getRecentRecords(5);
        if (records.length === 0) {
            balasan = '📭 Belum ada record.';
        } else {
            balasan = `📊 *5 RECORD TERBARU*\n━━━━━━━━━━━━━━━━━━━━\n`;
            records.forEach((r, i) => {
                const icon = { 'Pending':'⏳','Proses':'🔧','Selesai':'✅','Diambil':'📦' }[r.status] || '📌';
                balasan += `${i+1}. ${icon} *${r.code}*\n   👤 ${r.customer}\n   📦 ${r.unit}\n\n`;
            });
            balasan += '━━━━━━━━━━━━━━━━━━━━\nKetik */cek [kode]* untuk detail';
        }

    } else {
        balasan = formatMenu();
    }

    if (balasan) {
        await kirimWA(sender, balasan);
    }

    return { statusCode: 200, body: 'OK' };
};
