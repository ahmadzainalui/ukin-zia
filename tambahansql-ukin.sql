-- ==========================================
-- 1. TABEL KUNJUNGAN (VISITS)
-- ==========================================
DROP TABLE IF EXISTS site_visits_ukin;

CREATE TABLE site_visits_ukin (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    page_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_visits_ukin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for visits"
ON site_visits_ukin FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public read for visits"
ON site_visits_ukin FOR SELECT TO anon USING (true);

-- ==========================================
-- 2. TABEL EXIT TICKET
-- ==========================================
DROP TABLE IF EXISTS exit_ticket_submissions_ukin;

CREATE TABLE exit_ticket_submissions_ukin (
    id BIGSERIAL PRIMARY KEY,
    student_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    group_name TEXT,
    role_name TEXT,
    q1_essay TEXT,
    q2_essay TEXT,
    q3_essay TEXT,
    q4_essay TEXT,
    ref_check_1 TEXT,
    ref_check_2 TEXT,
    ref_check_3 TEXT,
    ref_text_1 TEXT,
    ref_text_2 TEXT,
    ref_text_3 TEXT,
    peer_assessment JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    final_score NUMERIC -- Kolom nilai manual dari guru
);

ALTER TABLE exit_ticket_submissions_ukin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for exit ticket"
ON exit_ticket_submissions_ukin FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public read for exit ticket"
ON exit_ticket_submissions_ukin FOR SELECT TO anon USING (true);

-- ==========================================
-- 3. FUNGSI RPC ADMIN
-- ==========================================

-- RPC: Ambil Data
CREATE OR REPLACE FUNCTION admin_get_submissions_ukin(p_token TEXT)
RETURNS TABLE (
    id BIGINT, student_name TEXT, class_name TEXT, group_name TEXT, role_name TEXT,
    q1_essay TEXT, q2_essay TEXT, q3_essay TEXT, q4_essay TEXT,
    ref_check_1 TEXT, ref_check_2 TEXT, ref_check_3 TEXT, ref_text_1 TEXT, ref_text_2 TEXT, ref_text_3 TEXT,
    peer_assessment JSONB, created_at TIMESTAMPTZ, final_score NUMERIC
) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin_sessions WHERE token = p_token AND expires_at > NOW()) THEN
        RAISE EXCEPTION 'Sesi tidak valid atau sudah berakhir';
    END IF;
    RETURN QUERY 
    SELECT s.id, s.student_name, s.class_name, s.group_name, s.role_name, 
           s.q1_essay, s.q2_essay, s.q3_essay, s.q4_essay, 
           s.ref_check_1, s.ref_check_2, s.ref_check_3, 
           s.ref_text_1, s.ref_text_2, s.ref_text_3, 
           s.peer_assessment, s.created_at, s.final_score
    FROM exit_ticket_submissions_ukin s
    ORDER BY s.created_at DESC;
END;
$$;

-- RPC: Simpan Nilai Manual
CREATE OR REPLACE FUNCTION admin_update_score(p_token TEXT, p_id BIGINT, p_score NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin_sessions WHERE token = p_token AND expires_at > NOW()) THEN
        RAISE EXCEPTION 'Sesi tidak valid atau sudah berakhir';
    END IF;
    
    UPDATE exit_ticket_submissions_ukin 
    SET final_score = p_score 
    WHERE id = p_id;
    
    RETURN TRUE;
END;
$$;

-- RPC: Statistik (PERBAIKAN: FROM site_visits_ukin)
CREATE OR REPLACE FUNCTION admin_get_stats_ukin(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_visits INT;
    v_submissions INT;
    v_classes INT;
    v_result JSON;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin_sessions WHERE token = p_token AND expires_at > NOW()) THEN
        RAISE EXCEPTION 'Sesi tidak valid atau sudah berakhir';
    END IF;

    SELECT COUNT(*) INTO v_visits FROM site_visits_ukin; -- Diperbaiki
    SELECT COUNT(*) INTO v_submissions FROM exit_ticket_submissions_ukin;
    SELECT COUNT(DISTINCT class_name) INTO v_classes FROM exit_ticket_submissions_ukin;

    v_result := json_build_object(
        'total_visits', v_visits,
        'total_submissions', v_submissions,
        'class_count', v_classes
    );
    RETURN v_result;
END;
$$;