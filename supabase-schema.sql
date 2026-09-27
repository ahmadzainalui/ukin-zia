-- ============================================================
-- IPO LAB — Skema Supabase untuk Leaderboard Kuis
-- Jalankan di: Dashboard Supabase > SQL Editor > New query
-- ============================================================

-- 1. Tabel leaderboard
create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 30),
  score int not null check (score >= 0 and score <= 100),
  correct int not null check (correct >= 0),
  created_at timestamptz not null default now()
);

-- 2. Index agar query "top 10 skor tertinggi" cepat
create index if not exists leaderboard_score_idx
  on public.leaderboard (score desc, created_at asc);

-- 3. Aktifkan Row Level Security
alter table public.leaderboard enable row level security;

-- 4. Policy: siapa saja (anon) boleh MEMBACA leaderboard
create policy "Leaderboard dapat dibaca publik"
on public.leaderboard
for select
to anon
using (true);

-- 5. Policy: siapa saja (anon) boleh MENAMBAHKAN skor baru
--    (tidak boleh update/delete dari sisi client demi keaslian data)
create policy "Siapa saja boleh menambahkan skor"
on public.leaderboard
for insert
to anon
with check (true);

-- Catatan:
-- - Tidak ada policy UPDATE/DELETE untuk role anon, sehingga skor
--   yang sudah masuk tidak bisa diubah/dihapus dari sisi browser.
-- - Jika ingin membatasi 1 nama hanya menyimpan skor terbaik,
--   tambahkan logika tersebut di aplikasi (app.js) atau lewat
--   Supabase Edge Function, bukan di RLS.
