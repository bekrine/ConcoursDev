import {
  UserProfile,
  ExamSource,
  ExtractedQuestion,
  StudyPlan,
  QuizAttempt,
  UserTopicMastery,
} from '../types';
import {
  SEED_SPECIALTIES,
  SEED_LEVELS,
  SEED_ADMINISTRATIONS,
  SEED_DOMAINS,
  SEED_TOPICS,
  SEED_EXAMS,
  SEED_QUESTIONS,
  SEED_LESSONS,
} from '../data/seedData';

// Local storage keys
const KEY_CURRENT_USER = 'concoursdev_current_user_v1';
const KEY_CUSTOM_EXAMS = 'concoursdev_custom_exams_v1';
const KEY_QUESTIONS = 'concoursdev_questions_v1';
const KEY_STUDY_PLANS = 'concoursdev_study_plans_v1';
const KEY_ATTEMPTS = 'concoursdev_quiz_attempts_v1';
const KEY_MASTERY = 'concoursdev_user_mastery_v1';

export const DEFAULT_CANDIDATE: UserProfile = {
  id: 'usr_candidat_demo',
  email: 'candidat.maroc@concoursdev.ma',
  fullName: 'Yassine El Amrani',
  role: 'candidate',
  createdAt: '2024-03-01T10:00:00Z',
  specialtyId: 'spec_dev',
  levelId: 'lvl_bac2',
  targetAdminId: 'adm_mef',
  preparationDays: 30,
  dailyHours: 2,
  totalAvailableHours: 60,
  diagnosticCompleted: true,
  diagnosticScore: 75,
};

export const DEFAULT_ADMIN: UserProfile = {
  id: 'usr_admin_demo',
  email: 'inspecteur.concours@concoursdev.ma',
  fullName: 'Dr. Amina Benali (Inspectrice & Réviseur)',
  role: 'admin',
  createdAt: '2023-11-01T08:00:00Z',
  specialtyId: 'spec_dev',
  levelId: 'lvl_bac5',
  preparationDays: 60,
  dailyHours: 3,
  totalAvailableHours: 180,
  diagnosticCompleted: true,
  diagnosticScore: 95,
};

class StorageService {
  private memoryUser: UserProfile | null = null;

  getCurrentUser(): UserProfile {
    try {
      const stored = localStorage.getItem(KEY_CURRENT_USER);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return this.memoryUser || DEFAULT_CANDIDATE;
  }

  setCurrentUser(user: UserProfile): void {
    this.memoryUser = user;
    try {
      localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(user));
    } catch {
      // storage unavailable
    }
  }

  getAllExams(): ExamSource[] {
    try {
      const stored = localStorage.getItem(KEY_CUSTOM_EXAMS);
      if (stored) {
        const custom: ExamSource[] = JSON.parse(stored);
        return [...SEED_EXAMS, ...custom];
      }
    } catch {
      // fallback
    }
    return SEED_EXAMS;
  }

  saveExam(exam: ExamSource): void {
    const all = this.getAllExams();
    const existingIndex = all.findIndex((e) => e.id === exam.id);
    let customExams: ExamSource[] = [];
    try {
      const stored = localStorage.getItem(KEY_CUSTOM_EXAMS);
      if (stored) customExams = JSON.parse(stored);
    } catch {
      customExams = [];
    }

    if (existingIndex >= 0) {
      customExams = customExams.map((e) => (e.id === exam.id ? exam : e));
    } else {
      customExams.push(exam);
    }

    try {
      localStorage.setItem(KEY_CUSTOM_EXAMS, JSON.stringify(customExams));
    } catch {
      // ignored
    }
  }

  getAllQuestions(): ExtractedQuestion[] {
    try {
      const stored = localStorage.getItem(KEY_QUESTIONS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return SEED_QUESTIONS;
  }

  saveQuestion(question: ExtractedQuestion): void {
    const questions = this.getAllQuestions();
    const idx = questions.findIndex((q) => q.id === question.id);
    if (idx >= 0) {
      questions[idx] = question;
    } else {
      questions.push(question);
    }
    try {
      localStorage.setItem(KEY_QUESTIONS, JSON.stringify(questions));
    } catch {
      // ignored
    }
  }

  getStudyPlansForUser(userId: string): StudyPlan[] {
    try {
      const stored = localStorage.getItem(KEY_STUDY_PLANS);
      if (stored) {
        const all: StudyPlan[] = JSON.parse(stored);
        return all.filter((p) => p.userId === userId);
      }
    } catch {
      // fallback
    }
    return [];
  }

  saveStudyPlan(plan: StudyPlan): void {
    let all: StudyPlan[] = [];
    try {
      const stored = localStorage.getItem(KEY_STUDY_PLANS);
      if (stored) all = JSON.parse(stored);
    } catch {
      all = [];
    }
    const idx = all.findIndex((p) => p.id === plan.id);
    if (idx >= 0) {
      all[idx] = plan;
    } else {
      all.unshift(plan);
    }
    try {
      localStorage.setItem(KEY_STUDY_PLANS, JSON.stringify(all));
    } catch {
      // ignored
    }
  }

  getQuizAttempts(userId: string): QuizAttempt[] {
    try {
      const stored = localStorage.getItem(KEY_ATTEMPTS);
      if (stored) {
        const all: QuizAttempt[] = JSON.parse(stored);
        return all.filter((a) => a.userId === userId);
      }
    } catch {
      // fallback
    }
    return [];
  }

  saveQuizAttempt(attempt: QuizAttempt): void {
    let all: QuizAttempt[] = [];
    try {
      const stored = localStorage.getItem(KEY_ATTEMPTS);
      if (stored) all = JSON.parse(stored);
    } catch {
      all = [];
    }
    all.unshift(attempt);
    try {
      localStorage.setItem(KEY_ATTEMPTS, JSON.stringify(all));
    } catch {
      // ignored
    }
  }

  getUserMastery(userId: string): UserTopicMastery[] {
    try {
      const stored = localStorage.getItem(`${KEY_MASTERY}_${userId}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    // Initialize default mastery for all topics
    return SEED_TOPICS.map((t) => {
      const domain = SEED_DOMAINS.find((d) => d.id === t.domainId);
      return {
        topicId: t.id,
        topicName: t.name,
        domainName: domain?.name || 'Général',
        attemptsCount: 0,
        lastScore: 0,
        masteryPercentage: 0,
        status: 'non_commence',
      };
    });
  }

  saveUserMastery(userId: string, mastery: UserTopicMastery[]): void {
    try {
      localStorage.setItem(`${KEY_MASTERY}_${userId}`, JSON.stringify(mastery));
    } catch {
      // ignored
    }
  }

  resetAllData(): void {
    try {
      localStorage.removeItem(KEY_CURRENT_USER);
      localStorage.removeItem(KEY_CUSTOM_EXAMS);
      localStorage.removeItem(KEY_QUESTIONS);
      localStorage.removeItem(KEY_STUDY_PLANS);
      localStorage.removeItem(KEY_ATTEMPTS);
      // clean user masteries
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (k.startsWith(KEY_MASTERY)) localStorage.removeItem(k);
      }
    } catch {
      // ignored
    }
  }
}

export const storageService = new StorageService();
