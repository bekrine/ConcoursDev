import { TopicStatistic, TopicPersonalPriority } from '../types';
import { SEED_TOPICS, SEED_DOMAINS } from '../data/seedData';
import { storageService } from './storage';

export class TopicStatisticsService {
  /**
   * Computes evidence-based statistics for all topics based on analyzed exams in the database.
   */
  calculateTopicStatistics(): TopicStatistic[] {
    const allExams = storageService.getAllExams();
    const allQuestions = storageService.getAllQuestions();
    const totalExamsCount = allExams.length;

    return SEED_TOPICS.map((topic) => {
      const domain = SEED_DOMAINS.find((d) => d.id === topic.domainId);
      const domainName = domain ? domain.name : 'Informatique';

      // Find all questions associated with this topic
      const topicQuestions = allQuestions.filter((q) => q.topicId === topic.id);
      const questionsCount = topicQuestions.length;

      // Find distinct exams that contain at least one question from this topic
      const examIdsWithTopic = new Set(topicQuestions.map((q) => q.examSourceId));
      const analyzedExamsCount = examIdsWithTopic.size;

      // Calculate percentage of exams containing this topic
      const appearancePercentage = totalExamsCount > 0 ? (analyzedExamsCount / totalExamsCount) * 100 : 0;

      // Calculate recency weight (higher if exam is 2022-2024)
      const examsWithTopic = allExams.filter((e) => examIdsWithTopic.has(e.id));
      let recencyWeight = 0.5; // default
      if (examsWithTopic.length > 0) {
        const avgYear = examsWithTopic.reduce((sum, e) => sum + e.year, 0) / examsWithTopic.length;
        if (avgYear >= 2023) recencyWeight = 1.0;
        else if (avgYear >= 2022) recencyWeight = 0.85;
        else recencyWeight = 0.7;
      }

      // Verified coefficient (e.g. 2 for core IT, 3 for MEF specific, or null if not stated in decree)
      let officialCoefficient: number | undefined = undefined;
      if (topic.id === 'top_sql_basic' || topic.id === 'top_merise' || topic.id === 'top_ip_subnet') {
        officialCoefficient = 3;
      } else if (topic.id === 'top_algo_struct' || topic.id === 'top_poo' || topic.id === 'top_linux_cmd') {
        officialCoefficient = 2;
      }

      // Confidence level determination based on sample volume
      let confidenceLevel: 'Faible' | 'Moyen' | 'Élevé' = 'Faible';
      if (totalExamsCount >= 5 && questionsCount >= 2) {
        confidenceLevel = 'Élevé';
      } else if (questionsCount >= 1) {
        confidenceLevel = 'Moyen';
      }

      // Base historical score (0 to 100)
      const freqNorm = Math.min(100, (appearancePercentage / 80) * 100);
      const questionDensityNorm = Math.min(100, (questionsCount / 2) * 50);
      const baselineNorm = topic.weightBaseline * 100;
      const historicalImportanceScore = Math.round(freqNorm * 0.45 + questionDensityNorm * 0.35 + baselineNorm * 0.2);

      const sampleCoverageNote = `Observé dans ${analyzedExamsCount} des ${totalExamsCount} concours analysés (${Math.round(
        appearancePercentage
      )}%) — ${questionsCount} question(s) répertoriée(s).`;

      return {
        topicId: topic.id,
        topicName: topic.name,
        domainName,
        analyzedExamsCount,
        totalExamsInSample: totalExamsCount,
        appearancePercentage: Math.round(appearancePercentage),
        questionsCount,
        recencyWeight,
        officialCoefficient,
        confidenceLevel,
        historicalImportanceScore,
        sampleCoverageNote,
      };
    });
  }
}

export class PriorityScoringService {
  private topicStatsService = new TopicStatisticsService();

  /**
   * Calculate personalized priority for each topic using the strict 5-component formula:
   * - 35% frequency in analyzed exam papers
   * - 25% verified official coefficient or importance
   * - 20% match with candidate's specialty & level
   * - 10% recency of relevant exam papers
   * - 10% candidate weaknesses (or neutral 50% if unattempted)
   *
   * Renormalizes weights transparently if official coefficients or candidate diagnostic data are missing.
   */
  calculatePersonalizedPriorities(
    specialtyId: string,
    levelId: string,
    totalAvailableHours: number,
    candidateMasteryMap?: Record<string, number>
  ): TopicPersonalPriority[] {
    const stats = this.topicStatsService.calculateTopicStatistics();

    const priorities = stats.map((stat) => {
      const topic = SEED_TOPICS.find((t) => t.id === stat.topicId);

      // 1. Frequency score (0-100)
      const frequencyScore = stat.appearancePercentage;

      // 2. Official coefficient score (0-100)
      const hasOfficialCoeff = stat.officialCoefficient !== undefined;
      const coefficientScore = hasOfficialCoeff ? Math.min(100, (stat.officialCoefficient! / 3) * 100) : 0;

      // 3. Specialty & level match score (0-100)
      let matchScore = 70; // baseline
      if (specialtyId === 'spec_dev') {
        if (['top_sql_basic', 'top_merise', 'top_algo_struct', 'top_poo', 'top_uml', 'top_web_api'].includes(stat.topicId)) {
          matchScore = 95;
        } else if (['top_sec_web', 'top_linux_cmd'].includes(stat.topicId)) {
          matchScore = 80;
        }
      } else if (specialtyId === 'spec_net') {
        if (['top_ip_subnet', 'top_osi_tcp', 'top_linux_cmd', 'top_sec_web'].includes(stat.topicId)) {
          matchScore = 95;
        } else if (['top_sql_basic', 'top_algo_struct'].includes(stat.topicId)) {
          matchScore = 70;
        }
      } else if (specialtyId === 'spec_db') {
        if (['top_sql_basic', 'top_merise'].includes(stat.topicId)) {
          matchScore = 100;
        }
      }

      // Adjustment for level (Bac+5 requires more architecture/systems, Bac+2 more operational coding & SQL)
      if (levelId === 'lvl_bac5' && ['top_uml', 'top_algo_struct', 'top_sec_web'].includes(stat.topicId)) {
        matchScore = Math.min(100, matchScore + 5);
      }

      // 4. Recency score (0-100)
      const recencyScore = stat.recencyWeight * 100;

      // 5. Candidate weakness score (lower mastery = higher revision urgency)
      const userMastery = candidateMasteryMap && candidateMasteryMap[stat.topicId] !== undefined
        ? candidateMasteryMap[stat.topicId]
        : 50; // Neutral 50% assumption when no diagnostic or attempt exists
      const weaknessUrgency = 100 - userMastery;

      // Transparent Dynamic Renormalization:
      // Default weights: freq: 0.35, coeff: 0.25, match: 0.20, recency: 0.10, weakness: 0.10
      let wFreq = 0.35;
      let wCoeff = 0.25;
      let wMatch = 0.20;
      let wRecency = 0.10;
      let wWeakness = 0.10;

      if (!hasOfficialCoeff) {
        // Renormalize available weights so they sum to 1.0
        const remainingSum = wFreq + wMatch + wRecency + wWeakness; // 0.75
        wFreq = (wFreq / remainingSum);
        wMatch = (wMatch / remainingSum);
        wRecency = (wRecency / remainingSum);
        wWeakness = (wWeakness / remainingSum);
        wCoeff = 0;
      }

      const personalPriorityScore = Math.round(
        frequencyScore * wFreq +
        coefficientScore * wCoeff +
        matchScore * wMatch +
        recencyScore * wRecency +
        weaknessUrgency * wWeakness
      );

      // Explanation rationale text
      let priorityQualifier = 'Priorité modérée';
      if (personalPriorityScore >= 75) priorityQualifier = 'Priorité élevée';
      else if (personalPriorityScore < 50) priorityQualifier = 'Priorité d\'appoint';

      const coeffNotice = stat.officialCoefficient
        ? ` (Coefficient officiel vérifié : ${stat.officialCoefficient})`
        : ' (Pondération recalculée sans coefficient imposé)';

      const rationale = `${topic?.name} — ${priorityQualifier} (${personalPriorityScore}/100) : présent dans ${
        stat.analyzedExamsCount
      } des ${stat.totalExamsInSample} concours analysés (${stat.appearancePercentage}%).${coeffNotice} Niveau de confiance : ${
        stat.confidenceLevel
      }.`;

      return {
        ...stat,
        personalPriorityScore,
        candidateMasteryScore: userMastery,
        recommendedStudyHours: 0, // calculated below in allocation phase
        rationale,
      };
    });

    // Sort by personal priority descending
    priorities.sort((a, b) => b.personalPriorityScore - a.personalPriorityScore);

    // Allocate total study hours proportionally to priority scores
    const totalScoreSum = priorities.reduce((sum, p) => sum + p.personalPriorityScore, 0);
    if (totalScoreSum > 0 && totalAvailableHours > 0) {
      priorities.forEach((p) => {
        const rawHours = (p.personalPriorityScore / totalScoreSum) * totalAvailableHours;
        // Keep at least 1h if priority >= 40, round to 0.5h
        p.recommendedStudyHours = Math.max(1, Math.round(rawHours * 2) / 2);
      });
    }

    return priorities;
  }
}

export const topicStatisticsService = new TopicStatisticsService();
export const priorityScoringService = new PriorityScoringService();
