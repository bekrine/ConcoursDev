import {
  StudyPlan,
  StudyPlanDay,
  QuizAttempt,
  UserTopicMastery,
  ExtractedQuestion,
  ExamSource,
  UserProfile,
} from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { storageService } from './storage';

export class SupabaseDbService {
  /**
   * Save a newly generated study plan to Supabase PostgreSQL (or fallback to local storage)
   */
  async saveStudyPlan(plan: StudyPlan): Promise<void> {
    // Always persist to local cache for instant offline responsiveness
    storageService.saveStudyPlan(plan);

    if (!isSupabaseConfigured || !supabase) return;

    try {
      // 1. Insert or update header in study_plan_generations
      const { error: headerError } = await supabase
        .from('study_plan_generations')
        .upsert(
          {
            id: plan.id,
            user_id: plan.userId,
            version: plan.version,
            specialty_id: plan.specialtyId,
            level_id: plan.levelId,
            total_days: plan.totalDays,
            daily_hours: plan.dailyHours,
            total_planned_hours: plan.totalPlannedHours,
            target_admin_name: plan.targetAdminName || null,
            priority_explanations: plan.priorityExplanations,
            is_fallback_provisional: plan.isFallbackProvisional,
            fallback_reason: plan.fallbackReason || null,
            created_at: plan.createdAt,
          },
          { onConflict: 'id' }
        );

      if (headerError) {
        console.warn('[SupabaseDB] Erreur sauvegarde en-tête plan:', headerError.message);
        return;
      }

      // 2. Insert daily tasks in study_plan_items
      const planItems = plan.days.map((d) => ({
        study_plan_id: plan.id,
        day_number: d.dayNumber,
        date_string: d.dateString || null,
        topic_id: d.topicId,
        topic_name: d.topicName,
        domain_name: d.domainName,
        estimated_hours: d.estimatedHours,
        objectives: d.objectives,
        lesson_id: d.lessonId || null,
        quiz_id: d.quizId,
        is_milestone_mock_exam: d.isMilestoneMockExam || false,
        is_completed: d.isCompleted,
        completed_at: d.completedAt || null,
        score: d.score || null,
      }));

      const { error: itemsError } = await supabase
        .from('study_plan_items')
        .upsert(planItems, { onConflict: 'study_plan_id,day_number' });

      if (itemsError) {
        console.warn('[SupabaseDB] Erreur sauvegarde éléments du plan:', itemsError.message);
      }
    } catch (err) {
      console.warn('[SupabaseDB] Exception lors de la sauvegarde du plan d\'études:', err);
    }
  }

  /**
   * Fetch study plans for a specific user with RLS verification
   */
  async getStudyPlansForUser(userId: string): Promise<StudyPlan[]> {
    if (!isSupabaseConfigured || !supabase) {
      return storageService.getStudyPlansForUser(userId);
    }

    try {
      const { data: headers, error: headerError } = await supabase
        .from('study_plan_generations')
        .select('*')
        .eq('user_id', userId)
        .order('version', { ascending: false });

      if (headerError || !headers || headers.length === 0) {
        return storageService.getStudyPlansForUser(userId);
      }

      const plans: StudyPlan[] = [];

      for (const h of headers) {
        const { data: items, error: itemsError } = await supabase
          .from('study_plan_items')
          .select('*')
          .eq('study_plan_id', h.id)
          .order('day_number', { ascending: true });

        const days: StudyPlanDay[] = (items || []).map((i) => ({
          dayNumber: i.day_number,
          dateString: i.date_string || undefined,
          topicId: i.topic_id,
          topicName: i.topic_name,
          domainName: i.domain_name,
          estimatedHours: Number(i.estimated_hours) || 2,
          objectives: i.objectives || [],
          lessonId: i.lesson_id || 'les_sql_queries',
          quizId: i.quiz_id,
          isMilestoneMockExam: i.is_milestone_mock_exam || false,
          isCompleted: i.is_completed || false,
          completedAt: i.completed_at || undefined,
          score: i.score ? Number(i.score) : undefined,
        }));

        plans.push({
          id: h.id,
          userId: h.user_id,
          version: h.version,
          createdAt: h.created_at,
          specialtyId: h.specialty_id,
          levelId: h.level_id,
          totalDays: h.total_days,
          dailyHours: Number(h.daily_hours),
          totalPlannedHours: Number(h.total_planned_hours),
          targetAdminName: h.target_admin_name || undefined,
          priorityExplanations: h.priority_explanations || [],
          days,
          isFallbackProvisional: h.is_fallback_provisional || false,
          fallbackReason: h.fallback_reason || undefined,
        });
      }

      return plans.length > 0 ? plans : storageService.getStudyPlansForUser(userId);
    } catch (err) {
      console.warn('[SupabaseDB] Exception lecture plans:', err);
      return storageService.getStudyPlansForUser(userId);
    }
  }

  /**
   * Save a quiz attempt with answers and update candidate mastery
   */
  async saveQuizAttempt(attempt: QuizAttempt): Promise<void> {
    // Persist locally
    storageService.saveQuizAttempt(attempt);

    if (!isSupabaseConfigured || !supabase) return;

    try {
      const { error: attemptError } = await supabase.from('quiz_attempts').insert({
        id: attempt.id,
        quiz_id: attempt.quizId,
        user_id: attempt.userId,
        topic_id: attempt.topicId,
        topic_name: attempt.topicName,
        started_at: attempt.startedAt,
        submitted_at: attempt.submittedAt,
        total_questions: attempt.totalQuestions,
        correct_answers_count: attempt.correctAnswersCount,
        score_percentage: attempt.scorePercentage,
      });

      if (attemptError) {
        console.warn('[SupabaseDB] Erreur enregistrement tentative:', attemptError.message);
        return;
      }

      // Save individual answer rows
      if (attempt.answers.length > 0) {
        const answersToInsert = attempt.answers.map((a) => ({
          attempt_id: attempt.id,
          question_id: a.questionId,
          selected_option_id: a.selectedOptionId,
          is_correct: a.isCorrect,
          explanation: a.explanation,
        }));

        await supabase.from('attempt_answers').insert(answersToInsert);
      }
    } catch (err) {
      console.warn('[SupabaseDB] Exception enregistrement tentative quiz:', err);
    }
  }

  /**
   * Update candidate topic mastery in Supabase
   */
  async saveUserMastery(userId: string, mastery: UserTopicMastery[]): Promise<void> {
    storageService.saveUserMastery(userId, mastery);

    if (!isSupabaseConfigured || !supabase) return;

    try {
      const rows = mastery.map((m) => ({
        user_id: userId,
        topic_id: m.topicId,
        topic_name: m.topicName,
        domain_name: m.domainName,
        attempts_count: m.attemptsCount,
        last_score: m.lastScore,
        mastery_percentage: m.masteryPercentage,
        status: m.status,
        last_practiced_at: m.lastPracticedAt || null,
      }));

      await supabase
        .from('user_topic_mastery')
        .upsert(rows, { onConflict: 'user_id,topic_id' });
    } catch (err) {
      console.warn('[SupabaseDB] Exception sauvegarde maîtrise utilisateur:', err);
    }
  }

  /**
   * Sync profile updates
   */
  async updateProfile(profile: UserProfile): Promise<void> {
    storageService.setCurrentUser(profile);

    if (!isSupabaseConfigured || !supabase) return;

    try {
      await supabase
        .from('profiles')
        .update({
          full_name: profile.fullName,
          specialty_id: profile.specialtyId,
          academic_level_id: profile.levelId,
          target_admin_id: profile.targetAdminId || null,
          preparation_days: profile.preparationDays,
          daily_hours: profile.dailyHours,
          total_available_hours: profile.totalAvailableHours,
          diagnostic_completed: profile.diagnosticCompleted,
          diagnostic_score: profile.diagnosticScore || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
    } catch (err) {
      console.warn('[SupabaseDB] Exception mise à jour profil:', err);
    }
  }
}

export const supabaseDbService = new SupabaseDbService();
