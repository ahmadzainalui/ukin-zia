/* =========================================================
   app.js — Logika halaman pembelajaran (slide mode)
   ========================================================= */

const byId = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// =========================================================
// DATA KOMPONEN
// =========================================================
// ============================================================
// BANK DATA PERANGKAT KOMPUTER
// Informatika Fase E / Kelas X
// ============================================================

const COMPONENTS = [
    { id: 'keyboard', name: 'Keyboard', category: 'input',    icon: '⌨️', desc: 'Perangkat input untuk memasukkan teks dan perintah.' },
    { id: 'cpu',      name: 'CPU',      category: 'proses',   icon: '🧠', desc: 'Unit pemrosesan utama yang menjalankan instruksi.' },
    { id: 'alu',      name: 'ALU',      category: 'proses',   icon: '🧮', desc: 'Bagian CPU untuk operasi aritmetika dan logika.' },
    { id: 'cu',       name: 'CU',       category: 'proses',   icon: '🎛️', desc: 'Control Unit yang mengoordinasikan instruksi.' },
    { id: 'register', name: 'Register', category: 'proses',   icon: '📥', desc: 'Penyimpanan sementara kecil di dalam CPU.' },
    { id: 'ram',      name: 'RAM',      category: 'memori',   icon: '📀', desc: 'Memori utama untuk data/instruksi yang sedang digunakan.' },
    { id: 'monitor',  name: 'Monitor',  category: 'output',   icon: '🖥️', desc: 'Perangkat output untuk menampilkan informasi.' },
    { id: 'ssd',      name: 'SSD/HDD',  category: 'storage',  icon: '💾', desc: 'Penyimpanan sekunder untuk berkas permanen.' },
    { id: 'word',     name: 'Microsoft Word', category: 'software', icon: '📝', desc: 'Perangkat lunak pengolah kata.' }
];

const COMPONENTS_BANK = [

    // --------------------------------------------------------
    // A. PERANGKAT INPUT
    // --------------------------------------------------------

    {
        id: 'keyboard',
        name: 'Keyboard',
        category: 'input',
        icon: '⌨️',
        desc: 'Perangkat input untuk memasukkan teks, angka, simbol, dan perintah ke komputer.'
    },
    {
        id: 'mouse',
        name: 'Mouse',
        category: 'input',
        icon: '🖱️',
        desc: 'Perangkat input untuk menggerakkan pointer, memilih objek, mengeklik, dan menjalankan perintah.'
    },
    {
        id: 'touchpad',
        name: 'Touchpad',
        category: 'input',
        icon: '👆',
        desc: 'Permukaan sensitif sentuhan yang digunakan untuk menggerakkan pointer dan mengontrol komputer, biasanya terdapat pada laptop.'
    },
    {
        id: 'scanner',
        name: 'Scanner',
        category: 'input',
        icon: '📠',
        desc: 'Perangkat input untuk memindai dokumen atau gambar fisik menjadi data digital.'
    },
    {
        id: 'microphone',
        name: 'Mikrofon',
        category: 'input',
        icon: '🎙️',
        desc: 'Perangkat input untuk menangkap suara dan mengubahnya menjadi sinyal yang dapat diproses komputer.'
    },
    {
        id: 'webcam',
        name: 'Webcam',
        category: 'input',
        icon: '📹',
        desc: 'Perangkat input untuk menangkap gambar atau video, misalnya saat konferensi video.'
    },
    {
        id: 'barcode-scanner',
        name: 'Barcode Scanner',
        category: 'input',
        icon: '📷',
        desc: 'Perangkat input untuk membaca kode batang dan memasukkan informasi produk ke sistem komputer.'
    },
    {
        id: 'joystick',
        name: 'Joystick',
        category: 'input',
        icon: '🕹️',
        desc: 'Perangkat input untuk mengendalikan arah dan gerakan, terutama pada permainan dan simulasi.'
    },
    {
        id: 'gamepad',
        name: 'Gamepad',
        category: 'input',
        icon: '🎮',
        desc: 'Perangkat input dengan tombol dan kontrol arah untuk memberikan perintah dalam permainan atau aplikasi.'
    },
    {
        id: 'graphic-tablet',
        name: 'Graphic Tablet',
        category: 'input',
        icon: '✍️',
        desc: 'Perangkat input yang memungkinkan pengguna menggambar atau menulis secara digital menggunakan pena khusus.'
    },
    {
        id: 'fingerprint-reader',
        name: 'Fingerprint Reader',
        category: 'input',
        icon: '🆔',
        desc: 'Perangkat input biometrik yang membaca pola sidik jari untuk keperluan identifikasi atau autentikasi.'
    },
    {
        id: 'card-reader',
        name: 'Card Reader',
        category: 'input',
        icon: '💳',
        desc: 'Perangkat input untuk membaca data dari kartu, misalnya kartu memori atau kartu tertentu yang didukung perangkat.'
    },


    // --------------------------------------------------------
    // B. PERANGKAT OUTPUT
    // --------------------------------------------------------

    {
        id: 'monitor',
        name: 'Monitor',
        category: 'output',
        icon: '🖥️',
        desc: 'Perangkat output untuk menampilkan teks, gambar, video, dan hasil pemrosesan komputer.'
    },
    {
        id: 'printer',
        name: 'Printer',
        category: 'output',
        icon: '🖨️',
        desc: 'Perangkat output untuk menghasilkan keluaran berupa tulisan atau gambar pada media fisik, seperti kertas.'
    },
    {
        id: 'speaker',
        name: 'Speaker',
        category: 'output',
        icon: '🔊',
        desc: 'Perangkat output untuk menghasilkan suara dari data audio yang diproses komputer.'
    },
    {
        id: 'headphones',
        name: 'Headphone',
        category: 'output',
        icon: '🎧',
        desc: 'Perangkat output audio untuk mendengarkan suara dari komputer secara lebih pribadi.'
    },
    {
        id: 'projector',
        name: 'Proyektor',
        category: 'output',
        icon: '📽️',
        desc: 'Perangkat output yang memproyeksikan gambar atau tampilan komputer ke layar atau permukaan yang lebih besar.'
    },
    {
        id: 'plotter',
        name: 'Plotter',
        category: 'output',
        icon: '📐',
        desc: 'Perangkat output untuk menghasilkan gambar teknis, rancangan, peta, atau ilustrasi berukuran besar.'
    },
    {
        id: 'braille-display',
        name: 'Braille Display',
        category: 'output',
        icon: '⠿',
        desc: 'Perangkat output aksesibel yang menyajikan informasi digital dalam bentuk karakter Braille yang dapat diraba.'
    },


    // --------------------------------------------------------
    // C. KOMPONEN PEMROSESAN
    // --------------------------------------------------------

    {
        id: 'cpu',
        name: 'CPU',
        category: 'proses',
        icon: '🧠',
        desc: 'Central Processing Unit adalah unit pemrosesan utama yang menjalankan instruksi dan mengendalikan pemrosesan data komputer.'
    },
    {
        id: 'alu',
        name: 'ALU',
        category: 'proses',
        icon: '🧮',
        desc: 'Arithmetic Logic Unit merupakan bagian CPU yang melakukan operasi aritmetika, seperti penjumlahan, dan operasi logika.'
    },
    {
        id: 'cu',
        name: 'Control Unit (CU)',
        category: 'proses',
        icon: '🎛️',
        desc: 'Control Unit mengatur dan mengoordinasikan pelaksanaan instruksi serta mengendalikan aliran data di dalam sistem komputer.'
    },
    {
        id: 'register',
        name: 'Register',
        category: 'proses',
        icon: '📥',
        desc: 'Penyimpanan berkapasitas kecil dan berkecepatan tinggi di dalam CPU untuk menampung data, alamat, atau instruksi sementara.'
    },
    {
        id: 'gpu',
        name: 'GPU',
        category: 'proses',
        icon: '🎨',
        desc: 'Graphics Processing Unit mengolah grafis dan dapat mempercepat komputasi paralel untuk tugas tertentu.'
    },


    // --------------------------------------------------------
    // D. MEMORI UTAMA
    // --------------------------------------------------------

    {
        id: 'ram',
        name: 'RAM',
        category: 'memori',
        icon: '📀',
        desc: 'Random Access Memory merupakan memori utama yang menyimpan sementara data dan instruksi yang sedang digunakan. Isinya umumnya hilang ketika daya dimatikan.'
    },
    {
        id: 'rom',
        name: 'ROM',
        category: 'memori',
        icon: '📘',
        desc: 'Read-Only Memory merupakan jenis memori nonvolatil yang digunakan untuk menyimpan instruksi atau firmware tertentu.'
    },
    {
        id: 'cache',
        name: 'Cache Memory',
        category: 'memori',
        icon: '⚡',
        desc: 'Memori berkecepatan tinggi yang menyimpan salinan data atau instruksi yang sering digunakan agar CPU dapat mengaksesnya lebih cepat.'
    },


    // --------------------------------------------------------
    // E. PENYIMPANAN SEKUNDER
    // --------------------------------------------------------

    {
        id: 'ssd',
        name: 'SSD/HDD',
        category: 'storage',
        icon: '💾',
        desc: 'SSD dan HDD merupakan media penyimpanan sekunder untuk menyimpan sistem operasi, aplikasi, dan berkas agar tetap tersedia setelah komputer dimatikan.'
    },
    {
        id: 'flash-drive',
        name: 'USB Flash Drive',
        category: 'storage',
        icon: '🔌',
        desc: 'Media penyimpanan portabel berbasis memori flash untuk menyimpan dan memindahkan berkas antarkomputer.'
    },
    {
        id: 'memory-card',
        name: 'Memory Card',
        category: 'storage',
        icon: '💳',
        desc: 'Media penyimpanan berukuran kecil, seperti kartu SD atau microSD, yang digunakan untuk menyimpan foto, video, dan berkas digital.'
    },
    {
        id: 'optical-disc',
        name: 'CD/DVD/Blu-ray',
        category: 'storage',
        icon: '💿',
        desc: 'Media penyimpanan optik yang dapat menyimpan data digital dan dibaca menggunakan perangkat pembaca yang sesuai.'
    },
    {
        id: 'external-drive',
        name: 'External HDD/SSD',
        category: 'storage',
        icon: '🗄️',
        desc: 'Media penyimpanan eksternal yang dihubungkan ke komputer, misalnya melalui USB, untuk menyimpan cadangan atau memindahkan berkas.'
    },


    // --------------------------------------------------------
    // F. SOFTWARE / PERANGKAT LUNAK
    // --------------------------------------------------------

    {
        id: 'word',
        name: 'Microsoft Word',
        category: 'software',
        icon: '📝',
        desc: 'Aplikasi pengolah kata untuk membuat, mengedit, memformat, dan menyimpan dokumen teks.'
    },
    {
        id: 'excel',
        name: 'Microsoft Excel',
        category: 'software',
        icon: '📊',
        desc: 'Aplikasi pengolah spreadsheet untuk mengelola data, menggunakan rumus, menghitung, dan membuat grafik.'
    },
    {
        id: 'powerpoint',
        name: 'Microsoft PowerPoint',
        category: 'software',
        icon: '📽️',
        desc: 'Aplikasi untuk membuat dan menampilkan presentasi dalam bentuk slide.'
    },
    {
        id: 'windows',
        name: 'Microsoft Windows',
        category: 'software',
        icon: '🪟',
        desc: 'Sistem operasi yang mengelola sumber daya perangkat keras dan menyediakan lingkungan untuk menjalankan aplikasi.'
    },
    {
        id: 'linux',
        name: 'Linux',
        category: 'software',
        icon: '🐧',
        desc: 'Keluarga sistem operasi berbasis kernel Linux yang digunakan pada komputer, server, dan berbagai perangkat lainnya.'
    },
    {
        id: 'macos',
        name: 'macOS',
        category: 'software',
        icon: '🍎',
        desc: 'Sistem operasi untuk komputer Mac yang mengelola perangkat keras dan menjalankan berbagai aplikasi.'
    },
    {
        id: 'browser',
        name: 'Web Browser',
        category: 'software',
        icon: '🌐',
        desc: 'Aplikasi untuk membuka, menampilkan, dan berinteraksi dengan halaman serta aplikasi berbasis web.'
    },
    {
        id: 'paint',
        name: 'Microsoft Paint',
        category: 'software',
        icon: '🎨',
        desc: 'Aplikasi untuk membuat dan mengedit gambar sederhana.'
    },
    {
        id: 'scratch',
        name: 'Scratch',
        category: 'software',
        icon: '🧩',
        desc: 'Lingkungan pemrograman visual berbasis blok yang membantu pemula mempelajari konsep pemrograman.'
    },
    {
        id: 'vscode',
        name: 'Visual Studio Code',
        category: 'software',
        icon: '💻',
        desc: 'Editor kode untuk menulis dan mengelola program menggunakan berbagai bahasa pemrograman.'
    },
    {
        id: 'antivirus',
        name: 'Antivirus',
        category: 'software',
        icon: '🛡️',
        desc: 'Perangkat lunak keamanan untuk membantu mendeteksi, mencegah, dan menangani malware.'
    }

];


// ============================================================
// LABEL KATEGORI
// ============================================================

const CATEGORY_LABELS = {
    input: 'Perangkat Input',
    output: 'Perangkat Output',
    proses: 'Komponen Pemrosesan',
    memori: 'Memori Utama',
    storage: 'Penyimpanan Sekunder',
    software: 'Software / Perangkat Lunak'
};

const OWNER_PROFILE = {
    name: 'Fauziah Anwar',
    role: 'Calon Guru Informatika',
    school: 'Universitas Pendidikan Indonesia',
    description: 'Mahasiswa PPG Prajabatan UPI yang berkomitmen menjadi guru yang menghadirkan pembelajaran Informatika yang inklusif, bermakna, dan mendorong setiap siswa berkembang sesuai potensinya.',
    photo: 'zia.png',
    purpose: 'Media pembelajaran interaktif Sistem Komputer untuk membantu murid memahami alur Input–Process–Output pada arsitektur Von Neumann.'
};

const VIDEO_EMBED_URL = 'https://www.youtube.com/embed/AlMYyr8Z7co'; // Isi URL embed YouTube bila tersedia.

// =========================================================
// TOAST
// =========================================================
function showToast(message, type = 'success') {
    const c = byId('toast-container');
    if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = message;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3500);
}

// =========================================================
// SLIDE NAVIGATION
// =========================================================
const SLIDES = [
    { id: 'beranda',   label: 'Beranda' },
    { id: 'pemantik',  label: 'Pemantik' },
    { id: 'tujuan',    label: 'Tujuan' },
    { id: 'stimulus',  label: 'Stimulus' },
    { id: 'dragdrop',  label: 'Aktivitas' },
    { id: 'alur',      label: 'Alur IPO' },
    { id: 'exit',      label: 'Exit Ticket' },
    { id: 'profil',    label: 'Profil' }
];
let currentSlide = 0;

function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= SLIDES.length) index = SLIDES.length - 1;
    currentSlide = index;

    const slides = document.querySelectorAll('.slide');
    slides.forEach((el, i) => {
        el.classList.toggle('active', i === index);
        if (i === index) el.scrollTop = 0;
    });

    document.querySelectorAll('.nav-tab').forEach((tab, i) => {
        const active = i === index;
        tab.classList.toggle('active', active);
        if (active) tab.setAttribute('aria-current', 'page');
        else tab.removeAttribute('aria-current');
    });

    document.querySelectorAll('.slide-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    const prev = byId('slide-prev');
    const next = byId('slide-next');
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === SLIDES.length - 1;

    const ind = byId('slide-indicator');
    if (ind) ind.textContent = `${index + 1} / ${SLIDES.length}`;
}

function initSlides() {
    // Build dots
    const dots = byId('slide-dots');
    if (dots) {
        SLIDES.forEach((s, i) => {
            const b = document.createElement('button');
            b.className = 'slide-dot';
            b.setAttribute('aria-label', `Ke slide ${i + 1}: ${s.label}`);
            b.setAttribute('role', 'tab');
            b.addEventListener('click', () => goToSlide(i));
            dots.appendChild(b);
        });
    }
    document.querySelectorAll('.nav-tab').forEach((tab) => {
        tab.addEventListener('click', () => goToSlide(parseInt(tab.dataset.slide, 10)));
    });
    document.querySelectorAll('[data-goto]').forEach((btn) => {
        btn.addEventListener('click', () => goToSlide(parseInt(btn.dataset.goto, 10)));
    });
    byId('slide-prev')?.addEventListener('click', () => goToSlide(currentSlide - 1));
    byId('slide-next')?.addEventListener('click', () => goToSlide(currentSlide + 1));

    document.addEventListener('keydown', (e) => {
        const tag = (e.target.tagName || '').toLowerCase();
        if (['input', 'textarea', 'select'].includes(tag)) return;
        if (e.key === 'ArrowRight') { goToSlide(currentSlide + 1); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { goToSlide(currentSlide - 1); e.preventDefault(); }
    });

    goToSlide(0);
}

// =========================================================
// THEME
// =========================================================
function initTheme() {
    const saved = localStorage.getItem('sk_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    const sel = byId('theme-select');
    if (sel) sel.value = saved;
}
byId('theme-select')?.addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.value);
    localStorage.setItem('sk_theme', e.target.value);
});

// =========================================================
// VISIT TRACKING
// =========================================================
async function trackVisit() {
    let sid = sessionStorage.getItem('sk_session_id');
    if (!sid) {
        sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
        sessionStorage.setItem('sk_session_id', sid);
    }
    if (sessionStorage.getItem('sk_visit_logged') === 'true') return;
    try {
        const { error } = await supabaseClient.from('site_visits')
            .insert({ session_id: sid, page_path: window.location.pathname || '/' });
        if (!error || error.code === '23505') sessionStorage.setItem('sk_visit_logged', 'true');
    } catch (e) { console.warn('Visit tracking gagal:', e); }
}

// =========================================================
// VIDEO / FALLBACK
// =========================================================
function renderVideo() {
    const frame = byId('video-frame');
    if (!frame) return;
    if (VIDEO_EMBED_URL.trim()) {
        const iframe = document.createElement('iframe');
        iframe.src = VIDEO_EMBED_URL;
        iframe.title = 'Video demonstrasi sistem komputer';
        iframe.loading = 'lazy';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        frame.appendChild(iframe);
    } else {
        const info = document.createElement('div');
        info.className = 'video-fallback-info';
        info.textContent = '🎬 Video demonstrasi belum dikonfigurasi. Gunakan simulasi interaktif di bawah.';
        frame.appendChild(info);
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

// =========================================================
// DRAG & DROP GROUPING
// =========================================================
let groupingPlaced = {};
let selectedGroupComp = null;

function makeGroupCard(comp, opts = {}) {
    const card = document.createElement('div');
    card.className = 'component-card';
    card.dataset.id = comp.id;
    card.draggable = true;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const icon = document.createElement('span');
    icon.className = 'component-icon'; icon.textContent = comp.icon;
    icon.setAttribute('aria-hidden', 'true');
    const name = document.createElement('span');
    name.className = 'component-name'; name.textContent = comp.name;

    const info = document.createElement('button');
    info.type = 'button'; info.className = 'info-btn'; info.textContent = 'ℹ';
    info.setAttribute('aria-label', 'Info ' + comp.name);
    info.addEventListener('click', (e) => { e.stopPropagation(); showToast(comp.name + ': ' + comp.desc); });

    card.append(icon, name, info);
    if (opts.correct !== undefined) card.classList.add(opts.correct ? 'correct' : 'incorrect');

    card.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', comp.id));
    card.addEventListener('click', (e) => {
        if (e.target.classList.contains('info-btn')) return;
        selectedGroupComp = (selectedGroupComp === comp.id) ? null : comp.id;
        document.querySelectorAll('.component-card.selected').forEach((c) => c.classList.remove('selected'));
        if (selectedGroupComp) card.classList.add('selected');
    });
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectedGroupComp = comp.id;
            document.querySelectorAll('.component-card.selected').forEach((c) => c.classList.remove('selected'));
            card.classList.add('selected');
        }
    });
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
            if (p && p.category === cat) container.appendChild(makeGroupCard(comp, { correct: p.correct }));
        });
    });
    updateGroupProgress();
}

function placeInGrouping(compId, categoryId) {
    const comp = COMPONENTS.find((c) => c.id === compId);
    if (!comp) return;
    const correct = comp.category === categoryId;
    groupingPlaced[comp.id] = { category: categoryId, correct };
    selectedGroupComp = null;
    renderGrouping();
    if (correct) showToast(`✅ ${comp.name} masuk ke ${CATEGORY_LABELS[categoryId]}.`);
    else showToast(`❌ Belum tepat. ${comp.name} bukan ${CATEGORY_LABELS[categoryId]}.`, 'error');
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
    document.querySelectorAll('.category-zone').forEach((zone) => {
        const cat = zone.dataset.category;
        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault(); zone.classList.remove('drag-over');
            const id = e.dataTransfer.getData('text/plain');
            if (id) placeInGrouping(id, cat);
        });
        zone.addEventListener('click', (e) => {
            if (e.target.closest('.component-card')) return;
            if (selectedGroupComp) placeInGrouping(selectedGroupComp, cat);
        });
        zone.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && selectedGroupComp) {
                e.preventDefault(); placeInGrouping(selectedGroupComp, cat);
            }
        });
    });
    byId('group-reset')?.addEventListener('click', () => {
        groupingPlaced = {}; selectedGroupComp = null; renderGrouping();
    });
}

// =========================================================
// BANK DATA
// =========================================================
function initBankData() {
    const toggle = byId('bank-data-toggle');
    const content = byId('bank-data-content');
    const body = byId('bank-data-body');
    if (!toggle || !content || !body) return;

    const groups = { input: [], output: [], proses: [], memori: [], storage: [], software: [] };
    COMPONENTS_BANK.forEach((c) => { if (groups[c.category]) groups[c.category].push(c); });

    Object.entries(groups).forEach(([cat, items]) => {
        if (!items.length) return;
        const wrap = document.createElement('div'); wrap.className = 'bank-group';
        const h = document.createElement('h5'); h.textContent = CATEGORY_LABELS[cat]; wrap.appendChild(h);
        const list = document.createElement('div'); list.className = 'bank-items';
        items.forEach((it) => {
            const card = document.createElement('div'); card.className = 'bank-item';
            const icon = document.createElement('span'); icon.className = 'icon'; icon.textContent = it.icon;
            const info = document.createElement('div');
            const name = document.createElement('strong'); name.textContent = it.name;
            const desc = document.createElement('span'); desc.className = 'desc'; desc.textContent = it.desc;
            info.append(name, desc);
            card.append(icon, info);
            list.appendChild(card);
        });
        wrap.appendChild(list); body.appendChild(wrap);
    });

    toggle.addEventListener('click', () => {
        if (content.hasAttribute('hidden')) {
            content.removeAttribute('hidden');
            toggle.textContent = '📚 Sembunyikan Bank Data';
            toggle.setAttribute('aria-expanded', 'true');
        } else {
            content.setAttribute('hidden', '');
            toggle.textContent = '📚 Lihat Bank Data Perangkat Komputer';
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// =========================================================
// IPO BUILDER & SIMULATION
// =========================================================
const IPO_SLOTS = ['input', 'process', 'output', 'storage'];
const IPO_CORRECT = { input: 'keyboard', process: 'cpu', output: 'monitor', storage: 'ssd' };
let ipoPlaced = { input: null, process: null, output: null, storage: null };
let selectedIpoChip = null;

function makeIpoChip(comp) {
    const chip = document.createElement('button');
    chip.type = 'button'; chip.className = 'ipo-chip';
    chip.dataset.id = comp.id; chip.draggable = true;
    const ic = document.createElement('span'); ic.textContent = comp.icon;
    const nm = document.createElement('span'); nm.textContent = comp.name;
    chip.append(ic, nm);
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
    ['keyboard', 'cpu', 'monitor', 'ssd', 'ram', 'word'].forEach((id) => {
        if (used.includes(id)) return;
        const comp = COMPONENTS.find((c) => c.id === id);
        if (comp) pool.appendChild(makeIpoChip(comp));
    });
    IPO_SLOTS.forEach((slot) => {
        const slotEl = document.querySelector(`.ipo-slot[data-position="${slot}"]`);
        const drop = slotEl?.querySelector('.slot-drop');
        if (!drop) return;
        drop.innerHTML = '';
        slotEl.classList.remove('correct', 'incorrect');
        const placedId = ipoPlaced[slot];
        if (placedId) {
            const comp = COMPONENTS.find((c) => c.id === placedId);
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
        slotEl.addEventListener('click', (e) => {
            if (e.target.closest('.ipo-chip')) return;
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
        const sim = byId('ipo-simulation');
        if (ok) {
            fb.className = 'feedback success';
            fb.textContent = '✅ Susunan benar! Silakan jalankan simulasi di bawah.';
            if (sim) sim.style.display = 'block';
        } else {
            fb.className = 'feedback error';
            fb.textContent = '❌ Susunan belum tepat. Periksa kembali setiap slot.';
            if (sim) sim.style.display = 'none';
        }
    });

    byId('ipo-reset')?.addEventListener('click', () => {
        ipoPlaced = { input: null, process: null, output: null, storage: null };
        selectedIpoChip = null; renderIpo();
        const sim = byId('ipo-simulation');
        if (sim) sim.style.display = 'none';
        const fb = byId('ipo-feedback'); fb.className = 'feedback'; fb.textContent = '';
    });

    byId('sim-run')?.addEventListener('click', runIpoSimulation);
    byId('sim-reset')?.addEventListener('click', () => {
        byId('sim-input').value = '';
        byId('sim-steps').innerHTML = '';
        byId('monitor-display').textContent = '';
        byId('sim-save').style.display = 'none';
    });
    byId('sim-save')?.addEventListener('click', async () => {
        const btn = byId('sim-save');
        btn.disabled = true; const orig = btn.textContent; btn.textContent = 'Menyimpan...';
        await sleep(1100);
        showToast('💾 Dokumen berhasil disimpan ke penyimpanan sekunder (SSD/HDD).');
        btn.textContent = orig; btn.disabled = false;
    });
}

async function runIpoSimulation() {
    const input = byId('sim-input');
    const steps = byId('sim-steps');
    const monitor = byId('monitor-display');
    const saveBtn = byId('sim-save');
    const text = input.value.trim();
    if (!text) { showToast('Masukkan teks atau operasi terlebih dahulu.', 'error'); return; }

    const missing = IPO_SLOTS.filter((s) => ipoPlaced[s] !== IPO_CORRECT[s]);
    if (missing.length) { showToast('Susunan komponen belum lengkap/benar. Periksa kembali slot.', 'error'); return; }

    steps.innerHTML = ''; monitor.textContent = ''; saveBtn.style.display = 'none';

    const arith = text.match(/^(\d+)\s*([+\-*/])\s*(\d+)$/);
    if (arith) await runArithmetic(arith, steps, monitor);
    else await runTyping(text.slice(0, 15), steps, monitor);
    saveBtn.style.display = 'inline-flex';
}

function appendStep(container, text) {
    const div = document.createElement('div');
    div.className = 'sim-step'; div.textContent = text;
    container.appendChild(div);
}

async function runArithmetic(match, steps, monitor) {
    const a = parseInt(match[1], 10);
    const op = match[2];
    const b = parseInt(match[3], 10);
    let result;
    switch (op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/': result = b === 0 ? 'NaN' : (a / b); break;
    }
    const opName = { '+': 'penambahan', '-': 'pengurangan', '*': 'perkalian', '/': 'pembagian' }[op];
    const lines = [
        `CU menerima input angka ${a} dan ${b} beserta instruksi ${opName} (${op}).`,
        'CU mengirim data ke ALU.',
        `ALU melakukan kalkulasi aritmatika: ${a} ${op} ${b} = ${result}.`,
        `Hasil (${result}) disimpan di Register ACC.`,
        'CU mengambil hasil dari ACC dan mengirimkannya ke layar.',
        `Monitor menampilkan hasil: ${result}`
    ];
    for (let i = 0; i < lines.length; i++) {
        await sleep(600);
        appendStep(steps, lines[i]);
        if (i === lines.length - 1) monitor.textContent = String(result);
    }
}

async function runTyping(text, steps, monitor) {
    let cursor = 100; let displayed = '';
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const bin = ch.charCodeAt(0).toString(2).padStart(8, '0');
        const newCursor = cursor + 10;
        displayed += ch;
        const line = `Keyboard mengirim kode biner ${bin} (ASCII '${ch}'). CU mendeteksi dan memasukkan ke Register MDR. ALU menghitung kursor (${cursor} + lebar 10 = ${newCursor}). Register ACC menyimpan ${newCursor}. Layar menampilkan '${displayed}'.`;
        await sleep(600);
        appendStep(steps, line);
        monitor.textContent = displayed;
        cursor = newCursor;
    }
}

// =========================================================
// EXIT TICKET
// =========================================================
function normalize(s) { return (s || '').trim().toLowerCase(); }

function computeLocalScore(data) {
    let total = 0;
    if (['keyboard','papan ketik','papan tombol','papan tuts'].includes(normalize(data.q1_keyboard))) total += 1;
    if (['monitor','layar','screen','display'].includes(normalize(data.q1_monitor))) total += 1;
    if (normalize(data.q2_cpu) === 'c') total += 0.5;
    if (normalize(data.q2_alu) === 'a') total += 0.5;
    if (normalize(data.q2_cu) === 'd') total += 0.5;
    if (normalize(data.q2_register) === 'b') total += 0.5;
    if (normalize(data.q3_ram_ssd_choice) === 'a') total += 2;
    if (['keyboard','papan ketik','papan tombol','papan tuts'].includes(normalize(data.q4_input))) total += 0.5;
    if (['cpu','prosesor','processor','mikroprosesor'].includes(normalize(data.q4_process))) total += 0.5;
    if (['monitor','layar','screen','display'].includes(normalize(data.q4_output))) total += 0.5;
    if (['ssd','hdd','ssd/hdd','hdd/ssd','penyimpanan sekunder','harddisk','hard disk','penyimpanan'].includes(normalize(data.q4_storage))) total += 0.5;
    return total;
}

function initExitForm() {
    const dateEl = byId('activity-date');
    if (dateEl && !dateEl.value) {
        const d = new Date();
        dateEl.value = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    }
    const form = byId('exit-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            student_name: byId('student-name').value.trim(),
            class_name: byId('class-name').value.trim(),
            activity_date: byId('activity-date').value,
            q1_keyboard: byId('q1-keyboard').value.trim(),
            q1_monitor: byId('q1-monitor').value.trim(),
            q2_cpu: byId('q2-cpu').value,
            q2_alu: byId('q2-alu').value,
            q2_cu: byId('q2-cu').value,
            q2_register: byId('q2-register').value,
            q3_ram_ssd_choice: document.querySelector('input[name="q3"]:checked')?.value || '',
            q4_input: byId('q4-input').value.trim(),
            q4_process: byId('q4-process').value.trim(),
            q4_output: byId('q4-output').value.trim(),
            q4_storage: byId('q4-storage').value.trim(),
            reflection_understood: byId('reflection-understood').value.trim(),
            reflection_confusing: byId('reflection-confusing').value.trim(),
            confidence_level: byId('confidence-level').value
        };

        if (!data.student_name) return showToast('Nama wajib diisi.', 'error');
        if (!data.class_name) return showToast('Kelas wajib diisi.', 'error');
        if (!data.activity_date) return showToast('Tanggal wajib diisi.', 'error');
        if (!data.q1_keyboard || !data.q1_monitor) return showToast('Soal 1 belum lengkap.', 'error');
        if (!data.q2_cpu || !data.q2_alu || !data.q2_cu || !data.q2_register) return showToast('Soal 2 belum lengkap.', 'error');
        if (!data.q3_ram_ssd_choice) return showToast('Soal 3 belum dijawab.', 'error');
        if (!data.q4_input || !data.q4_process || !data.q4_output || !data.q4_storage) return showToast('Soal 4 belum lengkap.', 'error');
        if (!data.reflection_understood) return showToast('Refleksi 1 belum diisi.', 'error');
        if (!data.confidence_level) return showToast('Pilih tingkat keyakinan terlebih dahulu.', 'error');

        const btn = byId('submit-btn');
        btn.disabled = true; const orig = btn.textContent; btn.textContent = 'Mengirim...';

        try {
            const { error } = await supabaseClient.from('exit_ticket_submissions').insert(data);
            if (error) throw error;
            const localScore = computeLocalScore(data);
            showToast('✅ Jawaban dan refleksi berhasil dikirim!');
            const disp = byId('exit-score-display');
            disp.textContent = `EXIT TICKET: ${localScore} / 8 — Refleksi tidak dinilai benar/salah. (Skor final dihitung ulang oleh sistem.)`;
            disp.style.display = 'block';
            disp.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (err) {
            console.error(err);
            showToast('❌ Gagal mengirim: ' + (err.message || 'Periksa koneksi Anda.'), 'error');
        } finally {
            btn.disabled = false; btn.textContent = orig;
        }
    });
}

// =========================================================
// PROFILE
// =========================================================
function initProfile() {
    const photo = byId('owner-photo');
    const name = byId('owner-name');
    const role = byId('owner-role');
    const school = byId('owner-school');
    const desc = byId('owner-description');
    const purpose = byId('owner-purpose');
    if (name) name.textContent = OWNER_PROFILE.name;
    if (role) role.textContent = OWNER_PROFILE.role;
    if (school) school.textContent = OWNER_PROFILE.school || '';
    if (desc) desc.textContent = OWNER_PROFILE.description || '';
    if (purpose) purpose.textContent = OWNER_PROFILE.purpose ? 'Tujuan: ' + OWNER_PROFILE.purpose : '';
    if (photo) {
        if (OWNER_PROFILE.photo) {
            const img = document.createElement('img');
            img.src = OWNER_PROFILE.photo; img.alt = 'Foto ' + OWNER_PROFILE.name;
            img.style.width = '100%'; img.style.height = '100%';
            img.style.borderRadius = '50%'; img.style.objectFit = 'cover';
            img.onerror = () => { photo.textContent = (OWNER_PROFILE.name || '?').charAt(0).toUpperCase(); };
            photo.innerHTML = ''; photo.appendChild(img);
        } else {
            photo.textContent = (OWNER_PROFILE.name || '?').charAt(0).toUpperCase();
        }
    }
}

// =========================================================
// BOOT
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSlides();
    renderVideo();
    initGrouping();
    initBankData();
    initIpo();
    initExitForm();
    initProfile();
    byId('fallback-play')?.addEventListener('click', runFallbackSimulation);
    byId('fallback-reset')?.addEventListener('click', () => {
        const m = byId('fallback-monitor'); const s = byId('fallback-status');
        if (m) m.textContent = ''; if (s) s.textContent = 'Siap mengetik...';
    });
    trackVisit();
	
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