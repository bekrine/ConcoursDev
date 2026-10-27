import { ExamSource, SourceType } from '../types';
import { storageService } from './storage';

export interface ExamSearchParams {
  query?: string;
  specialtyId?: string;
  levelId?: string;
  adminId?: string;
  year?: number;
  sourceType?: SourceType;
}

export class ExamResearchService {
  /**
   * Search configured and verified sources for relevant recruitment exams.
   * Filters by Moroccan administration, specialty, academic level, and keywords.
   */
  searchSources(params: ExamSearchParams): ExamSource[] {
    const allExams = storageService.getAllExams();

    return allExams.filter((exam) => {
      if (params.specialtyId && exam.specialtyId !== params.specialtyId) {
        return false;
      }
      if (params.levelId && exam.levelId !== params.levelId) {
        return false;
      }
      if (params.adminId && exam.adminId !== params.adminId) {
        return false;
      }
      if (params.year && exam.year !== params.year) {
        return false;
      }
      if (params.sourceType && exam.sourceType !== params.sourceType) {
        return false;
      }
      if (params.query) {
        const q = params.query.toLowerCase();
        const matchTitle = exam.competitionTitle.toLowerCase().includes(q);
        const matchAdmin = exam.adminName.toLowerCase().includes(q);
        const matchNotes = exam.notes ? exam.notes.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchAdmin && !matchNotes) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Get an exam source by its ID
   */
  getExamById(id: string): ExamSource | undefined {
    return storageService.getAllExams().find((e) => e.id === id);
  }

  /**
   * Register a new official or public archive source with deduplication check (URL & title).
   */
  registerSource(source: Omit<ExamSource, 'id' | 'retrievalDate' | 'processingStatus'>): {
    success: boolean;
    exam?: ExamSource;
    error?: string;
  } {
    const all = storageService.getAllExams();
    const normalizedUrl = source.originalDocumentUrl.trim().toLowerCase();

    // Deduplication check
    const duplicate = all.find(
      (e) =>
        e.originalDocumentUrl.trim().toLowerCase() === normalizedUrl ||
        (e.competitionTitle.trim().toLowerCase() === source.competitionTitle.trim().toLowerCase() &&
          e.year === source.year &&
          e.adminId === source.adminId)
    );

    if (duplicate) {
      return {
        success: false,
        error: `Une source similaire existe déjà : "${duplicate.competitionTitle}" (${duplicate.year}).`,
      };
    }

    const newExam: ExamSource = {
      ...source,
      id: `exam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      retrievalDate: new Date().toISOString().split('T')[0],
      processingStatus: 'completed',
    };

    storageService.saveExam(newExam);
    return { success: true, exam: newExam };
  }

  /**
   * Return verified sources catalog summary
   */
  getCatalogStats() {
    const all = storageService.getAllExams();
    const verifiedCount = all.filter((e) => e.verificationStatus === 'verified').length;
    const officialCount = all.filter((e) => e.sourceType === 'official').length;
    const totalPages = all.reduce((acc, curr) => acc + (curr.pageCount || 0), 0);
    const years = Array.from(new Set(all.map((e) => e.year))).sort((a, b) => b - a);

    return {
      totalSources: all.length,
      verifiedCount,
      officialCount,
      totalPages,
      yearRange: years.length ? `${years[years.length - 1]} - ${years[0]}` : 'N/A',
      activeProviders: ['Portail National Emploi-Public.ma', 'DGI/TGR Archives', 'Ministère Justice Direct API', 'DGSN Concours'],
    };
  }
}

export const examResearchService = new ExamResearchService();
