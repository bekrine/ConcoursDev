-- ============================================================================
-- ConcoursDev Maroc — Migration 02: Auth Trigger & RLS Enhancements
-- Non-destructive idempotent migration for Supabase Auth & PostgreSQL
-- ============================================================================

-- 1. Automatic Profile Creation Trigger on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    specialty_id,
    academic_level_id,
    preparation_days,
    daily_hours,
    total_available_hours,
    diagnostic_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidate'),
    COALESCE(NEW.raw_user_meta_data->>'specialty_id', 'spec_dev'),
    COALESCE(NEW.raw_user_meta_data->>'level_id', 'lvl_bac2'),
    COALESCE((NEW.raw_user_meta_data->>'preparation_days')::integer, 30),
    COALESCE((NEW.raw_user_meta_data->>'daily_hours')::numeric, 2.0),
    COALESCE((NEW.raw_user_meta_data->>'total_available_hours')::numeric, 60.0),
    FALSE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Enhanced RLS Policies for Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can access own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 3. Enhanced RLS Policies for Study Plans
DROP POLICY IF EXISTS "Users can access own study plans" ON study_plan_generations;
DROP POLICY IF EXISTS "Users can view own study plans" ON study_plan_generations;
DROP POLICY IF EXISTS "Users can insert own study plans" ON study_plan_generations;
DROP POLICY IF EXISTS "Users can update own study plans" ON study_plan_generations;

CREATE POLICY "Users can view own study plans" ON study_plan_generations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study plans" ON study_plan_generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study plans" ON study_plan_generations
    FOR UPDATE USING (auth.uid() = user_id);

-- Study Plan Items
DROP POLICY IF EXISTS "Users can view own plan items" ON study_plan_items;
DROP POLICY IF EXISTS "Users can modify own plan items" ON study_plan_items;

CREATE POLICY "Users can view own plan items" ON study_plan_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM study_plan_generations
            WHERE study_plan_generations.id = study_plan_items.study_plan_id
            AND study_plan_generations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can modify own plan items" ON study_plan_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM study_plan_generations
            WHERE study_plan_generations.id = study_plan_items.study_plan_id
            AND study_plan_generations.user_id = auth.uid()
        )
    );

-- 4. Enhanced RLS Policies for Quiz Attempts & Answers
DROP POLICY IF EXISTS "Users can access own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can view own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON quiz_attempts;

CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Attempt Answers
DROP POLICY IF EXISTS "Users can view own attempt answers" ON attempt_answers;
DROP POLICY IF EXISTS "Users can insert own attempt answers" ON attempt_answers;

CREATE POLICY "Users can view own attempt answers" ON attempt_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quiz_attempts
            WHERE quiz_attempts.id = attempt_answers.attempt_id
            AND quiz_attempts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own attempt answers" ON attempt_answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM quiz_attempts
            WHERE quiz_attempts.id = attempt_answers.attempt_id
            AND quiz_attempts.user_id = auth.uid()
        )
    );

-- 5. Enhanced RLS Policies for User Topic Mastery
DROP POLICY IF EXISTS "Users can access own mastery" ON user_topic_mastery;
DROP POLICY IF EXISTS "Users can view own mastery" ON user_topic_mastery;
DROP POLICY IF EXISTS "Users can manage own mastery" ON user_topic_mastery;

CREATE POLICY "Users can view own mastery" ON user_topic_mastery
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own mastery" ON user_topic_mastery
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Public Catalog & Educational Content Policies (Safe Read for Authenticated & Anon)
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read specialties" ON specialties;
CREATE POLICY "Public read specialties" ON specialties FOR SELECT USING (true);

ALTER TABLE academic_levels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read academic levels" ON academic_levels;
CREATE POLICY "Public read academic levels" ON academic_levels FOR SELECT USING (true);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read topics" ON topics;
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (true);

ALTER TABLE topic_statistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read topic statistics" ON topic_statistics;
CREATE POLICY "Public read topic statistics" ON topic_statistics FOR SELECT USING (true);

ALTER TABLE extracted_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read approved extracted questions" ON extracted_questions;
CREATE POLICY "Public read approved extracted questions" ON extracted_questions
    FOR SELECT USING (review_status = 'approved');

-- Admin bypass policy for review queue
DROP POLICY IF EXISTS "Admins can view and edit all questions" ON extracted_questions;
CREATE POLICY "Admins can view and edit all questions" ON extracted_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
