import { StudyPlan, StudyPlanDay, UserProfile } from '../types';
import { SEED_TOPICS, SEED_LESSONS, SEED_ADMINISTRATIONS } from '../data/seedData';
import { priorityScoringService } from './topicStatisticsService';
import { storageService } from './storage';

export class StudyPlanGeneratorService {
  /**
   * Generates a realistic, personalized, dynamic study plan.
   * If existing completed days exist, preserves completed work and only regenerates remaining days.
   */
  generatePlan(
    user: UserProfile,
    options?: {
      targetAdminId?: string;
      targetCompetitionId?: string;
      customDays?: number;
      customDailyHours?: number;
      preserveExistingPlanId?: string;
    }
  ): StudyPlan {
    const totalDays = options?.customDays || user.preparationDays || 30;
    const dailyHours = options?.customDailyHours || user.dailyHours || 2;
    const totalHours = totalDays * dailyHours;

    // 1. Fetch user mastery from previous attempts
    const masteryList = storageService.getUserMastery(user.id);
    const masteryMap: Record<string, number> = {};
    masteryList.forEach((m) => {
      masteryMap[m.topicId] = m.masteryPercentage;
    });

    // 2. Compute prioritized topics using evidence-based scoring
    const prioritizedTopics = priorityScoringService.calculatePersonalizedPriorities(
      user.specialtyId,
      user.levelId,
      totalHours,
      masteryMap
    );

    // 3. Select topics fitting the timeframe
    // For short plans (7-15 days), focus on top 4-6 highest-yield topics
    // For medium plans (30 days), cover 8-10 topics + 2 revision/mock days
    // For long plans (60-90 days), deep coverage + cumulative revision
    const targetAdmin = options?.targetAdminId
      ? SEED_ADMINISTRATIONS.find((a) => a.id === options.targetAdminId)
      : undefined;

    const priorityExplanations = prioritizedTopics.slice(0, 5).map((p) => ({
      topicId: p.topicId,
      topicName: p.topicName,
      priority: p.personalPriorityScore >= 75 ? 'Élevée' : 'Moyenne',
      reason: p.rationale,
    }));

    // 4. Order topics respecting pedagogical prerequisites
    // e.g. Algorithmique before POO; SQL basic before Merise; OSI before Subnetting
    const orderedTopics = this.orderTopicsWithPrerequisites(prioritizedTopics);

    // Check if there is an existing plan to preserve completed work
    let existingPlan: StudyPlan | undefined = undefined;
    if (options?.preserveExistingPlanId) {
      const existingPlans = storageService.getStudyPlansForUser(user.id);
      existingPlan = existingPlans.find((p) => p.id === options.preserveExistingPlanId);
    }

    const completedDaysMap = new Map<number, StudyPlanDay>();
    if (existingPlan) {
      existingPlan.days.forEach((d) => {
        if (d.isCompleted) {
          completedDaysMap.set(d.dayNumber, d);
        }
      });
    }

    // 5. Build daily schedule
    const days: StudyPlanDay[] = [];
    const today = new Date();

    let topicCursor = 0;
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      // If day was already completed in existing plan, retain it!
      if (completedDaysMap.has(dayNum)) {
        days.push(completedDaysMap.get(dayNum)!);
        continue;
      }

      const planDate = new Date(today);
      planDate.setDate(today.getDate() + (dayNum - 1));
      const dateString = planDate.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });

      // Reserve milestone mock exam days
      const isLastDay = dayNum === totalDays && totalDays >= 15;
      const isMidRevision = totalDays >= 30 && dayNum === Math.floor(totalDays / 2);

      if (isLastDay) {
        days.push({
          dayNumber: dayNum,
          dateString,
          topicId: 'mock_exam_final',
          topicName: `Concours Blanc Intégral — Épreuve d'admissibilité ${targetAdmin ? targetAdmin.shortName : 'Générale'}`,
          domainName: 'Examen Blanc & Synthèse',
          estimatedHours: dailyHours,
          objectives: [
            'Simulation en temps limité de 60 questions multidisciplinaires',
            'Gestion du stress et entraînement au format officiel du concours',
            'Détection des ultimes axes de révision avant le jour J',
          ],
          lessonId: 'les_sql_queries', // default reference
          quizId: 'quiz_mock_final',
          isMilestoneMockExam: true,
          isCompleted: false,
        });
        continue;
      }

      if (isMidRevision) {
        days.push({
          dayNumber: dayNum,
          dateString,
          topicId: 'mid_revision',
          topicName: 'Révision Mi-Parcours : Consolidation des points faibles',
          domainName: 'Révision Adaptative',
          estimatedHours: dailyHours,
          objectives: [
            'Révision ciblée sur les notions ayant obtenu moins de 70% de réussite aux QCM précédents',
            'Exercices pratiques chronométrés',
          ],
          lessonId: 'les_subnetting',
          quizId: 'quiz_mid_term',
          isMilestoneMockExam: false,
          isCompleted: false,
        });
        continue;
      }

      // Assign next topic from ordered list (cycle if longer plan than topics)
      const currentTopic = orderedTopics[topicCursor % orderedTopics.length];
      topicCursor++;

      // Find matching lesson or fallback
      const matchingLesson = SEED_LESSONS.find((l) => l.topicId === currentTopic.topicId) || SEED_LESSONS[0];

      // Objectives
      const objectives = [
        `Étudier la leçon approfondie : ${currentTopic.topicName}`,
        `Résoudre les exercices d'application et analyser les erreurs types`,
        `Passer le QCM de validation de fin de chapitre (seuil de réussite : 70%)`,
      ];

      days.push({
        dayNumber: dayNum,
        dateString,
        topicId: currentTopic.topicId,
        topicName: currentTopic.topicName,
        domainName: currentTopic.domainName,
        estimatedHours: dailyHours,
        objectives,
        lessonId: matchingLesson.id,
        quizId: `quiz_${currentTopic.topicId}`,
        isCompleted: false,
      });
    }

    const version = existingPlan ? existingPlan.version + 1 : 1;
    const planId = `plan_${user.id}_v${version}_${Date.now()}`;

    const newPlan: StudyPlan = {
      id: planId,
      userId: user.id,
      version,
      createdAt: new Date().toISOString(),
      specialtyId: user.specialtyId,
      levelId: user.levelId,
      totalDays,
      dailyHours,
      totalPlannedHours: totalDays * dailyHours,
      targetAdminName: targetAdmin?.name,
      priorityExplanations,
      days,
      isFallbackProvisional: false,
    };

    // Persist plan
    storageService.saveStudyPlan(newPlan);

    return newPlan;
  }

  /**
   * Reorder topics so prerequisites precede dependent topics
   */
  private orderTopicsWithPrerequisites(prioritized: ReturnType<typeof priorityScoringService.calculatePersonalizedPriorities>) {
    const list = [...prioritized];
    const ordered: typeof prioritized = [];
    const visitedIds = new Set<string>();

    // Topic dictionary
    const topicMap = new Map(SEED_TOPICS.map((t) => [t.id, t]));

    function visit(topicItem: (typeof prioritized)[0]) {
      if (visitedIds.has(topicItem.topicId)) return;
      const t = topicMap.get(topicItem.topicId);
      if (t && t.prerequisites && t.prerequisites.length > 0) {
        for (const prereqId of t.prerequisites) {
          const prereqItem = list.find((p) => p.topicId === prereqId);
          if (prereqItem && !visitedIds.has(prereqId)) {
            visit(prereqItem);
          }
        }
      }
      visitedIds.add(topicItem.topicId);
      ordered.push(topicItem);
    }

    for (const item of list) {
      visit(item);
    }

    return ordered;
  }
}

export const studyPlanGeneratorService = new StudyPlanGeneratorService();
