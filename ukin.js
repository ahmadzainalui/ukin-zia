/* =========================================================
   ukin.js — Logika halaman pembelajaran
   ========================================================= */

const byId = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// DATA KOMPONEN (Sesuai Tabel Ringkasan Fungsi Komponen PDF Hal. 41)
const COMPONENTS = [
    { id: 'keyboard', name: 'Keyboard', category: 'input', icon: '⌨️', desc: 'Memasukkan huruf dan perintah.' },
    { id: 'mouse', name: 'Mouse', category: 'input', icon: '🖱️', desc: 'Memasukkan gerakan dan klik untuk mengendalikan penunjuk serta memilih perintah.' },
    { id: 'cpu', name: 'CPU', category: 'proses', icon: '🧠', desc: 'Menjalankan instruksi program.' },
    { id: 'monitor', name: 'Monitor', category: 'output', icon: '🖥️', desc: 'Menampilkan teks dan hasil pemrosesan.' },
    { id: 'speaker', name: 'Speaker', category: 'output', icon: '🔊', desc: 'Menyajikan keluaran suara.' },
    { id: 'printer', name: 'Printer', category: 'output', icon: '🖨️', desc: 'Menghasilkan keluaran cetak pada kertas atau media lain.' }
];

// Data lengkap untuk Kartu Informasi (Mencakup Hardware, Memori, Storage, dan Software)
const INFO_CARDS = [
    ...COMPONENTS,
    { id: 'alu', name: 'ALU', icon: '🧮', desc: 'Menjalankan operasi aritmetika dan logika (Bagian CPU).' },
    { id: 'cu', name: 'CU', icon: '🎛️', desc: 'Mengatur pelaksanaan instruksi (Bagian CPU).' },
    { id: 'register', name: 'Register', icon: '📥', desc: 'Menampung informasi sementara yang dibutuhkan CPU (Bagian CPU).' },
    { id: 'ram', name: 'RAM', icon: '📀', desc: 'Menampung data dan instruksi yang sedang digunakan (Memori Utama).' },
    { id: 'ssd', name: 'SSD/HDD', icon: '💾', desc: 'Menyimpan berkas agar dapat digunakan kembali (Penyimpanan Sekunder).' },
    { id: 'word', name: 'Microsoft Word', icon: '📝', desc: 'Perangkat lunak pengolah kata untuk membuat dan menyunting dokumen.' },
    { id: 'excel', name: 'Microsoft Excel', icon: '📊', desc: 'Perangkat lunak pengolah angka untuk membuat tabel dan kalkulasi.' },
    { id: 'ppt', name: 'Microsoft PowerPoint', icon: '📽️', desc: 'Perangkat lunak presentasi untuk membuat slide presentasi.' }
];

const CATEGORY_LABELS = {
    input: 'Input', output: 'Output', proses: 'Process',
    memori: 'Memori Utama', storage: 'Penyimpanan Sekunder', software: 'Perangkat Lunak'
};

const OWNER_PROFILE = {
    name: 'Fauziah Anwar',
    role: 'Calon Guru Informatika',
    school: 'Universitas Pendidikan Indonesia',
    description: 'Mahasiswa PPG Prajabatan UPI yang berkomitmen menjadi guru yang menghadirkan pembelajaran Informatika yang inklusif, bermakna, dan mendorong setiap siswa berkembang sesuai potensinya.',
    photo: 'zia.png',
    purpose: 'Media pembelajaran interaktif Sistem Komputer untuk membantu murid memahami alur Input–Process–Output pada arsitektur Von Neumann.'
};

const VIDEO_EMBED_URL = 'https://www.youtube.com/embed/CJCvRDbFvcI'; 

function showToast(message, type = 'success') {
    const c = byId('toast-container');
    if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = message;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3500);
}

// NAVIGASI
const SLIDES = ['beranda', 'pemantik', 'tujuan', 'stimulus', 'dragdrop', 'alur', 'exit', 'profil'];
let currentSlide = 0;

function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= SLIDES.length) index = SLIDES.length - 1;
    currentSlide = index;

    document.querySelectorAll('.slide').forEach((el, i) => {
        el.classList.toggle('active', i === index);
        if (i === index) el.scrollTop = 0;
    });

    document.querySelectorAll('.nav-tab').forEach((tab, i) => {
        const active = i === index;
        tab.classList.toggle('active', active);
        if (active) tab.setAttribute('aria-current', 'page');
        else tab.removeAttribute('aria-current');
    });

    document.querySelectorAll('.slide-dot').forEach((dot, i) => dot.classList.toggle('active', i === index));
    byId('slide-prev').disabled = index === 0;
    byId('slide-next').disabled = index === SLIDES.length - 1;
    byId('slide-indicator').textContent = `${index + 1} / ${SLIDES.length}`;
}

function initSlides() {
    const dots = byId('slide-dots');
    SLIDES.forEach((s, i) => {
        const b = document.createElement('button');
        b.className = 'slide-dot';
        b.setAttribute('aria-label', `Ke slide ${i + 1}`);
        b.addEventListener('click', () => goToSlide(i));
        dots.appendChild(b);
    });
    document.querySelectorAll('.nav-tab').forEach(tab => tab.addEventListener('click', () => goToSlide(parseInt(tab.dataset.slide, 10))));
    document.querySelectorAll('[data-goto]').forEach(btn => btn.addEventListener('click', () => goToSlide(parseInt(btn.dataset.goto, 10))));
    byId('slide-prev')?.addEventListener('click', () => goToSlide(currentSlide - 1));
    byId('slide-next')?.addEventListener('click', () => goToSlide(currentSlide + 1));

    document.addEventListener('keydown', (e) => {
        if (['input', 'textarea', 'select'].includes(e.target.tagName.toLowerCase())) return;
        if (e.key === 'ArrowRight') { goToSlide(currentSlide + 1); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { goToSlide(currentSlide - 1); e.preventDefault(); }
    });
    goToSlide(0);
}

// TEMA
function initTheme() {
    const saved = localStorage.getItem('sk_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    if (byId('theme-select')) byId('theme-select').value = saved;
}
byId('theme-select')?.addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.value);
    localStorage.setItem('sk_theme', e.target.value);
});

// VISIT TRACKING
async function trackVisit() {
    let sid = sessionStorage.getItem('sk_session_id');
    if (!sid) {
        sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
        sessionStorage.setItem('sk_session_id', sid);
    }
    if (sessionStorage.getItem('sk_visit_logged') === 'true') return;
    try {
        const { error } = await supabaseClient.from('site_visits_ukin').insert({ session_id: sid, page_path: window.location.pathname || '/' });
        if (!error || error.code === '23505') sessionStorage.setItem('sk_visit_logged', 'true');
    } catch (e) { console.warn('Visit tracking gagal:', e); }
}

// VIDEO
function renderVideo() {
    const frame = byId('video-frame');
    if (!frame) return;
    if (VIDEO_EMBED_URL.trim()) {
        const iframe = document.createElement('iframe');
        iframe.src = VIDEO_EMBED_URL;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        frame.appendChild(iframe);
    } else {
        frame.innerHTML = '<div class="video-fallback-info">🎬 Video demonstrasi belum dikonfigurasi.</div>';
    }
}

// DRAG & DROP (1x PENEMPATAN)
let groupingPlaced = {};
let selectedGroupComp = null;

function makeGroupCard(comp, opts = {}) {
    const card = document.createElement('div');
    card.className = 'component-card';
    card.dataset.id = comp.id;
    
    if (opts.placed) {
        card.draggable = false;
        if (opts.correct !== undefined) card.classList.add(opts.correct ? 'correct' : 'incorrect');
    } else {
        card.draggable = true;
        card.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', comp.id));
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('info-btn')) return;
            selectedGroupComp = (selectedGroupComp === comp.id) ? null : comp.id;
            document.querySelectorAll('.component-card.selected').forEach((c) => c.classList.remove('selected'));
            if (selectedGroupComp) card.classList.add('selected');
        });
    }

    const icon = document.createElement('span'); icon.className = 'component-icon'; icon.textContent = comp.icon;
    const name = document.createElement('span'); name.className = 'component-name'; name.textContent = comp.name;
    const info = document.createElement('button'); info.type = 'button'; info.className = 'info-btn'; info.textContent = 'ℹ';
    info.addEventListener('click', (e) => { e.stopPropagation(); showToast(comp.name + ': ' + comp.desc); });

    card.append(icon, name, info);
    return card;
}

function renderGrouping() {
    const pool = byId('component-pool'); if (!pool) return;
    pool.innerHTML = '';
    
    COMPONENTS.forEach((comp) => {
        if (groupingPlaced[comp.id]) return;
        pool.appendChild(makeGroupCard(comp));
    });

    document.querySelectorAll('.category-zone').forEach((zone) => {
        const cat = zone.dataset.category;
        const container = zone.querySelector('.dropped-items');
        container.innerHTML = '';
        COMPONENTS.forEach((comp) => {
            const p = groupingPlaced[comp.id];
            if (p && p.category === cat) container.appendChild(makeGroupCard(comp, { placed: true, correct: p.correct }));
        });
    });
    updateGroupProgress();
}

function placeInGrouping(compId, categoryId) {
    if (groupingPlaced[compId]) return; // Kunci 1x penempatan
    
    const comp = COMPONENTS.find((c) => c.id === compId);
    if (!comp) return;
    
    const correct = comp.category === categoryId;
    groupingPlaced[comp.id] = { category: categoryId, correct };
    selectedGroupComp = null;
    renderGrouping();
    
    if (correct) showToast(`✅ ${comp.name} masuk ke ${CATEGORY_LABELS[categoryId]}.`);
    else showToast(`❌ ${comp.name} bukan ${CATEGORY_LABELS[categoryId]}. Tidak bisa dipindahkan lagi.`, 'error');
}

function updateGroupProgress() {
    const total = COMPONENTS.length;
    const correct = Object.values(groupingPlaced).filter((p) => p.correct).length;
    const bar = byId('group-progress-bar');
    const cnt = byId('group-progress');
    const success = byId('group-success');
    if (bar) bar.style.width = (correct / total * 100) + '%';
    if (cnt) cnt.textContent = `${correct} / ${total}`;
    if (success) success.style.display = (correct === total) ? 'block' : 'none';
}

function initGrouping() {
    renderGrouping();
    
    // Event listener dipasang di .category-zone agar seluruh area kotak bisa menerima drop
    document.querySelectorAll('.category-zone').forEach((zone) => {
        const cat = zone.dataset.category;
        
        zone.addEventListener('dragover', (e) => { 
            e.preventDefault(); 
            zone.classList.add('drag-over'); 
        });
        
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        
        zone.addEventListener('drop', (e) => {
            e.preventDefault(); 
            zone.classList.remove('drag-over');
            const id = e.dataTransfer.getData('text/plain');
            if (id) placeInGrouping(id, cat);
        });
        
        zone.addEventListener('click', (e) => {
            // Cegah bentrok jika yang diklik adalah kartu yang sudah ada di dalamnya
            if (e.target.closest('.component-card')) return;
            if (selectedGroupComp) placeInGrouping(selectedGroupComp, cat);
        });
    });

    byId('group-reset')?.addEventListener('click', () => {
        groupingPlaced = {}; 
        selectedGroupComp = null; 
        renderGrouping();
    });
}

// BANK DATA
function initBankData() {
    const toggle = byId('bank-data-toggle'), content = byId('bank-data-content'), body = byId('bank-data-body');
    if (!toggle || !content || !body) return;

    // Acak urutan kartu informasi
    const shuffledCards = [...INFO_CARDS].sort(() => Math.random() - 0.5);

    shuffledCards.forEach((it) => {
        // Membuat kartu informasi yang rapi
        body.innerHTML += `
            <div class="bank-item" style="display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.75rem; background: var(--surface-2); border-radius: var(--radius-sm); border: 1px solid var(--border);">
                <span class="icon" style="font-size: 1.5rem;">${it.icon}</span>
                <div style="font-size: 0.85rem;">
                    <strong style="display: block; color: var(--text); margin-bottom: 0.25rem;">${it.name}</strong>
                    <span class="desc" style="color: var(--muted); line-height: 1.4;">${it.desc}</span>
                </div>
            </div>
        `;
    });

    toggle.addEventListener('click', () => {
        if (content.hasAttribute('hidden')) {
            content.removeAttribute('hidden');
            toggle.textContent = '📚 Sembunyikan Kartu Informasi';
        } else {
            content.setAttribute('hidden', '');
            toggle.textContent = '📚 Lihat Kartu Informasi';
        }
    });
}

// IPO BUILDER & SIMULATION
// IPO BUILDER & SIMULATION
const IPO_SLOTS = ['input', 'process', 'output', 'storage'];
const IPO_CORRECT = { input: 'keyboard', process: 'cpu', output: 'monitor', storage: 'ssd' };

// Daftar komponen khusus untuk disusun di bagian IPO (termasuk SSD/HDD)
const IPO_COMPONENTS = [
    { id: 'keyboard', name: 'Keyboard', icon: '⌨️' },
    { id: 'cpu', name: 'CPU', icon: '🧠' },
    { id: 'monitor', name: 'Monitor', icon: '🖥️' },
    { id: 'ssd', name: 'SSD/HDD', icon: '💾' },
    // Distraktor (pengganggu agar murid berpikir)
    { id: 'ram', name: 'RAM', icon: '📀' }
];

let ipoPlaced = { input: null, process: null, output: null, storage: null };
let selectedIpoChip = null;
let currentSimText = ''; 

function makeIpoChip(comp) {
    const chip = document.createElement('button');
    chip.type = 'button'; chip.className = 'ipo-chip'; chip.dataset.id = comp.id; chip.draggable = true;
    chip.innerHTML = `<span>${comp.icon}</span><span>${comp.name}</span>`;
    chip.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', comp.id));
    chip.addEventListener('click', () => {
        selectedIpoChip = (selectedIpoChip === comp.id) ? null : comp.id;
        document.querySelectorAll('.ipo-chip.selected').forEach((c) => c.classList.remove('selected'));
        if (selectedIpoChip) chip.classList.add('selected');
    });
    return chip;
}

function renderIpo() {
    const pool = byId('ipo-pool'); if (!pool) return;
    pool.innerHTML = '';
    const used = Object.values(ipoPlaced).filter(Boolean);
    
    // Render dari IPO_COMPONENTS
    IPO_COMPONENTS.forEach((comp) => {
        if (used.includes(comp.id)) return;
        pool.appendChild(makeIpoChip(comp));
    });

    IPO_SLOTS.forEach((slot) => {
        const slotEl = document.querySelector(`.ipo-slot[data-position="${slot}"]`);
        const drop = slotEl?.querySelector('.slot-drop');
        if (!drop) return;
        drop.innerHTML = '';
        slotEl.classList.remove('correct', 'incorrect');
        if (ipoPlaced[slot]) {
            const comp = IPO_COMPONENTS.find((c) => c.id === ipoPlaced[slot]);
            if (comp) drop.appendChild(makeIpoChip(comp));
        }
    });
}

function placeIpoChip(compId, slot) {
    IPO_SLOTS.forEach((s) => { if (ipoPlaced[s] === compId) ipoPlaced[s] = null; });
    ipoPlaced[slot] = compId;
    selectedIpoChip = null;
    renderIpo();
}

function initIpo() {
    renderIpo();
    IPO_SLOTS.forEach((slot) => {
        const slotEl = document.querySelector(`.ipo-slot[data-position="${slot}"]`);
        if (!slotEl) return;
        slotEl.addEventListener('dragover', (e) => { e.preventDefault(); slotEl.classList.add('drag-over'); });
        slotEl.addEventListener('dragleave', () => slotEl.classList.remove('drag-over'));
        slotEl.addEventListener('drop', (e) => {
            e.preventDefault(); slotEl.classList.remove('drag-over');
            const id = e.dataTransfer.getData('text/plain');
            if (id) placeIpoChip(id, slot);
        });
        slotEl.addEventListener('click', () => {
            if (selectedIpoChip) placeIpoChip(selectedIpoChip, slot);
        });
    });

    byId('ipo-check')?.addEventListener('click', () => {
        let ok = true;
        IPO_SLOTS.forEach((slot) => {
            const slotEl = document.querySelector(`.ipo-slot[data-position="${slot}"]`);
            if (!slotEl) return;
            slotEl.classList.remove('correct', 'incorrect');
            if (ipoPlaced[slot] === IPO_CORRECT[slot]) slotEl.classList.add('correct');
            else { slotEl.classList.add('incorrect'); ok = false; }
        });
        const fb = byId('ipo-feedback');
        if (ok) {
            fb.className = 'feedback success'; fb.textContent = '✅ Susunan benar!';
        } else {
            fb.className = 'feedback error'; fb.textContent = '❌ Susunan belum tepat. Periksa kembali.';
        }
    });

    byId('ipo-reset')?.addEventListener('click', () => {
        ipoPlaced = { input: null, process: null, output: null, storage: null };
        selectedIpoChip = null; renderIpo();
        const fb = byId('ipo-feedback'); fb.className = 'feedback'; fb.textContent = '';
    });

    byId('sim-run')?.addEventListener('click', runIpoSimulation);
    byId('sim-reset')?.addEventListener('click', () => {
        byId('sim-input').value = ''; byId('sim-steps').innerHTML = ''; byId('monitor-display').textContent = ''; byId('sim-save').style.display = 'none';
    });
        byId('sim-save')?.addEventListener('click', async () => {
        const btn = byId('sim-save'); 
        const pdfContent = byId('sim-pdf-content');
        const dateNow = new Date().toLocaleString('id-ID');

        // 1. Ubah status tombol
        btn.disabled = true; 
        btn.classList.remove('btn-shake'); // Hentikan goyangan
        btn.textContent = 'Menyimpan ke Disk...';

        // 2. Siapkan konten PDF (Tampilan dokumen palsu)
        pdfContent.innerHTML = `
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 30px;">
                <h2 style="margin: 0; font-size: 24px; color: #000;">DOKUMEN SIMULASI KOMPUTER</h2>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #555;">Arsitektur Von Neumann - Input Process Output</p>
            </div>
            
            <table style="width: 100%; margin-bottom: 30px; font-size: 14px; color: #000;">
                <tr><td style="width: 120px;"><strong>Waktu Unduh</strong></td><td>: ${dateNow}</td></tr>
                <tr><td><strong>Lokasi File</strong></td><td>: Penyimpanan Sekunder (SSD/HDD/SD Card)</td></tr>
                <tr><td><strong>Status</strong></td><td>: <span style="color: green; font-weight: bold;">BERHASIL DISIMPAN</span></td></tr>
            </table>

            <div style="border: 2px dashed #666; padding: 25px; min-height: 150px; background: #fafafa;">
                <p style="margin-top: 0; font-size: 12px; color: #666;"><em>Isi Dokumen:</em></p>
                <p style="font-size: 20px; font-family: 'Courier New', monospace; word-wrap: break-word;">${currentSimText}</p>
            </div>
            
            <div style="margin-top: 40px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 15px;">
                <p>File ini diunduh secara otomatis dari simulasi pembelajaran Sistem Komputer.</p>
            </div>
        `;

        // 3. Proses menjadi PDF dan unduh
        const opt = {
            margin:       15,
            filename:     `Dokumen_Simulasi_${currentSimText.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            // Jalankan html2pdf
            await html2pdf().set(opt).from(pdfContent).save();
            
            // 4. Notifikasi berhasil
            showToast('💾 Berhasil! Dokumen tersimpan di SSD/HDD/SD Card Anda.', 'success');
            
            // Ubah teks tombol sementara
            btn.textContent = '✅ Dokumen Tersimpan';
            
            // Kembalikan tombol seperti semula setelah 3 detik
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = '💾 Simpan Dokumen';
                btn.classList.add('btn-shake'); // Goyang lagi
            }, 3000);
            
        } catch (err) {
            console.error(err);
            showToast('❌ Gagal menyimpan dokumen.', 'error');
            btn.disabled = false;
            btn.textContent = '💾 Simpan Dokumen';
            btn.classList.add('btn-shake');
        }
    });
}

async function runIpoSimulation() {
    const text = byId('sim-input').value.trim();
    const steps = byId('sim-steps'), monitor = byId('monitor-display'), saveBtn = byId('sim-save');
    
    if (!text) return showToast('Masukkan teks/operasi.', 'error');
    
    steps.innerHTML = ''; monitor.textContent = ''; saveBtn.style.display = 'none';
    
    // 1. Cek apakah MURNI angka (contoh: "10+2")
    const pureArith = text.match(/^(\d+)\s*([+\-*/])\s*(\d+)$/);
    // 2. Cek apakah CAMPURAN teks & angka (contoh: "berapa 10 + 2")
    const mixedArith = text.match(/(\d+)\s*([+\-*/])\s*(\d+)/);

    if (pureArith) {
        await runArithmetic(pureArith, steps, monitor);
    } else if (mixedArith) {
        await runMixedSimulation(text, mixedArith, steps, monitor);
    } else {
        await runTyping(text.slice(0, 25), steps, monitor);
    }
    
    // Tampilkan tombol simpan setelah selesai
    saveBtn.style.display = 'inline-flex';
    saveBtn.classList.add('btn-shake');
}

function appendStep(container, text) {
    const div = document.createElement('div'); div.className = 'sim-step'; div.textContent = text; container.appendChild(div);
}

async function runArithmetic(match, steps, monitor) {
    const a = parseInt(match[1]), op = match[2], b = parseInt(match[3]);
    let result = op === '+' ? a+b : op === '-' ? a-b : op === '*' ? a*b : (b===0?'NaN':a/b);
    
    // Simpan teks ke variabel global untuk keperluan cetak PDF
    currentSimText = `${a} ${op} ${b} = ${result}`;
    
    const lines = [
        `CU menerima instruksi untuk melakukan operasi ${op} pada angka ${a} dan ${b}.`,
        `Instruksi dan data angka ditampung sementara di RAM (Memori Utama).`,
        `CU mengambil instruksi dan data tersebut dari RAM, lalu mengirimkannya ke ALU.`,
        `ALU melakukan kalkulasi aritmatika: ${a} ${op} ${b} = ${result}.`,
        `Hasil kalkulasi (${result}) disimpan di Register ACC (bagian dari CPU).`,
        `CU mengambil hasil dari Register ACC dan mengirimkannya ke layar.`,
        `Monitor menampilkan hasil: ${result}`
    ];
    
    for (let i = 0; i < lines.length; i++) {
        await sleep(800); 
        appendStep(steps, lines[i]);
        if (i === lines.length - 1) monitor.textContent = currentSimText;
    }
}

async function runTyping(text, steps, monitor) {
    let cursor = 100, displayed = '';
    currentSimText = text; // Simpan teks untuk PDF
    
    for (let i = 0; i < text.length; i++) {
        const ch = text[i], bin = ch.charCodeAt(0).toString(2).padStart(8, '0');
        const newCursor = cursor + 10; displayed += ch;
        
        const line = `Keyboard mengirim kode biner ${bin} (ASCII '${ch}'). Data ditampung sementara di RAM. CU mengambil instruksi dari RAM, lalu ALU menghitung posisi kursor (${cursor} + 10 = ${newCursor}). Register ACC menyimpan hasilnya, dan instruksi dikirim ke Monitor untuk menampilkan '${displayed}'.`;
        
        await sleep(600); 
        appendStep(steps, line);
        monitor.textContent = displayed; 
        cursor = newCursor;
    }
}

async function runMixedSimulation(originalText, match, steps, monitor) {
    const a = parseInt(match[1]), op = match[2], b = parseInt(match[3]);
    let result = op === '+' ? a+b : op === '-' ? a-b : op === '*' ? a*b : (b===0?'NaN':a/b);
    
    const finalText = `${originalText} = ${result}`;
    currentSimText = finalText; // Simpan hasil campuran untuk PDF

    // Tahap 1: Simulasi Mengetik Teks
    let cursor = 100, displayed = '';
    for (let i = 0; i < originalText.length; i++) {
        const ch = originalText[i], bin = ch.charCodeAt(0).toString(2).padStart(8, '0');
        const newCursor = cursor + 10; displayed += ch;
        await sleep(200); // Kecepatan ketik lebih cepat
        appendStep(steps, `Keyboard mengirim kode biner ${bin} (ASCII '${ch}'). Data ditampung sementara di RAM. Layar menampilkan '${displayed}'.`);
        monitor.textContent = displayed; cursor = newCursor;
    }

    // Tahap 2: Simulasi Kalkulasi ALU
    await sleep(800);
    appendStep(steps, `Sistem mendeteksi adanya instruksi matematika: ${a} ${op} ${b}.`);
    await sleep(800);
    appendStep(steps, `Instruksi dan data angka ditampung sementara di RAM (Memori Utama).`);
    await sleep(800);
    appendStep(steps, `CU mengambil instruksi dan data tersebut dari RAM, lalu mengirimkannya ke ALU.`);
    await sleep(800);
    appendStep(steps, `ALU melakukan kalkulasi aritmatika: ${a} ${op} ${b} = ${result}.`);
    await sleep(800);
    appendStep(steps, `Hasil kalkulasi (${result}) disimpan di Register ACC (bagian dari CPU).`);
    await sleep(800);
    appendStep(steps, `CU mengirimkan hasil kalkulasi ke layar.`);
    await sleep(800);
    appendStep(steps, `Monitor menampilkan hasil akhir: ${finalText}`);
    
    monitor.textContent = finalText;
}

function appendStep(container, text) {
    const div = document.createElement('div'); div.className = 'sim-step'; div.textContent = text; container.appendChild(div);
}

async function runArithmetic(match, steps, monitor) {
    const a = parseInt(match[1]), op = match[2], b = parseInt(match[3]);
    let result = op === '+' ? a+b : op === '-' ? a-b : op === '*' ? a*b : (b===0?'NaN':a/b);
    
    // Alur disesuaikan dengan peran RAM sebagai memori pendukung/utama
    const lines = [
        `CU menerima instruksi untuk melakukan operasi ${op} pada angka ${a} dan ${b}.`,
        `Instruksi dan data angka ditampung sementara di RAM (Memori Utama).`,
        `CU mengambil instruksi dan data tersebut dari RAM, lalu mengirimkannya ke ALU.`,
        `ALU melakukan kalkulasi aritmatika: ${a} ${op} ${b} = ${result}.`,
        `Hasil kalkulasi (${result}) disimpan di Register ACC (bagian dari CPU).`,
        `CU mengambil hasil dari Register ACC dan mengirimkannya ke layar.`,
        `Monitor menampilkan hasil: ${result}`
    ];
    
    for (let i = 0; i < lines.length; i++) {
        await sleep(800); // Sedikit diperlambat agar murid bisa membaca
        appendStep(steps, lines[i]);
        if (i === lines.length - 1) monitor.textContent = String(result);
    }
}

async function runTyping(text, steps, monitor) {
    let cursor = 100, displayed = '';
    for (let i = 0; i < text.length; i++) {
        const ch = text[i], bin = ch.charCodeAt(0).toString(2).padStart(8, '0');
        const newCursor = cursor + 10; displayed += ch;
        
        // Alur mengetik dengan penjelasan peran RAM
        const line = `Keyboard mengirim kode biner ${bin} (ASCII '${ch}'). Data ditampung sementara di RAM. CU mengambil instruksi dari RAM, lalu ALU menghitung posisi kursor (${cursor} + 10 = ${newCursor}). Register ACC menyimpan hasilnya, dan instruksi dikirim ke Monitor untuk menampilkan '${displayed}'.`;
        
        await sleep(800); // Sedikit diperlambat agar murid bisa membaca
        appendStep(steps, line);
        monitor.textContent = displayed; 
        cursor = newCursor;
    }
}

// EXIT TICKET (OTOMATIS KIRIM & SIMPAN PDF)
// EXIT TICKET (OTOMATIS KIRIM & SIMPAN PDF)
function initExitForm() {
    const form = byId('exit-form');
    if (!form) return;

    // ==========================================
    // LOGIKA UNIK PERAN (TIDAK BOLEH GANDA)
    // ==========================================
    const roleSelects = document.querySelectorAll('.role-select');
    let previousValues = {}; // Menyimpan nilai sebelumnya

    // Simpan nilai awal
    roleSelects.forEach(select => {
        previousValues[select.id] = select.value;
    });

    roleSelects.forEach(select => {
        select.addEventListener('change', function() {
            const currentId = this.id;
            const currentValue = this.value;
            
            // Cari apakah ada select lain yang memilih peran yang sama
            let duplicateSelect = null;
            roleSelects.forEach(otherSelect => {
                if (otherSelect.id !== currentId && otherSelect.value === currentValue && currentValue !== "") {
                    duplicateSelect = otherSelect;
                }
            });

            if (duplicateSelect) {
                const confirmChange = confirm(`Peran "${currentValue}" sudah dipilih sebelumnya. Yakin ingin mengganti? Pilihan sebelumnya akan dihapus.`);
                if (confirmChange) {
                    // Hapus pilihan di select yang lama
                    duplicateSelect.value = "";
                    previousValues[duplicateSelect.id] = "";
                    // Perbarui nilai sebelumnya untuk select saat ini
                    previousValues[currentId] = currentValue;
                } else {
                    // Kembalikan ke nilai sebelumnya jika batal
                    this.value = previousValues[currentId];
                }
            } else {
                // Tidak ada duplikat, perbarui nilai
                previousValues[currentId] = currentValue;
            }
        });
    });

    // ==========================================
    // PROSES SUBMIT FORM
    // ==========================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Validasi Identitas
        const identityFields = [
            { id: 'student-name', label: 'Nama Murid', isSelect: false },
            { id: 'class-name', label: 'Kelas', isSelect: false },
            { id: 'group-name', label: 'Kelompok', isSelect: false },
            { id: 'role-name', label: 'Peran', isSelect: true }
        ];
        for (let f of identityFields) {
            const val = byId(f.id).value;
            if (!f.isSelect && !val.trim()) return showToast(`⚠️ Mohon isi kolom ${f.label} pada Identitas Murid.`, 'error');
            if (f.isSelect && !val) return showToast(`⚠️ Mohon pilih ${f.label} pada Identitas Murid.`, 'error');
        }

        // 2. Validasi Esai
        const essayFields = [
            { id: 'q1_essay', label: 'Soal 1' },
            { id: 'q2_essay', label: 'Soal 2' },
            { id: 'q3_essay', label: 'Soal 3' },
            { id: 'q4_essay', label: 'Soal 4' }
        ];
        for (let f of essayFields) {
            if (!byId(f.id).value.trim()) return showToast(`⚠️ Mohon jawab ${f.label} pada Bagian A (Exit Ticket).`, 'error');
        }

        // 3. Validasi Ceklis
        const check1 = document.querySelector('input[name="ref_check_1"]:checked');
        const check2 = document.querySelector('input[name="ref_check_2"]:checked');
        const check3 = document.querySelector('input[name="ref_check_3"]:checked');
        if (!check1) return showToast('⚠️ Mohon pilih status untuk Ceklis 1 (Klasifikasi komponen).', 'error');
        if (!check2) return showToast('⚠️ Mohon pilih status untuk Ceklis 2 (Alur IPO).', 'error');
        if (!check3) return showToast('⚠️ Mohon pilih status untuk Ceklis 3 (RAM & SSD/HDD).', 'error');

        // 4. Validasi Teks Refleksi
        const reflectionFields = [
            { id: 'ref_text_1', label: 'Poin 1 (Hal yang sudah dipahami)' },
            { id: 'ref_text_2', label: 'Poin 2 (Bagian yang membingungkan)' },
            { id: 'ref_text_3', label: 'Poin 3 (Kontribusi pada kelompok)' }
        ];
        for (let f of reflectionFields) {
            if (!byId(f.id).value.trim()) return showToast(`⚠️ Mohon isi Refleksi ${f.label}.`, 'error');
        }

        // 5. Validasi Penilaian Teman
        const peerAssessment = [];
        for (let i = 1; i <= 3; i++) {
            const name = byId(`peer${i}-name`).value.trim();
            const role = byId(`peer${i}-role`).value; // Dropdown value
            const score = byId(`peer${i}-score`).value;
            const reason = byId(`peer${i}-reason`).value.trim();

            if (!name || !role || !score || !reason) {
                return showToast(`⚠️ Mohon lengkapi Penilaian Teman pada baris ke-${i} (Nama, Peran, Skor, dan Alasan).`, 'error');
            }
            if (score < 1 || score > 4) {
                return showToast(`⚠️ Skor untuk teman ke-${i} harus antara 1 sampai 4.`, 'error');
            }
            peerAssessment.push({ name, role, score, reason });
        }

        // Kumpulkan Data
        const data = {
            student_name: byId('student-name').value.trim(),
            class_name: byId('class-name').value.trim(),
            group_name: byId('group-name').value.trim(),
            role_name: byId('role-name').value, // Dropdown value
            q1_essay: byId('q1_essay').value.trim(),
            q2_essay: byId('q2_essay').value.trim(),
            q3_essay: byId('q3_essay').value.trim(),
            q4_essay: byId('q4_essay').value.trim(),
            ref_check_1: check1.value,
            ref_check_2: check2.value,
            ref_check_3: check3.value,
            ref_text_1: byId('ref_text_1').value.trim(),
            ref_text_2: byId('ref_text_2').value.trim(),
            ref_text_3: byId('ref_text_3').value.trim(),
            peer_assessment: peerAssessment
        };

        const btn = byId('submit-btn'); 
        btn.disabled = true; 
        btn.textContent = 'Mengirim & Menyiapkan PDF...';

        try {
            const { error } = await supabaseClient.from('exit_ticket_submissions_ukin').insert(data);
            if (error) throw error;
            
            showToast('✅ Jawaban berhasil dikirim ke database!');
            
            generateReceiptHTML(data);
            
            const element = byId('pdf-receipt');
            const opt = {
                margin:       10,
                filename:     `Exit_Ticket_${data.student_name.replace(/\s+/g, '_')}_${data.class_name}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save().then(() => {
                showToast('📄 File PDF berhasil diunduh!');
                form.reset(); 
                // Reset dropdown values dan previousValues
                roleSelects.forEach(s => previousValues[s.id] = "");
                btn.style.display = 'none'; 
            });

        } catch (err) {
            console.error(err);
            showToast('❌ Gagal mengirim: ' + (err.message || 'Periksa koneksi Anda.'), 'error');
            btn.disabled = false; 
            btn.textContent = 'Kirim Exit Ticket dan Simpan PDF';
        }
    });

    // Fungsi untuk merender HTML khusus cetak/PDF
    function generateReceiptHTML(data) {
        const receipt = byId('pdf-receipt');
        const dateNow = new Date().toLocaleString('id-ID');
        
        let peerHtml = data.peer_assessment.map(p => `
            <li><strong>${p.name}</strong> (${p.role}) - Skor: ${p.score} <br><i>Alasan: ${p.reason}</i></li>
        `).join('');

        receipt.innerHTML = `
            <div style="text-align: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 22px;">BUKTI PENGUMPULAN EXIT TICKET</h2>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Sistem Komputer • Model Input-Process-Output pada Arsitektur Von Neumann</p>
            </div>
            
            <table style="width: 100%; margin-bottom: 25px; font-size: 14px; border-collapse: collapse;">
                <tr><td style="width: 130px; padding: 4px 0;"><strong>Nama Murid</strong></td><td>: ${data.student_name}</td></tr>
                <tr><td style="padding: 4px 0;"><strong>Kelas</strong></td><td>: ${data.class_name}</td></tr>
                <tr><td style="padding: 4px 0;"><strong>Kelompok</strong></td><td>: ${data.group_name}</td></tr>
                <tr><td style="padding: 4px 0;"><strong>Peran</strong></td><td>: ${data.role_name}</td></tr>
                <tr><td style="padding: 4px 0;"><strong>Waktu Kirim</strong></td><td>: ${dateNow}</td></tr>
            </table>

            <h3 style="font-size: 16px; background: #f0f0f0; padding: 8px; margin-bottom: 15px;">Bagian A — Exit Ticket (Esai)</h3>
            <div style="font-size: 14px; margin-bottom: 25px; line-height: 1.6;">
                <p style="margin-bottom: 10px;"><strong>1. Klasifikasi Komponen:</strong><br>${data.q1_essay}</p>
                <p style="margin-bottom: 10px;"><strong>2. Alur IPO:</strong><br>${data.q2_essay}</p>
                <p style="margin-bottom: 10px;"><strong>3. Analisis RAM & SSD/HDD:</strong><br>${data.q3_essay}</p>
                <p style="margin-bottom: 10px;"><strong>4. Risiko Kehilangan Data:</strong><br>${data.q4_essay}</p>
            </div>

            <h3 style="font-size: 16px; background: #f0f0f0; padding: 8px; margin-bottom: 15px;">Bagian B — Refleksi Diri</h3>
            <div style="font-size: 14px; margin-bottom: 25px; line-height: 1.6;">
                <p style="margin-bottom: 5px;"><strong>1. Hal yang dipahami:</strong> ${data.ref_text_1}</p>
                <p style="margin-bottom: 5px;"><strong>2. Hal yang membingungkan:</strong> ${data.ref_text_2}</p>
                <p style="margin-bottom: 15px;"><strong>3. Kontribusi pada kelompok:</strong> ${data.ref_text_3}</p>
                <p style="margin-bottom: 5px;"><strong>Ceklis Pemahaman:</strong></p>
                <ul style="margin-top: 5px; padding-left: 20px;">
                    <li>Klasifikasi Komponen: <strong>${data.ref_check_1}</strong></li>
                    <li>Alur IPO: <strong>${data.ref_check_2}</strong></li>
                    <li>RAM & SSD/HDD: <strong>${data.ref_check_3}</strong></li>
                </ul>
            </div>

            <h3 style="font-size: 16px; background: #f0f0f0; padding: 8px; margin-bottom: 15px;">Penilaian Antarteman</h3>
            <ul style="font-size: 14px; line-height: 1.6; padding-left: 20px; margin-bottom: 30px;">
                ${peerHtml}
            </ul>
            
            <div style="text-align: center; margin-top: 50px; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 15px;">
                <p>Dokumen ini dihasilkan secara otomatis oleh sistem sebagai bukti pengumpulan tugas.</p>
            </div>
        `;
    }
}

// PROFIL
function initProfile() {
    if (byId('owner-name')) byId('owner-name').textContent = OWNER_PROFILE.name;
    if (byId('owner-role')) byId('owner-role').textContent = OWNER_PROFILE.role;
    if (byId('owner-school')) byId('owner-school').textContent = OWNER_PROFILE.school;
    if (byId('owner-description')) byId('owner-description').textContent = OWNER_PROFILE.description;
    if (byId('owner-purpose')) byId('owner-purpose').textContent = 'Tujuan: ' + OWNER_PROFILE.purpose;
    
    const photo = byId('owner-photo');
    if (photo && OWNER_PROFILE.photo) {
        const img = document.createElement('img');
        img.src = OWNER_PROFILE.photo; img.style.width = '100%'; img.style.height = '100%'; img.style.borderRadius = '50%'; img.style.objectFit = 'cover';
        photo.innerHTML = ''; photo.appendChild(img);
    }
}

async function runFallbackSimulation() {
    const monitor = byId('fallback-monitor');
    const status = byId('fallback-status');
    const btn = byId('fallback-play');
    if (!monitor || !status || !btn) return;
    btn.disabled = true; btn.textContent = 'Menjalankan...';
    monitor.textContent = ''; status.textContent = 'Menunggu input...';
    const text = 'AKU';
    await sleep(400);
    status.textContent = '⌨️ Mengetik pada keyboard...';
    for (let i = 0; i < text.length; i++) {
        await sleep(500);
        monitor.textContent += text[i];
        status.textContent = `🧠 CPU memproses '${text[i]}' — layar menampilkan "${monitor.textContent}"`;
    }
    await sleep(600);
    status.textContent = '💾 Menekan tombol Simpan...';
    await sleep(700);
    status.textContent = '✅ Dokumen tersimpan ke SSD/HDD (simulasi).';
    btn.disabled = false; btn.textContent = '▶ Jalankan Simulasi Otomatis';
}

// BOOT
document.addEventListener('DOMContentLoaded', () => {
    initTheme(); initSlides(); renderVideo(); initGrouping(); initBankData(); initIpo(); initExitForm(); initProfile(); trackVisit();
	byId('fallback-play')?.addEventListener('click', runFallbackSimulation);
    byId('fallback-reset')?.addEventListener('click', () => {
        const m = byId('fallback-monitor'); const s = byId('fallback-status');
        if (m) m.textContent = ''; if (s) s.textContent = 'Siap mengetik...';
    });
});