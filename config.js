// =============================================================
// Konfigurasi Supabase — JANGAN ganti URL / publishable key.
// Service role key TIDAK boleh ada di sini.
// =============================================================
const SUPABASE_URL = "https://ylzphagmucvmnaxvwakb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_yt-Vq3T5MqSwmolc6GLsfg_R3y9FVDL";

// Klien Supabase global. Library @supabase/supabase-js@2 harus dimuat lebih dahulu.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

