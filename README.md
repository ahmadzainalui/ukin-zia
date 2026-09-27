# IPO LAB — Struktur & Setup

## Struktur file
- `index.html` — struktur halaman (Beranda, Materi, Simulasi, Kuis)
- `style.css` — semua styling, termasuk breakpoint responsive (900px, 560px, 380px)
- `config.js` — isi kredensial Supabase di sini
- `app.js` — seluruh logika aplikasi + integrasi leaderboard ke Supabase
- `supabase-schema.sql` — skema tabel `leaderboard` + Row Level Security

## Cara setup Supabase
1. Buat project baru di https://supabase.com
2. Buka **SQL Editor** → jalankan seluruh isi `supabase-schema.sql`
3. Buka **Project Settings > API**, salin:
   - `Project URL` → tempel ke `SUPABASE_URL` di `config.js`
   - `anon public key` → tempel ke `SUPABASE_ANON_KEY` di `config.js`
4. Buka `index.html` di browser (atau hosting statis pilihan Anda)

Selama `config.js` belum diisi, leaderboard otomatis memakai
`localStorage` sebagai fallback agar aplikasi tetap bisa dicoba.

## Fitur baru: Kuis Drag & Drop
Di halaman **Kuis** sekarang ada 2 mode (tombol toggle di atas):
- **Pilihan Ganda** — kuis seperti sebelumnya, skor masuk ke leaderboard Supabase.
- **Klasifikasi Drag & Drop** — 9 kartu perangkat (acak, 3 per kategori) diseret
  ke kotak INPUT / PROSES / OUTPUT. Jawaban benar → kartu menempel dengan animasi
  pop-in + confetti; jawaban salah → kartu bergetar dan kembali ke tumpukan.
  Ada timer dan progress bar. Dibuat dengan Pointer Events (bukan HTML5 Drag API)
  supaya lancar juga disentuh di HP/tablet.
  Mode ini masih berupa latihan mandiri (skor tidak dikirim ke Supabase) — beri
  tahu saya jika ingin skornya juga masuk ke leaderboard.

## Yang berubah dari kode asli
- Kode dipisah dari satu file HTML menjadi HTML / CSS / JS terpisah
- Perbaikan bug: tag `<div class="actions">` yang sebelumnya tertulis
  tanpa `<` di bagian Simulator CPU
- Breakpoint responsive ditambah (mendukung layar ≤380px) dan menu
  navigasi berubah jadi menu hamburger di layar sempit
- Leaderboard kuis kini tersimpan di Supabase (tabel `leaderboard`),
  bukan lagi `localStorage`
- Progress materi tetap memakai `localStorage` (sesuai cakupan yang
  diminta: hanya leaderboard yang dipindah ke Supabase)
