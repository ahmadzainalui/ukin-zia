/* =========================================================
   admin.js — Login custom (username/password) + dashboard
   Semua data dibaca lewat RPC SECURITY DEFINER + token sesi.
   ========================================================= */

const $ = (id) => document.getElementById(id);
const TOKEN_KEY = 'sk_admin_token';

function showToast(msg, type = 'success') {
    const c = $('toast-container'); if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast ' + type; t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 4000);
}
function setLoginMessage(msg, type = 'error') {
    const el = $('login-message'); if (!el) return;
    if (!msg) { el.style.display = 'none'; return; }
    el.className = 'feedback ' + type; el.textContent = msg; el.style.display = 'block';
}
function showView(name) {
    $('login-view').style.display = (name === 'login') ? 'block' : 'none';
    $('dashboard-view').style.display = (name === 'dashboard') ? 'block' : 'none';
}

// =========================================================
// SESSION MANAGEMENT
// =========================================================
function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

async function verifySession() {
    const token = getToken();
    if (!token) return false;
    try {
        const { data, error } = await supabaseClient.rpc('admin_verify_session', { p_token: token });
        if (error || !data) { clearToken(); return false; }
        return true;
    } catch { clearToken(); return false; }
}

async function doLogin(username, password) {
    const { data, error } = await supabaseClient.rpc('admin_login', {
        p_username: username,
        p_password: password
    });
    if (error) {
        // Pesan dari RAISE EXCEPTION Postgres akan muncul di error.message
        throw new Error(error.message || 'Login gagal');
    }
    if (!data) throw new Error('Username atau password salah');
    return data;
}

async function doLogout() {
    const token = getToken();
    if (token) {
        try { await supabaseClient.rpc('admin_logout', { p_token: token }); } catch {}
    }
    clearToken();
}

// =========================================================
// LOGIN FORM
// =========================================================
$('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoginMessage('');
    const username = $('login-username').value.trim();
    const password = $('login-password').value;
    if (!username || !password) { setLoginMessage('Username dan password wajib diisi.', 'error'); return; }

    const btn = $('login-btn');
    btn.disabled = true; const orig = btn.textContent; btn.textContent = 'Memproses...';
    try {
        const token = await doLogin(username, password);
        setToken(token);
        $('admin-username').textContent = 'Login sebagai: ' + username;
        showView('dashboard');
        await loadDashboard();
        showToast('Login berhasil.');
    } catch (err) {
        setLoginMessage('Login gagal: ' + (err.message || 'Periksa username/password.'), 'error');
    } finally {
        btn.disabled = false; btn.textContent = orig;
    }
});

$('logout-btn')?.addEventListener('click', async () => {
    await doLogout();
    showView('login');
    setLoginMessage('Anda telah logout.', 'success');
});

// =========================================================
// DASHBOARD DATA
// =========================================================
let allSubmissions = [];
let filtered = [];
let currentPage = 1;
const PAGE_SIZE = 10;

async function loadDashboard() {
    await Promise.all([loadStats(), loadSubmissions()]);
}

async function loadStats() {
    const token = getToken();
    if (!token) return;
    try {
        const { data, error } = await supabaseClient.rpc('admin_get_stats', { p_token: token });
        if (error) throw error;
        const s = data || {};
        $('stat-visits').textContent = s.total_visits ?? 0;
        $('stat-submissions').textContent = s.total_submissions ?? 0;
        $('stat-average').textContent = s.average_score != null ? Number(s.average_score).toFixed(2) : '0.00';
        $('stat-classes').textContent = s.class_count ?? 0;

        const conf = s.confidence_summary || {};
        const wrap = $('confidence-summary');
        if (wrap) {
            wrap.innerHTML = '';
            const known = ['Sudah paham', 'Cukup paham, masih perlu latihan', 'Masih perlu bantuan'];
            known.forEach((k) => {
                const div = document.createElement('div');
                div.className = 'stat-card';
                const lab = document.createElement('div'); lab.className = 'label'; lab.textContent = k;
                const val = document.createElement('div'); val.className = 'value'; val.textContent = conf[k] ?? 0;
                div.append(lab, val);
                wrap.appendChild(div);
            });
        }
    } catch (e) {
        if (/invalid|expired/i.test(e.message || '')) { handleSessionLost(); return; }
        console.warn('loadStats error', e);
    }
}

async function loadSubmissions() {
    const tbody = $('table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Memuat data...</td></tr>';
    const token = getToken();
    if (!token) return;
    try {
        const { data, error } = await supabaseClient.rpc('admin_get_submissions', { p_token: token });
        if (error) throw error;
        allSubmissions = data || [];
        populateClassFilter();
        applyFilters();
    } catch (err) {
        if (/invalid|expired/i.test(err.message || '')) { handleSessionLost(); return; }
        console.error(err);
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Gagal memuat data.</td></tr>';
        showToast('Gagal memuat data: ' + (err.message || ''), 'error');
    }
}

function handleSessionLost() {
    clearToken();
    showView('login');
    setLoginMessage('Sesi berakhir. Silakan login kembali.', 'error');
}

function populateClassFilter() {
    const sel = $('filter-class'); if (!sel) return;
    const classes = [...new Set(allSubmissions.map((s) => s.class_name).filter(Boolean))].sort();
    sel.innerHTML = '<option value="">Semua Kelas</option>';
    classes.forEach((c) => {
        const o = document.createElement('option'); o.value = c; o.textContent = c;
        sel.appendChild(o);
    });
}

function applyFilters() {
    const q = ($('search-name')?.value || '').trim().toLowerCase();
    const cls = $('filter-class')?.value || '';
    const date = $('filter-date')?.value || '';
    filtered = allSubmissions.filter((s) => {
        if (q && !(s.student_name || '').toLowerCase().includes(q)) return false;
        if (cls && s.class_name !== cls) return false;
        if (date && s.activity_date !== date) return false;
        return true;
    });
    const sort = $('sort-by')?.value || 'submitted_desc';
    filtered.sort((a, b) => {
        if (sort === 'score_desc') return Number(b.score) - Number(a.score);
        if (sort === 'score_asc') return Number(a.score) - Number(b.score);
        if (sort === 'submitted_asc') return new Date(a.submitted_at) - new Date(b.submitted_at);
        return new Date(b.submitted_at) - new Date(a.submitted_at);
    });
    currentPage = 1;
    renderTable();
}

function renderTable() {
    const tbody = $('table-body'); const pag = $('pagination');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Belum ada data exit ticket.</td></tr>';
        if (pag) pag.innerHTML = '';
        return;
    }
    const start = (currentPage - 1) * PAGE_SIZE;
    const page = filtered.slice(start, start + PAGE_SIZE);
    page.forEach((s, idx) => {
        const tr = document.createElement('tr');
        const num = document.createElement('td'); num.textContent = start + idx + 1;
        const name = document.createElement('td'); name.textContent = s.student_name || '-';
        const cls = document.createElement('td'); cls.textContent = s.class_name || '-';
        const dateTd = document.createElement('td'); dateTd.textContent = s.activity_date || '-';
        const sub = document.createElement('td'); sub.textContent = formatDateTime(s.submitted_at);
        const score = document.createElement('td'); score.textContent = (Number(s.score) || 0).toFixed(1) + ' / 8';
        const act = document.createElement('td');
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline btn-sm'; btn.textContent = 'Lihat Detail';
        btn.addEventListener('click', () => openDetail(s));
        act.appendChild(btn);
        tr.append(num, name, cls, dateTd, sub, score, act);
        tbody.appendChild(tr);
    });
    renderPagination(pag);
}

function renderPagination(pag) {
    if (!pag) return;
    pag.innerHTML = '';
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const make = (label, page, disabled, active) => {
        const b = document.createElement('button');
        b.className = 'btn btn-sm ' + (active ? 'btn-primary' : 'btn-ghost');
        b.textContent = label; b.disabled = !!disabled;
        b.addEventListener('click', () => { currentPage = page; renderTable(); });
        return b;
    };
    pag.appendChild(make('«', Math.max(1, currentPage - 1), currentPage === 1, false));
    for (let p = 1; p <= totalPages; p++) {
        if (totalPages > 7 && p > 2 && p < totalPages - 1 && Math.abs(p - currentPage) > 1) {
            if (p === 3 || p === totalPages - 2) {
                const dots = document.createElement('span'); dots.textContent = '…'; dots.style.padding = '0 .5rem';
                pag.appendChild(dots);
            }
            continue;
        }
        pag.appendChild(make(String(p), p, false, p === currentPage));
    }
    pag.appendChild(make('»', Math.min(totalPages, currentPage + 1), currentPage === totalPages, false));
}

function formatDateTime(iso) {
    if (!iso) return '-';
    try {
        const d = new Date(iso);
        return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
}

// =========================================================
// DETAIL MODAL
// =========================================================
function openDetail(s) {
    const modal = $('detail-modal'); const title = $('detail-title'); const body = $('detail-body');
    if (!modal || !body) return;
    title.textContent = `Detail: ${s.student_name} — ${s.class_name}`;
    body.innerHTML = '';

    const addBlock = (h4, rows) => {
        const b = document.createElement('div'); b.className = 'detail-block';
        const h = document.createElement('h4'); h.textContent = h4; b.appendChild(h);
        rows.forEach(([k, v]) => {
            const p = document.createElement('p');
            const strong = document.createElement('strong'); strong.textContent = k + ': ';
            const span = document.createElement('span'); span.textContent = v ?? '-';
            p.append(strong, span); b.appendChild(p);
        });
        body.appendChild(b);
    };

    addBlock('Identitas', [
        ['Nama', s.student_name], ['Kelas', s.class_name],
        ['Tanggal Aktivitas', s.activity_date], ['Waktu Kirim', formatDateTime(s.submitted_at)],
        ['Skor', `${Number(s.score).toFixed(1)} / 8  (setara ${Math.round((Number(s.score) / 8) * 100)}/100)`]
    ]);
    addBlock('Bagian A — Exit Ticket', [
        ['Soal 1A (Keyboard)', s.q1_keyboard], ['Soal 1B (Monitor)', s.q1_monitor],
        ['Soal 2 · CPU', s.q2_cpu], ['Soal 2 · ALU', s.q2_alu],
        ['Soal 2 · CU', s.q2_cu], ['Soal 2 · Register', s.q2_register],
        ['Soal 3 (pilihan)', s.q3_ram_ssd_choice],
        ['Soal 4 · Input', s.q4_input], ['Soal 4 · Process', s.q4_process],
        ['Soal 4 · Output', s.q4_output], ['Soal 4 · Storage', s.q4_storage]
    ]);
    addBlock('Bagian B — Refleksi Murid', [
        ['Yang dipahami', s.reflection_understood],
        ['Yang membingungkan', s.reflection_confusing],
        ['Tingkat keyakinan', s.confidence_level]
    ]);

    modal.classList.add('open');
}

$('close-detail')?.addEventListener('click', () => $('detail-modal').classList.remove('open'));
$('detail-modal')?.addEventListener('click', (e) => { if (e.target.id === 'detail-modal') $('detail-modal').classList.remove('open'); });

// =========================================================
// CSV EXPORT
// =========================================================
function csvEscape(v) {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
$('export-csv')?.addEventListener('click', () => {
    if (!filtered.length) { showToast('Tidak ada data untuk diekspor.', 'error'); return; }
    const headers = ['Nama','Kelas','Tanggal','Waktu Kirim','Skor','Nilai(0-100)',
        'Q1 Keyboard','Q1 Monitor','Q2 CPU','Q2 ALU','Q2 CU','Q2 Register','Q3',
        'Q4 Input','Q4 Process','Q4 Output','Q4 Storage',
        'Refleksi Paham','Refleksi Bingung','Keyakinan'];
    const rows = filtered.map((s) => [
        s.student_name, s.class_name, s.activity_date, s.submitted_at, s.score,
        Math.round((Number(s.score) / 8) * 100),
        s.q1_keyboard, s.q1_monitor, s.q2_cpu, s.q2_alu, s.q2_cu, s.q2_register,
        s.q3_ram_ssd_choice, s.q4_input, s.q4_process, s.q4_output, s.q4_storage,
        s.reflection_understood, s.reflection_confusing, s.confidence_level
    ]);
    const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'exit_ticket_' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
});

// =========================================================
// TOOLBAR
// =========================================================
$('search-name')?.addEventListener('input', applyFilters);
$('filter-class')?.addEventListener('change', applyFilters);
$('filter-date')?.addEventListener('change', applyFilters);
$('sort-by')?.addEventListener('change', applyFilters);
$('refresh-btn')?.addEventListener('click', async () => {
    if (!(await verifySession())) { handleSessionLost(); return; }
    await loadDashboard();
    showToast('Data diperbarui.');
});

// =========================================================
// BOOT
// =========================================================
document.addEventListener('DOMContentLoaded', async () => {
    const saved = localStorage.getItem('sk_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);

    const valid = await verifySession();
    if (valid) {
        showView('dashboard');
        await loadDashboard();
    } else {
        showView('login');
    }
});