-- =============================================================
-- SCHEMA — Website Pembelajaran Informatika (Sistem Komputer)
-- Login admin custom: tabel admin_users + admin_sessions
-- Jalankan seluruh file ini di Supabase SQL Editor.
-- =============================================================

create extension if not exists pgcrypto;

-- =============================================================
-- 0. Bersihkan struktur lama yang berbasis Supabase Auth
--    (aman jika tabel belum ada — karena ini versi baru)
-- =============================================================
drop function if exists public.is_admin() cascade;
drop table if exists public.admin_sessions cascade;
drop table if exists public.admin_users cascade;

-- =============================================================
-- 1. site_visits — estimasi kunjungan berbasis sesi browser
-- =============================================================
create table if not exists public.site_visits (
    id          uuid primary key default gen_random_uuid(),
    session_id  text not null unique,
    page_path   text not null,
    visited_at  timestamptz not null default now()
);
create index if not exists idx_site_visits_visited_at on public.site_visits (visited_at desc);

-- =============================================================
-- 2. exit_ticket_submissions
-- =============================================================
create table if not exists public.exit_ticket_submissions (
    id                     uuid primary key default gen_random_uuid(),
    student_name           text not null check (length(btrim(student_name)) > 0),
    class_name             text not null check (length(btrim(class_name)) > 0),
    activity_date          date not null,
    q1_keyboard            text,
    q1_monitor             text,
    q2_cpu                 text,
    q2_alu                 text,
    q2_cu                  text,
    q2_register            text,
    q3_ram_ssd_choice      text,
    q4_input               text,
    q4_process             text,
    q4_output              text,
    q4_storage             text,
    score                  numeric(3,1) not null default 0 check (score >= 0 and score <= 8),
    reflection_understood  text,
    reflection_confusing   text,
    confidence_level       text check (confidence_level in (
        'Sudah paham',
        'Cukup paham, masih perlu latihan',
        'Masih perlu bantuan'
    )),
    submitted_at           timestamptz not null default now()
);
create index if not exists idx_ets_class     on public.exit_ticket_submissions (class_name);
create index if not exists idx_ets_date      on public.exit_ticket_submissions (activity_date);
create index if not exists idx_ets_submitted on public.exit_ticket_submissions (submitted_at desc);
create index if not exists idx_ets_score     on public.exit_ticket_submissions (score desc);

-- =============================================================
-- 3. admin_users (username + bcrypt hash)
-- =============================================================
create table if not exists public.admin_users (
    id             uuid primary key default gen_random_uuid(),
    username       text not null unique check (length(btrim(username)) > 0),
    password_hash  text not null,
    created_at     timestamptz not null default now()
);
create unique index if not exists idx_admin_username_lower
    on public.admin_users (lower(username));

-- =============================================================
-- 4. admin_sessions (token opaque, expiry)
-- =============================================================
create table if not exists public.admin_sessions (
    token       text primary key,
    admin_id    uuid not null references public.admin_users(id) on delete cascade,
    expires_at  timestamptz not null,
    created_at  timestamptz not null default now()
);
create index if not exists idx_admin_sessions_admin on public.admin_sessions (admin_id);
create index if not exists idx_admin_sessions_exp   on public.admin_sessions (expires_at);

-- =============================================================
-- 5. Fungsi bantu & trigger penilaian (sama seperti versi sebelumnya)
-- =============================================================
create or replace function public.normalize_answer(val text)
returns text language sql immutable
as $$ select lower(btrim(coalesce(val, ''))); $$;

create or replace function public.calculate_score()
returns trigger language plpgsql as $$
declare
    total numeric := 0;
    a text;
begin
    a := public.normalize_answer(new.q1_keyboard);
    if a = any (array['keyboard','papan ketik','papan tombol','papan tuts']) then total := total + 1; end if;
    a := public.normalize_answer(new.q1_monitor);
    if a = any (array['monitor','layar','screen','display']) then total := total + 1; end if;

    if public.normalize_answer(new.q2_cpu)      = 'c' then total := total + 0.5; end if;
    if public.normalize_answer(new.q2_alu)      = 'a' then total := total + 0.5; end if;
    if public.normalize_answer(new.q2_cu)       = 'd' then total := total + 0.5; end if;
    if public.normalize_answer(new.q2_register) = 'b' then total := total + 0.5; end if;

    if public.normalize_answer(new.q3_ram_ssd_choice) = 'a' then total := total + 2; end if;

    a := public.normalize_answer(new.q4_input);
    if a = any (array['keyboard','papan ketik','papan tombol','papan tuts']) then total := total + 0.5; end if;
    a := public.normalize_answer(new.q4_process);
    if a = any (array['cpu','prosesor','processor','mikroprosesor']) then total := total + 0.5; end if;
    a := public.normalize_answer(new.q4_output);
    if a = any (array['monitor','layar','screen','display']) then total := total + 0.5; end if;
    a := public.normalize_answer(new.q4_storage);
    if a = any (array['ssd','hdd','ssd/hdd','hdd/ssd','penyimpanan sekunder','harddisk','hard disk','penyimpanan']) then total := total + 0.5; end if;

    new.score := total;
    return new;
end;
$$;

drop trigger if exists trg_calculate_score on public.exit_ticket_submissions;
create trigger trg_calculate_score
before insert or update on public.exit_ticket_submissions
for each row execute function public.calculate_score();

-- =============================================================
-- 6. RPC: ADMIN LOGIN / LOGOUT / VERIFY
-- =============================================================
create or replace function public.admin_login(p_username text, p_password text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
    v_admin_id      uuid;
    v_password_hash text;
    v_token         text;
    v_uname         text := lower(btrim(coalesce(p_username, '')));
begin
    if v_uname = '' or p_password is null or p_password = '' then
        raise exception 'Username dan password wajib diisi.';
    end if;

    -- Bersihkan sesi kedaluwarsa
    delete from admin_sessions where expires_at < now();

    select id, password_hash into v_admin_id, v_password_hash
    from admin_users
    where lower(username) = v_uname
    limit 1;

    if v_admin_id is null then
        raise exception 'Username atau password salah.';
    end if;

    if crypt(p_password, v_password_hash) <> v_password_hash then
        raise exception 'Username atau password salah.';
    end if;

    v_token := encode(gen_random_bytes(32), 'hex');
    insert into admin_sessions (token, admin_id, expires_at)
    values (v_token, v_admin_id, now() + interval '24 hours');

    return v_token;
end;
$$;

create or replace function public.admin_logout(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_token is null then return; end if;
    delete from admin_sessions where token = p_token;
end;
$$;

create or replace function public.admin_verify_session(p_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_count int;
begin
    if p_token is null or p_token = '' then
        return false;
    end if;
    select count(*) into v_count
    from admin_sessions
    where token = p_token and expires_at > now();
    return v_count > 0;
end;
$$;

-- =============================================================
-- 7. RPC: BACA DATA (hanya dengan token valid)
-- =============================================================
create or replace function public.admin_get_stats(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin_id       uuid;
    v_visits         bigint;
    v_submissions    bigint;
    v_avg            numeric;
    v_classes        bigint;
    v_conf           jsonb;
begin
    select admin_id into v_admin_id
    from admin_sessions
    where token = p_token and expires_at > now();

    if v_admin_id is null then
        raise exception 'Sesi tidak valid atau sudah kedaluwarsa.';
    end if;

    select count(*) into v_visits       from site_visits;
    select count(*) into v_submissions  from exit_ticket_submissions;
    select coalesce(avg(score), 0) into v_avg from exit_ticket_submissions;
    select count(distinct class_name) into v_classes from exit_ticket_submissions;

    select coalesce(jsonb_object_agg(confidence_level, cnt), '{}'::jsonb)
      into v_conf
    from (
        select confidence_level, count(*)::int as cnt
        from exit_ticket_submissions
        where confidence_level is not null
        group by confidence_level
    ) t;

    return jsonb_build_object(
        'total_visits',       v_visits,
        'total_submissions',  v_submissions,
        'average_score',      round(v_avg, 2),
        'class_count',        v_classes,
        'confidence_summary', v_conf
    );
end;
$$;

create or replace function public.admin_get_submissions(p_token text)
returns setof public.exit_ticket_submissions
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin_id uuid;
begin
    select admin_id into v_admin_id
    from admin_sessions
    where token = p_token and expires_at > now();

    if v_admin_id is null then
        raise exception 'Sesi tidak valid atau sudah kedaluwarsa.';
    end if;

    return query
        select * from public.exit_ticket_submissions
        order by submitted_at desc;
end;
$$;

-- =============================================================
-- 8. Aktifkan RLS — SEMUA AKSES BACA DILALUI RPC
-- =============================================================
alter table public.site_visits             enable row level security;
alter table public.exit_ticket_submissions enable row level security;
alter table public.admin_users             enable row level security;
alter table public.admin_sessions          enable row level security;

-- site_visits: anon boleh insert; tidak ada policy SELECT (baca via RPC)
drop policy if exists "anon insert visits" on public.site_visits;
create policy "anon insert visits" on public.site_visits
for insert to anon, authenticated
with check (length(session_id) > 0 and length(page_path) > 0);

-- exit_ticket_submissions: anon boleh insert; tidak ada policy SELECT
drop policy if exists "anon insert submissions" on public.exit_ticket_submissions;
create policy "anon insert submissions" on public.exit_ticket_submissions
for insert to anon, authenticated
with check (
    length(btrim(student_name)) > 0
    and length(btrim(class_name)) > 0
);

-- admin_users & admin_sessions: tidak ada policy => anon/authenticated
-- TIDAK bisa SELECT/INSERT/UPDATE/DELETE langsung.
-- Semua operasi lewat fungsi SECURITY DEFINER (admin_login, admin_get_*, ...).

-- =============================================================
-- 9. Grants
-- =============================================================
grant usage on schema public to anon, authenticated;

-- Siswa: hanya insert
grant insert on public.site_visits             to anon, authenticated;
grant insert on public.exit_ticket_submissions to anon, authenticated;

-- RPC untuk publik (fungsi sendiri yang memverifikasi token)
grant execute on function public.normalize_answer(text)      to anon, authenticated;
grant execute on function public.admin_login(text, text)     to anon, authenticated;
grant execute on function public.admin_logout(text)          to anon, authenticated;
grant execute on function public.admin_verify_session(text)  to anon, authenticated;
grant execute on function public.admin_get_stats(text)       to anon, authenticated;
grant execute on function public.admin_get_submissions(text) to anon, authenticated;

-- =============================================================
-- 10. Bootstrap admin pertama
-- =============================================================
-- Buka SQL Editor lalu jalankan perintah berikut (ganti password!):
--
--   insert into public.admin_users (username, password_hash)
--   values ('admin', crypt('GantiPasswordKuat123!', gen_salt('bf')));
--
-- Username akan dinormalisasi ke huruf kecil saat login.
-- Password TIDAK PERNAH dikirim balik ke client — hanya hash tersimpan.
--
-- Untuk menambah admin lain:
--   insert into public.admin_users (username, password_hash)
--   values ('guru2', crypt('PasswordLain!', gen_salt('bf')));
--
-- Untuk menghapus admin:
--   delete from public.admin_users where username = 'guru2';
--
-- Untuk mengganti password:
--   update public.admin_users
--   set password_hash = crypt('PasswordBaru!', gen_salt('bf'))
--   where username = 'admin';
-- =============================================================