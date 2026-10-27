import React, { useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizAttempt } from '../types';
import { storageService } from '../services/storage';

interface ResultsPageProps {
  attempt: QuizAttempt;
  onRetry: () => void;
  onReturnToPlan: () => void;
  onNavigateTab: (tab: string) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  attempt,
  onRetry,
  onReturnToPlan,
  onNavigateTab,
}) => {
  const allQuestions = storageService.getAllQuestions();
  const isPassed = attempt.scorePercentage >= 70;

  useEffect(() => {
    if (isPassed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#f59e0b'],
        });
      } catch {
        // ignored if canvas not supported
      }
    }
  }, [isPassed]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Score Hero Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-lg text-center space-y-4 ${
          isPassed
            ? 'bg-gradient-to-b from-emerald-900 to-teal-950 border-emerald-700/50 text-white'
            : 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 text-white'
        }`}
      >
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-emerald-300">
          <Award className="w-3.5 h-3.5" />
          <span>Évaluation complétée • {attempt.topicName}</span>
        </div>

        <div className="space-y-1">
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            {attempt.scorePercentage}%
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            {attempt.correctAnswersCount} réponse{attempt.correctAnswersCount > 1 ? 's' : ''} correcte
            {attempt.correctAnswersCount > 1 ? 's' : ''} sur {attempt.totalQuestions} questions
          </p>
        </div>

        <div className="max-w-md mx-auto pt-1">
          {isPassed ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-xs text-emerald-200">
              🎉 <strong>Félicitations !</strong> Vous franchissez le seuil d'admissibilité type des concours de l'État
              (équivalent à ≥ 14/20). Votre maîtrise a été mise à jour positivement.
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-xs text-amber-200">
              ⚠️ <strong>Marge de progression :</strong> Le score est inférieur à 70%. Les explications détaillées
              ci-dessous vous permettent de comprendre vos erreurs types avant de réessayer.
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refaire le test</span>
          </button>
          <button
            onClick={onReturnToPlan}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Poursuivre mon programme</span>
          </button>
        </div>
      </div>

      {/* Detailed Correction Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Correction Détaillée & Analyse des Pièges</h3>
            <p className="text-xs text-slate-500">
              Chaque réponse est appuyée par les règles des concours et la documentation officielle.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            {attempt.totalQuestions} Questions
          </span>
        </div>

        <div className="space-y-5">
          {attempt.answers.map((ans, idx) => {
            const originalQ = allQuestions.find((q) => q.id === ans.questionId);
            const userOption = originalQ?.options.find((o) => o.id === ans.selectedOptionId);
            const correctOption = originalQ?.options.find((o) => o.id === originalQ.correctOptionId);

            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all space-y-4 ${
                  ans.isCorrect
                    ? 'bg-white border-emerald-200 shadow-2xs'
                    : 'bg-rose-50/40 border-rose-200 shadow-2xs'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">
                      Page {originalQ?.pageNumber || 1} • Annales
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1 ${
                      ans.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {ans.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Exact (+1 pt)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Incorrect (0 pt)</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Question Text */}
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {originalQ?.questionText}
                </h4>

                {/* User Answer vs Official Correct Answer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div
                    className={`p-3 rounded-xl border ${
                      ans.isCorrect
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-white border-rose-200 text-rose-950'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Votre réponse :
                    </span>
                    <p className="font-semibold">{userOption?.text || 'Non répondu'}</p>
                  </div>

                  {!ans.isCorrect && (
                    <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-950">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">
                        Bonne réponse attendue :
                      </span>
                      <p className="font-semibold">{correctOption?.text}</p>
                    </div>
                  )}
                </div>

                {/* Detailed Explanation */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <span className="font-bold text-slate-800 flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Explication pédagogique :</span>
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px] whitespace-pre-line">
                    {ans.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
