export type UserRole = 'candidate' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  specialtyId: string;
  levelId: string;
  targetAdminId?: string;
  targetCompetitionId?: string;
  preparationDays: number;
  dailyHours: number;
  totalAvailableHours: number;
  diagnosticCompleted: boolean;
  diagnosticScore?: number;
}

export interface Specialty {
  id: string;
  code: string;
  name: string;
  description: string;
  iconName: string;
  isPopular?: boolean;
}

export interface AcademicLevel {
  id: string;
  code: string;
  name: string;
  publicSectorGrade: string; // e.g. "Technicien de 3ème grade (Échelle 9)", "Administrateur 2ème grade (Échelle 11)"
  diplomaRequired: string;
  description: string;
}

export interface Administration {
  id: string;
  name: string;
  shortName: string;
  category: 'ministere' | 'etablissement_public' | 'collectivite' | 'securite';
  logoText?: string;
  website: string;
  city: string;
}

export type SourceType = 'official' | 'archive' | 'academic' | 'other';
export type ProcessingStatus = 'pending' | 'downloading' | 'processing_ocr' | 'completed' | 'failed' | 'requires_review';
export type ReviewStatus = 'approved' | 'pending_review' | 'rejected' | 'needs_correction';
export type QuestionType = 'qcm_single' | 'qcm_multiple' | 'true_false' | 'short_sql' | 'code_analysis';

export interface ExamSource {
  id: string;
  adminId: string;
  adminName: string;
  competitionTitle: string;
  specialtyId: string;
  levelId: string;
  year: number;
  examDate?: string;
  originalDocumentUrl: string;
  sourceWebsite: string;
  sourceType: SourceType;
  verificationStatus: 'verified' | 'unverified';
  retrievalDate: string;
  processingStatus: ProcessingStatus;
  fileSizeBytes?: number;
  pageCount?: number;
  isScannedPdf?: boolean;
  notes?: string;
}

export interface TopicDomain {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
}

export interface Topic {
  id: string;
  domainId: string;
  code: string;
  name: string;
  description: string;
  prerequisites: string[]; // topic codes required before this
  typicalEstimatedHours: number;
  weightBaseline: number; // default baseline weight
}

export interface ExtractedQuestion {
  id: string;
  examSourceId: string;
  topicId: string;
  questionText: string;
  codeSnippet?: string;
  questionType: QuestionType;
  options: { id: string; text: string }[];
  correctOptionId: string; // HIDDEN in candidate API responses until submission
  explanation: string;
  pageNumber: number;
  extractionConfidence: number; // 0.0 to 1.0
  reviewStatus: ReviewStatus;
  sourceType: 'official_extract' | 'ai_proposed_explanation';
  reviewedBy?: string;
  historicalAppearanceCount?: number;
}

export interface TopicStatistic {
  topicId: string;
  topicName: string;
  domainName: string;
  analyzedExamsCount: number;
  totalExamsInSample: number;
  appearancePercentage: number; // e.g. 75% of analyzed exams
  questionsCount: number;
  recencyWeight: number; // higher for 2022-2024
  officialCoefficient?: number; // e.g. 2, 3 or null if unspecified
  confidenceLevel: 'Faible' | 'Moyen' | 'Élevé';
  historicalImportanceScore: number; // 0 to 100
  sampleCoverageNote: string;
}

export interface TopicPersonalPriority extends TopicStatistic {
  personalPriorityScore: number; // 0 to 100 based on formula
  candidateMasteryScore: number; // 0 to 100
  recommendedStudyHours: number;
  rationale: string;
}

export interface LessonContent {
  id: string;
  topicId: string;
  title: string;
  domainName: string;
  readTimeMinutes: number;
  objectives: string[];
  coreConcepts: {
    title: string;
    content: string;
    codeExample?: string;
    language?: string;
  }[];
  moroccanExamTips: string[];
  commonMistakes: string[];
  summaryChecklist: string[];
  pastExamReferences: {
    examName: string;
    year: number;
    questionExcerpt: string;
  }[];
}

export interface StudyPlanDay {
  dayNumber: number;
  dateString?: string;
  topicId: string;
  topicName: string;
  domainName: string;
  estimatedHours: number;
  objectives: string[];
  lessonId: string;
  quizId: string;
  revisionTopicIds?: string[];
  isMilestoneMockExam?: boolean;
  isCompleted: boolean;
  completedAt?: string;
  score?: number;
}

export interface StudyPlan {
  id: string;
  userId: string;
  version: number;
  createdAt: string;
  specialtyId: string;
  levelId: string;
  totalDays: number;
  dailyHours: number;
  totalPlannedHours: number;
  targetAdminName?: string;
  priorityExplanations: { topicId: string; topicName: string; priority: string; reason: string }[];
  days: StudyPlanDay[];
  isFallbackProvisional: boolean;
  fallbackReason?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  topicId: string;
  topicName: string;
  startedAt: string;
  submittedAt: string;
  totalQuestions: number;
  correctAnswersCount: number;
  scorePercentage: number;
  answers: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface UserTopicMastery {
  topicId: string;
  topicName: string;
  domainName: string;
  attemptsCount: number;
  lastScore: number;
  masteryPercentage: number; // 0 to 100
  status: 'non_commence' | 'en_cours' | 'maitrise' | 'a_reviser';
  lastPracticedAt?: string;
}
