import {
  LessonContent,
  ExtractedQuestion,
  QuizAttempt,
  UserTopicMastery,
  ReviewStatus,
} from '../types';
import { SEED_LESSONS, SEED_TOPICS } from '../data/seedData';
import { storageService } from './storage';

export class LessonService {
  getLessonById(lessonId: string): LessonContent | undefined {
    return SEED_LESSONS.find((l) => l.id === lessonId);
  }

  getLessonByTopic(topicId: string): LessonContent | undefined {
    return SEED_LESSONS.find((l) => l.topicId === topicId) || SEED_LESSONS[0];
  }

  getAllLessons(): LessonContent[] {
    return SEED_LESSONS;
  }
}

export interface QuizSubmissionPayload {
  userId: string;
  topicId: string;
  topicName: string;
  startedAt: string;
  answers: {
    questionId: string;
    selectedOptionId: string;
  }[];
}

export class QuizService {
  /**
   * Retrieves questions for a quiz WITHOUT the answer keys (protects against inspection).
   */
  getQuizQuestionsForCandidate(topicId: string, limit: number = 5): Omit<ExtractedQuestion, 'correctOptionId' | 'explanation'>[] {
    const all = storageService.getAllQuestions();
    let topicQuestions = all.filter((q) => q.topicId === topicId && q.reviewStatus !== 'rejected');

    if (topicQuestions.length === 0) {
      // fallback to any questions
      topicQuestions = all.slice(0, limit);
    } else if (topicQuestions.length < limit) {
      // complete with relevant questions
      const others = all.filter((q) => q.topicId !== topicId && q.reviewStatus !== 'rejected');
      topicQuestions = [...topicQuestions, ...others.slice(0, limit - topicQuestions.length)];
    }

    // Strip answers
    return topicQuestions.slice(0, limit).map((q) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { correctOptionId, explanation, ...safeQuestion } = q;
      return safeQuestion;
    });
  }

  /**
   * Submits candidate answers, evaluates securely on the server-side logic,
   * stores attempt, and triggers mastery updates.
   */
  submitQuizAttempt(payload: QuizSubmissionPayload): QuizAttempt {
    const allQuestions = storageService.getAllQuestions();
    let correctCount = 0;

    const evaluatedAnswers = payload.answers.map((ans) => {
      const q = allQuestions.find((item) => item.id === ans.questionId);
      const isCorrect = q ? q.correctOptionId === ans.selectedOptionId : false;
      if (isCorrect) correctCount++;

      return {
        questionId: ans.questionId,
        selectedOptionId: ans.selectedOptionId,
        isCorrect,
        explanation: q ? q.explanation : 'Aucune explication disponible.',
      };
    });

    const totalQuestions = payload.answers.length;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      quizId: `quiz_${payload.topicId}`,
      userId: payload.userId,
      topicId: payload.topicId,
      topicName: payload.topicName,
      startedAt: payload.startedAt,
      submittedAt: new Date().toISOString(),
      totalQuestions,
      correctAnswersCount: correctCount,
      scorePercentage,
      answers: evaluatedAnswers,
    };

    // Save attempt
    storageService.saveQuizAttempt(attempt);

    // Update user mastery through ProgressService
    progressService.recordAttemptScore(payload.userId, payload.topicId, scorePercentage);

    return attempt;
  }
}

export class ProgressService {
  /**
   * Updates mastery score for a topic using moving average and attempts count.
   */
  recordAttemptScore(userId: string, topicId: string, score: number): void {
    const userMasteryList = storageService.getUserMastery(userId);
    const item = userMasteryList.find((m) => m.topicId === topicId);

    if (item) {
      item.attemptsCount += 1;
      item.lastScore = score;
      item.lastPracticedAt = new Date().toISOString();

      // Exponential moving average: 60% recent score + 40% previous mastery
      if (item.attemptsCount === 1) {
        item.masteryPercentage = score;
      } else {
        item.masteryPercentage = Math.round(item.masteryPercentage * 0.4 + score * 0.6);
      }

      if (item.masteryPercentage >= 75) {
        item.status = 'maitrise';
      } else if (item.masteryPercentage < 60) {
        item.status = 'a_reviser';
      } else {
        item.status = 'en_cours';
      }
    } else {
      const topic = SEED_TOPICS.find((t) => t.id === topicId);
      userMasteryList.push({
        topicId,
        topicName: topic?.name || topicId,
        domainName: 'Informatique',
        attemptsCount: 1,
        lastScore: score,
        masteryPercentage: score,
        status: score >= 75 ? 'maitrise' : score < 60 ? 'a_reviser' : 'en_cours',
        lastPracticedAt: new Date().toISOString(),
      });
    }

    storageService.saveUserMastery(userId, userMasteryList);
  }

  /**
   * Identifies weak topics for adaptive recommendations
   */
  getWeakTopics(userId: string): UserTopicMastery[] {
    const list = storageService.getUserMastery(userId);
    return list.filter((m) => m.attemptsCount > 0 && m.masteryPercentage < 65);
  }

  /**
   * Global candidate summary
   */
  getDashboardSummary(userId: string) {
    const attempts = storageService.getQuizAttempts(userId);
    const plans = storageService.getStudyPlansForUser(userId);
    const mastery = storageService.getUserMastery(userId);

    const activePlan = plans[0] || null;
    const completedDaysCount = activePlan ? activePlan.days.filter((d) => d.isCompleted).length : 0;
    const totalDaysCount = activePlan ? activePlan.days.length : 30;

    const completedHours = activePlan
      ? activePlan.days.filter((d) => d.isCompleted).reduce((sum, d) => sum + d.estimatedHours, 0)
      : 0;

    const avgScore =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.scorePercentage, 0) / attempts.length)
        : 0;

    const masteredTopicsCount = mastery.filter((m) => m.status === 'maitrise').length;
    const toReviseCount = mastery.filter((m) => m.status === 'a_reviser').length;

    return {
      activePlan,
      completedDaysCount,
      totalDaysCount,
      progressPercentage: totalDaysCount > 0 ? Math.round((completedDaysCount / totalDaysCount) * 100) : 0,
      completedHours,
      totalPlannedHours: activePlan ? activePlan.totalPlannedHours : 60,
      totalAttempts: attempts.length,
      averageScore: avgScore,
      masteredTopicsCount,
      toReviseCount,
      recentAttempts: attempts.slice(0, 5),
    };
  }
}

export class AdminReviewService {
  /**
   * Returns all questions pending human or inspector review
   */
  getPendingQuestions(): ExtractedQuestion[] {
    const all = storageService.getAllQuestions();
    return all.filter((q) => q.reviewStatus === 'pending_review' || q.reviewStatus === 'needs_correction');
  }

  /**
   * Update question review status with auditor name
   */
  setQuestionStatus(questionId: string, status: ReviewStatus, auditorName: string): boolean {
    const all = storageService.getAllQuestions();
    const q = all.find((item) => item.id === questionId);
    if (!q) return false;

    q.reviewStatus = status;
    q.reviewedBy = auditorName;
    storageService.saveQuestion(q);
    return true;
  }

  getReviewQueueStats() {
    const all = storageService.getAllQuestions();
    const approved = all.filter((q) => q.reviewStatus === 'approved').length;
    const pending = all.filter((q) => q.reviewStatus === 'pending_review').length;
    const needsCorrection = all.filter((q) => q.reviewStatus === 'needs_correction').length;
    const rejected = all.filter((q) => q.reviewStatus === 'rejected').length;

    return {
      totalQuestions: all.length,
      approved,
      pending,
      needsCorrection,
      rejected,
    };
  }
}

export const lessonService = new LessonService();
export const quizService = new QuizService();
export const progressService = new ProgressService();
export const adminReviewService = new AdminReviewService();
