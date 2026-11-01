/* =========================================================
   admin.js — Login custom (username/password) + dashboard
   Referensi RPC: admin_get_submissions_ukin, admin_get_stats_ukin, admin_update_score
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
// SESSION MANAGEMENT (RPC)
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
    const { data, error } = await supabaseClient.rpc('admin_login', { p_username: username, p_password: password });
    if (error) throw new Error(error.message || 'Login gagal');
    if (!data) throw new Error('Username atau password salah');
    return data;
}

async function doLogout() {
    const token = getToken();
    if (token) { try { await supabaseClient.rpc('admin_logout', { p_token: token }); } catch {} }
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
// SISTEM PENILAIAN (ESTIMASI & MANUAL)
// =========================================================
function calculateEstimatedScore(s) {
    let score = 0;
    const q1 = (s.q1_essay || '').toLowerCase();
    if (q1.includes('input') && q1.includes('process') && q1.includes('output')) score += 2;
    else if (q1.length > 20) score += 1;

    const q2 = (s.q2_essay || '').toLowerCase();
    if (q2.includes('keyboard') && (q2.includes('cpu') || q2.includes('proses')) && q2.includes('monitor')) score += 2;
    else if (q2.length > 20) score += 1;

    const q3 = (s.q3_essay || '').toLowerCase();
    if (q3.includes('ram') && (q3.includes('ssd') || q3.includes('hdd'))) score += 2;
    else if (q3.length > 20) score += 1;

    const q4 = (s.q4_essay || '').toLowerCase();
    if ((q4.includes('hilang') || q4.includes('terputus')) && q4.includes('ram')) score += 2;
    else if (q4.length > 20) score += 1;

    return score;
}

function getDisplayScore(s) {
    return s.final_score !== null && s.final_score !== undefined ? Number(s.final_score) : calculateEstimatedScore(s);
}

// =========================================================
// DASHBOARD DATA
// =========================================================
let allSubmissions = [];
let filtered = [];
let currentPage = 1;
const PAGE_SIZE = 10;
let activeDetailId = null;

async function loadDashboard() {
    await Promise.all([loadSubmissions(), loadStats()]);
}

async function loadStats() {
    const token = getToken();
    if (!token) return;
    try {
        // ⬇️ MENGGUNAKAN RPC admin_get_stats_ukin ⬇️
        const { data, error } = await supabaseClient.rpc('admin_get_stats_ukin', { p_token: token });
        if (error) throw error;
        const s = data || {};
        $('stat-visits').textContent = s.total_visits ?? 0;
        $('stat-submissions').textContent = s.total_submissions ?? 0;
        $('stat-classes').textContent = s.class_count ?? 0;
        
        if (allSubmissions.length > 0) {
            const totalScore = allSubmissions.reduce((acc, curr) => acc + getDisplayScore(curr), 0);
            $('stat-average').textContent = (totalScore / allSubmissions.length).toFixed(2);
        } else {
            $('stat-average').textContent = '0.00';
        }
    } catch (e) {
        if (/invalid|expired/i.test(e.message || '')) { handleSessionLost(); return; }
        console.warn('loadStats error', e);
    }
}

async function loadSubmissions() {
    const tbody = $('table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Memuat data...</td></tr>';
    const token = getToken();
    if (!token) return;
    try {
        // ⬇️ MENGGUNAKAN RPC admin_get_submissions_ukin ⬇️
        const { data, error } = await supabaseClient.rpc('admin_get_submissions_ukin', { p_token: token });
        if (error) throw error;
        allSubmissions = data || [];
        populateClassFilter();
        applyFilters();
    } catch (err) {
        if (/invalid|expired/i.test(err.message || '')) { handleSessionLost(); return; }
        console.error(err);
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Gagal memuat data. Pastikan RPC sudah benar.</td></tr>';
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
        if (date && !(s.created_at || '').startsWith(date)) return false; 
        return true;
    });
    
    const sort = $('sort-by')?.value || 'submitted_desc';
    filtered.sort((a, b) => {
        if (sort === 'submitted_asc') return new Date(a.created_at) - new Date(b.created_at);
        return new Date(b.created_at) - new Date(a.created_at);
    });
    
    currentPage = 1;
    renderTable();
}

function renderTable() {
    const tbody = $('table-body'); const pag = $('pagination');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Belum ada data exit ticket.</td></tr>';
        if (pag) pag.innerHTML = '';
        return;
    }
    const start = (currentPage - 1) * PAGE_SIZE;
    const page = filtered.slice(start, start + PAGE_SIZE);
    
    page.forEach((s, idx) => {
        const tr = document.createElement('tr');
        const num = document.createElement('td'); num.textContent = start + idx + 1;
        const name = document.createElement('td'); name.innerHTML = `<strong>${s.student_name || '-'}</strong><br><small>${s.class_name || '-'}</small>`;
        const group = document.createElement('td'); group.innerHTML = `${s.group_name || '-'}<br><small>${s.role_name || '-'}</small>`;
        const sub = document.createElement('td'); sub.textContent = formatDateTime(s.created_at);
        
        const finalScore = getDisplayScore(s);
        const isManual = s.final_score !== null && s.final_score !== undefined;
        const score = document.createElement('td'); 
        score.innerHTML = `<strong>${finalScore}</strong> / 8 ${isManual ? '<br><small style="color:var(--success)">✓ Manual</small>' : '<br><small style="color:var(--muted)">Belum dinilai</small>'}`;
        
        const act = document.createElement('td');
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline btn-sm'; btn.textContent = 'Periksa';
        btn.addEventListener('click', () => openDetail(s));
        act.appendChild(btn);
        
        tr.append(num, name, group, sub, score, act);
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
// DETAIL MODAL & UPDATE NILAI
// =========================================================
function openDetail(s) {
    const modal = $('detail-modal'); const title = $('detail-title'); const body = $('detail-body');
    if (!modal || !body) return;
    
    activeDetailId = s.id;
    title.textContent = `Periksa: ${s.student_name} — ${s.class_name}`;
    body.innerHTML = '';

    const addBlock = (h4, rows) => {
        const b = document.createElement('div'); b.className = 'detail-block';
        const h = document.createElement('h4'); h.textContent = h4; b.appendChild(h);
        rows.forEach(([k, v]) => {
            const p = document.createElement('p');
            const strong = document.createElement('strong'); strong.textContent = k + ': ';
            const span = document.createElement('span'); span.textContent = v || '-';
            p.append(strong, span); b.appendChild(p);
        });
        body.appendChild(b);
    };

    addBlock('Identitas', [
        ['Nama', s.student_name], ['Kelas', s.class_name], ['Kelompok', s.group_name], ['Peran', s.role_name]
    ]);
    
    addBlock('Bagian A — Exit Ticket (Uraian)', [
        ['Soal 1 (Klasifikasi)', s.q1_essay], 
        ['Soal 2 (Alur IPO)', s.q2_essay],
        ['Soal 3 (RAM & SSD)', s.q3_essay],
        ['Soal 4 (Risiko)', s.q4_essay]
    ]);
    
    addBlock('Bagian B — Refleksi', [
        ['Ceklis 1', s.ref_check_1], ['Ceklis 2', s.ref_check_2], ['Ceklis 3', s.ref_check_3],
        ['Hal dipahami', s.ref_text_1], ['Hal membingungkan', s.ref_text_2], ['Kontribusi', s.ref_text_3]
    ]);

    let peerText = '-';
    if (s.peer_assessment && Array.isArray(s.peer_assessment)) {
        peerText = s.peer_assessment.map(p => `${p.name} (${p.role}) - Skor: ${p.score} | Alasan: ${p.reason}`).join('\n\n');
    }
    addBlock('Penilaian Antarteman', [['Data Penilaian', peerText]]);

    // Setup Form Nilai
    const estScore = calculateEstimatedScore(s);
    $('est-score-label').textContent = estScore;
    $('input-final-score').value = s.final_score !== null && s.final_score !== undefined ? s.final_score : estScore;
    $('save-status').textContent = '';

    modal.classList.add('open');
}

$('btn-save-score')?.addEventListener('click', async () => {
    const score = parseFloat($('input-final-score').value);
    if (isNaN(score) || score < 0 || score > 8) {
        return showToast('Nilai harus berupa angka antara 0 sampai 8.', 'error');
    }
    if (!activeDetailId) return;

    const btn = $('btn-save-score');
    btn.disabled = true; btn.textContent = 'Menyimpan...';
    
    try {
        // ⬇️ MENGGUNAKAN RPC admin_update_score ⬇️
        const { error } = await supabaseClient.rpc('admin_update_score', {
            p_token: getToken(),
            p_id: activeDetailId,
            p_score: score
        });
        if (error) throw error;

        // Update data lokal
        const index = allSubmissions.findIndex(x => x.id === activeDetailId);
        if (index !== -1) allSubmissions[index].final_score = score;
        
        $('save-status').textContent = '✅ Nilai berhasil disimpan!';
        showToast('Nilai berhasil diperbarui.');
        
        applyFilters();
        loadStats();
        
    } catch (err) {
        console.error(err);
        showToast('Gagal menyimpan nilai: ' + (err.message || ''), 'error');
    } finally {
        btn.disabled = false; btn.textContent = 'Simpan Nilai';
    }
});

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
    const headers = ['Nama','Kelas','Kelompok','Peran','Waktu Kirim','Nilai Akhir',
        'Esai 1','Esai 2','Esai 3','Esai 4',
        'Ceklis 1','Ceklis 2','Ceklis 3',
        'Refleksi Paham','Refleksi Bingung','Refleksi Kontribusi',
        'Penilaian Teman (JSON)'];
        
    const rows = filtered.map((s) => [
        s.student_name, s.class_name, s.group_name, s.role_name, s.created_at, getDisplayScore(s),
        s.q1_essay, s.q2_essay, s.q3_essay, s.q4_essay,
        s.ref_check_1, s.ref_check_2, s.ref_check_3,
        s.ref_text_1, s.ref_text_2, s.ref_text_3,
        JSON.stringify(s.peer_assessment)
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
// TOOLBAR & BOOT
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
	
	(function waitForBadge() {
	  const badge = document.getElementById('nl-badge-frame');
	  
	  if (badge) {
		// Condition met: Element found, hide it
		badge.style.display = 'none';
	  } else {
		  console.log("finder",badge);
		// Condition not met: Wait 1000ms and try again
		setTimeout(waitForBadge, 1000);
	  }
	})();
});