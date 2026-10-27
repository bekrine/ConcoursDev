import React from 'react';
import {
  ArrowLeft,
  Calendar,
  Building2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Award,
} from 'lucide-react';
import { ExamSource, ExtractedQuestion } from '../types';
import { examResearchService } from '../services/examResearchService';
import { questionExtractionService } from '../services/documentProcessingService';
import { SEED_SPECIALTIES, SEED_LEVELS, SEED_TOPICS } from '../data/seedData';

interface ExamDetailPageProps {
  examId: string;
  onBack: () => void;
  onStartQuizWithExamTopic?: (topicId: string, topicName: string) => void;
}

export const ExamDetailPage: React.FC<ExamDetailPageProps> = ({
  examId,
  onBack,
  onStartQuizWithExamTopic,
}) => {
  const exam = examResearchService.getExamById(examId);
  const questions = questionExtractionService.getQuestionsByExam(examId);

  if (!exam) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Document d'examen introuvable</h3>
        <p className="text-xs text-slate-500">L'identifiant spécifié ne correspond à aucune épreuve indexée.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
        >
          Retour aux annales
        </button>
      </div>
    );
  }

  const spec = SEED_SPECIALTIES.find((s) => s.id === exam.specialtyId);
  const lvl = SEED_LEVELS.find((l) => l.id === exam.levelId);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour au catalogue des annales</span>
      </button>

      {/* Main Metadata Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Session {exam.year}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {exam.sourceType === 'official' ? 'Document Officiel' : 'Archive Publique'}
            </span>
          </div>

          <a
            href={exam.originalDocumentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>Consulter le document source original</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            {exam.adminName}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {exam.competitionTitle}
          </h1>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Spécialité requise</span>
            <span className="font-bold text-slate-800">{spec?.name || 'Général'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Grade d'accès</span>
            <span className="font-bold text-slate-800">{lvl?.publicSectorGrade || 'Technicien / Ingénieur'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Format & Pages</span>
            <span className="font-bold text-slate-800">{exam.pageCount} pages (PDF)</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Statut OCR</span>
            <span className="font-bold text-emerald-700">
              {exam.isScannedPdf ? 'OCR Tesseract validé' : 'Texte natif vérifié'}
            </span>
          </div>
        </div>

        {exam.notes && (
          <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
            <strong>Notes d'ingestion :</strong> {exam.notes}
          </p>
        )}
      </div>

      {/* Extracted Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Questions Extraites et Indexées ({questions.length})
            </h3>
            <p className="text-xs text-slate-500">
              Questions identifiées avec numéros de page, options et propositions de correction.
            </p>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            Aucune question isolée pour ce document dans l'échantillon immédiat.
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const topic = SEED_TOPICS.find((t) => t.id === q.topicId);
              return (
                <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {topic?.name || 'Chapitre IT'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <span>Page {q.pageNumber}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">Confiance : {Math.round(q.extractionConfidence * 100)}%</span>
                    </div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {q.questionText}
                  </h4>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={opt.id}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-start space-x-2"
                      >
                        <span className="font-bold text-slate-500 text-[11px]">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span className="text-slate-700">{opt.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Explanation card */}
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed space-y-1">
                    <span className="font-bold text-slate-700 text-[11px] block">Explication & Corrigé :</span>
                    <p className="text-[11px]">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
