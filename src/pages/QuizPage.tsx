import React, { useState, useEffect } from 'react';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { ExtractedQuestion, QuizAttempt, UserProfile } from '../types';
import { quizService } from '../services/learningServices';

interface QuizPageProps {
  currentUser: UserProfile;
  topicId: string;
  topicName: string;
  onQuizCompleted: (attempt: QuizAttempt) => void;
  onCancel: () => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({
  currentUser,
  topicId,
  topicName,
  onQuizCompleted,
  onCancel,
}) => {
  // Fetch safe questions without answer keys
  const [questions] = useState<Omit<ExtractedQuestion, 'correctOptionId' | 'explanation'>[]>(() => {
    return quizService.getQuizQuestionsForCandidate(topicId, 5);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [startTime] = useState<string>(new Date().toISOString());
  const [secondsLeft, setSecondsLeft] = useState<number>(300); // 5 minutes default timer
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Timer countdown
  useEffect(() => {
    if (!isTimerActive || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, secondsLeft]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optionId: string) => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    const answersPayload = questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: selectedAnswers[q.id] || '',
    }));

    const attempt = quizService.submitQuizAttempt({
      userId: currentUser.id,
      topicId,
      topicName,
      startedAt: startTime,
      answers: answersPayload,
    });

    onQuizCompleted(attempt);
  };

  if (!currentQ) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Aucune question disponible</h3>
        <p className="text-xs text-slate-500">
          Les questions pour ce chapitre sont en cours d'extraction et de validation par les réviseurs.
        </p>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
        >
          Retour au programme
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Quiz Header with Timer & Cancel */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
            QCM Concours Fonction Publique
          </span>
          <h2 className="text-xs font-bold text-slate-900 mt-1">{topicName}</h2>
        </div>

        <div className="flex items-center space-x-3">
          {/* Timer */}
          <div
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              secondsLeft < 60
                ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(secondsLeft)}</span>
          </div>

          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            Abandonner
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Progress & Stepper */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>
              Question {currentIndex + 1} sur {questions.length}
            </span>
            <span className="text-emerald-700">
              {answeredCount} / {questions.length} répondue{answeredCount > 1 ? 's' : ''}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Question Text & Provenance */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium">
            <span>Page {currentQ.pageNumber}</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">Annales vérifiées</span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            {currentQ.questionText}
          </h3>

          {currentQ.codeSnippet && (
            <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              <code>{currentQ.codeSnippet}</code>
            </pre>
          )}
        </div>

        {/* Choices Grid */}
        <div className="space-y-2.5 pt-2">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedAnswers[currentQ.id] === opt.id;
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start space-x-3 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-medium shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {letter}
                </div>
                <div className="flex-1 mt-0.5 leading-snug">{opt.text}</div>
              </div>
            );
          })}
        </div>

        {/* Navigation / Next / Submit buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className={`px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Précédente</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>Suivante</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>Valider et voir la correction</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
