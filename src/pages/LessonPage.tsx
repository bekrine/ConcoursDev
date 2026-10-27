import React from 'react';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lightbulb,
  Copy,
  Check,
} from 'lucide-react';
import { LessonContent } from '../types';
import { lessonService } from '../services/learningServices';

interface LessonPageProps {
  lessonId: string;
  topicId: string;
  onBack: () => void;
  onStartQuiz: (topicId: string, topicName: string) => void;
}

export const LessonPage: React.FC<LessonPageProps> = ({
  lessonId,
  topicId,
  onBack,
  onStartQuiz,
}) => {
  const lesson: LessonContent =
    lessonService.getLessonById(lessonId) ||
    lessonService.getLessonByTopic(topicId) ||
    lessonService.getAllLessons()[0];

  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au programme de révision</span>
        </button>

        <button
          onClick={() => onStartQuiz(lesson.topicId, lesson.title)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <Award className="w-4 h-4 text-emerald-200" />
          <span>Passer le QCM de ce chapitre</span>
        </button>
      </div>

      {/* Lesson Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            {lesson.domainName}
          </span>
          <div className="flex items-center space-x-1 text-slate-400 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Lecture estimée : ~{lesson.readTimeMinutes} minutes</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {lesson.title}
        </h1>

        {/* Learning objectives */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Objectifs pédagogiques pour le concours :</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
            {lesson.objectives.map((obj, i) => (
              <li key={i} className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Core Concepts */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900">Notions Fondamentales & Mécanismes</h2>

        {lesson.coreConcepts.map((concept, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <span>{concept.title}</span>
            </h3>

            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {concept.content}
            </div>

            {concept.codeExample && (
              <div className="relative rounded-xl overflow-hidden bg-slate-950 text-slate-200 text-xs font-mono border border-slate-800">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="uppercase font-semibold">{concept.language || 'Code'}</span>
                  <button
                    onClick={() => handleCopyCode(concept.codeExample!, idx)}
                    className="flex items-center space-x-1 hover:text-white transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-xs leading-relaxed text-emerald-300">
                  <code>{concept.codeExample}</code>
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Moroccan Exam Tips Callout */}
      {lesson.moroccanExamTips && lesson.moroccanExamTips.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-950 font-bold">
            <Award className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm uppercase tracking-wider">
              Pièges fréquents aux concours marocains (MEF, DGSN, Justice)
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-emerald-900 leading-relaxed">
            {lesson.moroccanExamTips.map((tip, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Common Mistakes */}
      {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-rose-950 font-bold">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm uppercase tracking-wider">Erreurs classiques à éliminer le jour de l'épreuve</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-rose-900">
            {lesson.commonMistakes.map((err, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>{err}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Past Exam References */}
      {lesson.pastExamReferences && lesson.pastExamReferences.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm">Références aux Annales Réelles de la Fonction Publique</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {lesson.pastExamReferences.map((ref, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{ref.examName}</span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    Session {ref.year}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 italic">{ref.questionExcerpt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">À retenir absolument pour le jour J</h3>
        <div className="space-y-2 text-xs text-slate-700">
          {lesson.summaryChecklist.map((check, idx) => (
            <div key={idx} className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{check}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA to start Quiz */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Prêt à valider vos acquis ?</h3>
          <p className="text-xs text-emerald-100">
            Passez le QCM chronométré portant exclusivement sur les notions de ce cours.
          </p>
        </div>
        <button
          onClick={() => onStartQuiz(lesson.topicId, lesson.title)}
          className="px-6 py-3 rounded-xl bg-white text-emerald-950 font-bold text-xs shadow-lg hover:bg-emerald-50 transition-colors flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Award className="w-4 h-4 text-emerald-700" />
          <span>Lancer le QCM du chapitre</span>
        </button>
      </div>
    </div>
  );
};
