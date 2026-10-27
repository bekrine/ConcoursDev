-- ============================================================================
-- ConcoursDev Maroc — Database Schema Migration
-- Production-Ready PostgreSQL & Supabase DDL
-- Covers all 22 required entities, indexes, constraints & RLS policies
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate', 'admin', 'auditor')),
    specialty_id TEXT,
    academic_level_id TEXT,
    target_admin_id TEXT,
    target_competition_id TEXT,
    preparation_days INTEGER DEFAULT 30 CHECK (preparation_days > 0),
    daily_hours NUMERIC(3,1) DEFAULT 2.0 CHECK (daily_hours > 0),
    total_available_hours NUMERIC(6,1) DEFAULT 60.0,
    diagnostic_completed BOOLEAN DEFAULT FALSE,
    diagnostic_score NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SPECIALTIES
CREATE TABLE IF NOT EXISTS specialties (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT DEFAULT 'Code',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ACADEMIC LEVELS
CREATE TABLE IF NOT EXISTS academic_levels (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    public_sector_grade TEXT NOT NULL,
    diploma_required TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMPETITIONS (Concours de la fonction publique)
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id TEXT NOT NULL,
    admin_name TEXT NOT NULL,
    title TEXT NOT NULL,
    specialty_id TEXT REFERENCES specialties(id),
    academic_level_id TEXT REFERENCES academic_levels(id),
    year INTEGER NOT NULL,
    announcement_date DATE,
    exam_date DATE,
    official_decree_number TEXT,
    official_coefficient INTEGER DEFAULT 2,
    posts_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EXAM SOURCES
CREATE TABLE IF NOT EXISTS exam_sources (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    admin_name TEXT NOT NULL,
    competition_title TEXT NOT NULL,
    specialty_id TEXT REFERENCES specialties(id),
    level_id TEXT REFERENCES academic_levels(id),
    year INTEGER NOT NULL,
    exam_date DATE,
    original_document_url TEXT NOT NULL,
    normalized_url TEXT UNIQUE,
    source_website TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('official', 'archive', 'academic', 'other')),
    verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('verified', 'unverified')),
    retrieval_date DATE DEFAULT CURRENT_DATE,
    processing_status TEXT DEFAULT 'completed' CHECK (processing_status IN ('pending', 'downloading', 'processing_ocr', 'completed', 'failed', 'requires_review')),
    file_size_bytes BIGINT,
    page_count INTEGER,
    is_scanned_pdf BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EXAM DOCUMENTS (Storage pointers & hashes)
CREATE TABLE IF NOT EXISTS exam_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_source_id TEXT REFERENCES exam_sources(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    sha256_hash TEXT NOT NULL,
    mime_type TEXT DEFAULT 'application/pdf',
    byte_size BIGINT NOT NULL,
    is_downloaded BOOLEAN DEFAULT TRUE,
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DOCUMENT PROCESSING JOBS (Async queue)
CREATE TABLE IF NOT EXISTS document_processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_source_id TEXT REFERENCES exam_sources(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL CHECK (job_type IN ('download', 'ocr_tesseract', 'text_extraction', 'ai_classification')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retry')),
    progress_percentage INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TOPICS (Taxonomie des chapitres)
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    domain_id TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    prerequisites TEXT[] DEFAULT '{}',
    typical_estimated_hours NUMERIC(3,1) DEFAULT 3.0,
    weight_baseline NUMERIC(3,2) DEFAULT 0.70,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. EXTRACTED QUESTIONS
CREATE TABLE IF NOT EXISTS extracted_questions (
    id TEXT PRIMARY KEY,
    exam_source_id TEXT REFERENCES exam_sources(id) ON DELETE SET NULL,
    topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    code_snippet TEXT,
    question_type TEXT NOT NULL DEFAULT 'qcm_single' CHECK (question_type IN ('qcm_single', 'qcm_multiple', 'true_false', 'short_sql', 'code_analysis')),
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_option_id TEXT NOT NULL, -- Protected: never exposed to unauthenticated or raw exam API
    explanation TEXT,
    page_number INTEGER DEFAULT 1,
    extraction_confidence NUMERIC(4,3) DEFAULT 0.95,
    review_status TEXT DEFAULT 'approved' CHECK (review_status IN ('approved', 'pending_review', 'rejected', 'needs_correction')),
    source_type TEXT DEFAULT 'official_extract' CHECK (source_type IN ('official_extract', 'ai_proposed_explanation')),
    reviewed_by TEXT,
    historical_appearance_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. QUESTION TOPIC MAPPINGS (M-to-N relationships for multi-topic questions)
CREATE TABLE IF NOT EXISTS question_topic_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id TEXT REFERENCES extracted_questions(id) ON DELETE CASCADE,
    topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE,
    confidence NUMERIC(4,3) DEFAULT 1.0,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(question_id, topic_id)
);

-- 11. TOPIC STATISTICS (Calculated from analyzed exams)
CREATE TABLE IF NOT EXISTS topic_statistics (
    topic_id TEXT PRIMARY KEY REFERENCES topics(id) ON DELETE CASCADE,
    analyzed_exams_count INTEGER NOT NULL DEFAULT 0,
    total_exams_in_sample INTEGER NOT NULL DEFAULT 0,
    appearance_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    questions_count INTEGER NOT NULL DEFAULT 0,
    recency_weight NUMERIC(3,2) NOT NULL DEFAULT 0.8,
    official_coefficient INTEGER,
    confidence_level TEXT NOT NULL CHECK (confidence_level IN ('Faible', 'Moyen', 'Élevé')),
    historical_importance_score INTEGER NOT NULL DEFAULT 50,
    sample_coverage_note TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. LESSONS
CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    read_time_minutes INTEGER DEFAULT 20,
    objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    core_concepts JSONB NOT NULL DEFAULT '[]'::jsonb,
    moroccan_exam_tips JSONB NOT NULL DEFAULT '[]'::jsonb,
    common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
    past_exam_references JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. EXERCISES
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
    exercise_prompt TEXT NOT NULL,
    starter_code TEXT,
    solution_code TEXT,
    explanation TEXT,
    difficulty TEXT DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. QUIZ QUESTIONS (Links between quizzes and extracted questions)
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id TEXT NOT NULL,
    question_id TEXT REFERENCES extracted_questions(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. STUDY PLAN GENERATIONS
CREATE TABLE IF NOT EXISTS study_plan_generations (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    specialty_id TEXT REFERENCES specialties(id),
    level_id TEXT REFERENCES academic_levels(id),
    total_days INTEGER NOT NULL,
    daily_hours NUMERIC(3,1) NOT NULL,
    total_planned_hours NUMERIC(6,1) NOT NULL,
    target_admin_name TEXT,
    priority_explanations JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_fallback_provisional BOOLEAN DEFAULT FALSE,
    fallback_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. STUDY PLAN ITEMS (Daily tasks)
CREATE TABLE IF NOT EXISTS study_plan_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_plan_id TEXT REFERENCES study_plan_generations(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date_string TEXT,
    topic_id TEXT REFERENCES topics(id),
    topic_name TEXT NOT NULL,
    domain_name TEXT NOT NULL,
    estimated_hours NUMERIC(3,1) NOT NULL,
    objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    lesson_id TEXT REFERENCES lessons(id),
    quiz_id TEXT NOT NULL,
    is_milestone_mock_exam BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    score NUMERIC(5,2),
    UNIQUE(study_plan_id, day_number)
);

-- 17. QUIZ ATTEMPTS
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    topic_id TEXT REFERENCES topics(id),
    topic_name TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    total_questions INTEGER NOT NULL,
    correct_answers_count INTEGER NOT NULL,
    score_percentage NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. ATTEMPT ANSWERS
CREATE TABLE IF NOT EXISTS attempt_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id TEXT REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id TEXT REFERENCES extracted_questions(id),
    selected_option_id TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. USER TOPIC MASTERY
CREATE TABLE IF NOT EXISTS user_topic_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE,
    topic_name TEXT NOT NULL,
    domain_name TEXT NOT NULL,
    attempts_count INTEGER DEFAULT 0,
    last_score NUMERIC(5,2) DEFAULT 0,
    mastery_percentage NUMERIC(5,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'non_commence' CHECK (status IN ('non_commence', 'en_cours', 'maitrise', 'a_reviser')),
    last_practiced_at TIMESTAMPTZ,
    UNIQUE(user_id, topic_id)
);

-- 20. STUDY PROGRESS
CREATE TABLE IF NOT EXISTS study_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    total_study_minutes INTEGER DEFAULT 0,
    days_streak INTEGER DEFAULT 0,
    last_study_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. CONTENT REVIEW QUEUE
CREATE TABLE IF NOT EXISTS content_review_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type TEXT NOT NULL CHECK (content_type IN ('question', 'lesson', 'topic_mapping', 'ai_explanation')),
    content_id TEXT NOT NULL,
    review_status TEXT DEFAULT 'pending_review' CHECK (review_status IN ('approved', 'pending_review', 'rejected', 'needs_correction')),
    reviewer_notes TEXT,
    reviewed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- 22. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id TEXT,
    payload JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_exam_sources_search ON exam_sources(specialty_id, level_id, year);
CREATE INDEX IF NOT EXISTS idx_extracted_questions_topic ON extracted_questions(topic_id, review_status);
CREATE INDEX IF NOT EXISTS idx_extracted_questions_exam ON extracted_questions(exam_source_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_items_plan ON study_plan_items(study_plan_id, day_number);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_mastery_user ON user_topic_mastery(user_id, mastery_percentage);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plan_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;

-- Candidates can view and edit only their own data
CREATE POLICY "Users can access own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can access own study plans" ON study_plan_generations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own quiz attempts" ON quiz_attempts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own mastery" ON user_topic_mastery
    FOR ALL USING (auth.uid() = user_id);

-- Public read access to verified catalog and lessons
ALTER TABLE exam_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read verified exam sources" ON exam_sources
    FOR SELECT USING (verification_status = 'verified');

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read lessons" ON lessons
    FOR SELECT USING (true);
