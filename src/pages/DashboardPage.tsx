import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { UserProfile, StudyPlan, StudyPlanDay } from '../types';
import { progressService } from '../services/learningServices';
import { storageService } from '../services/storage';

interface DashboardPageProps {
  currentUser: UserProfile;
  studyPlan: StudyPlan | null;
  onNavigateTab: (tab: string) => void;
  onOpenLesson: (lessonId: string, topicId: string) => void;
  onOpenQuiz: (topicId: string, topicName: string) => void;
  onStartOnboarding: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  studyPlan,
  onNavigateTab,
  onOpenLesson,
  onOpenQuiz,
  onStartOnboarding,
}) => {
  const summary = progressService.getDashboardSummary(currentUser.id);
  const userMasteryList = storageService.getUserMastery(currentUser.id);
  const weakTopics = progressService.getWeakTopics(currentUser.id);

  // Find next pending day
  const nextPendingDay: StudyPlanDay | undefined = studyPlan
    ? studyPlan.days.find((d) => !d.isCompleted) || studyPlan.days[0]
    : undefined;

  return (
    <div className="space-y-8 py-4">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Bonjour, {currentUser.fullName.split(' ')[0]} 👋
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {currentUser.specialtyId === 'spec_dev'
                ? 'Développement IT'
                : currentUser.specialtyId === 'spec_net'
                ? 'Réseaux & Systèmes'
                : 'Informatique'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {studyPlan?.targetAdminName
              ? `Objectif cible : ${studyPlan.targetAdminName}`
              : 'Objectif : Concours polyvalents de la fonction publique marocaine'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('plan')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Voir mon calendrier</span>
          </button>
          <button
            onClick={onStartOnboarding}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Ajuster mon plan</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Progression du plan</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{summary.completedDaysCount}</span>
            <span className="text-xs text-slate-400">/ {summary.totalDaysCount} jours</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${summary.progressPercentage}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Temps d'étude réalisé</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{summary.completedHours}h</span>
            <span className="text-xs text-slate-400">/ {summary.totalPlannedHours}h prévues</span>
          </div>
          <p className="text-[11px] text-slate-400">Régularité : {currentUser.dailyHours}h / jour</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Moyenne aux QCM</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">
              {summary.totalAttempts > 0 ? `${summary.averageScore}%` : '—'}
            </span>
            <span className="text-xs text-slate-400">({summary.totalAttempts} tests)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {summary.averageScore >= 70 ? 'Au-dessus du seuil d\'admissibilité' : 'Entraînement en cours'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Chapitres maîtrisés</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-teal-700">{summary.masteredTopicsCount}</span>
            <span className="text-xs text-slate-400">sur {userMasteryList.length}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {summary.toReviseCount > 0 ? `${summary.toReviseCount} chapitre(s) à réviser` : 'Niveau stable'}
          </p>
        </div>
      </div>

      {/* Priority Action Banner: Today's Task */}
      {nextPendingDay && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                Jour {nextPendingDay.dayNumber} au programme • {nextPendingDay.dateString}
              </span>
              <span className="text-xs text-slate-300">Durée estimée : {nextPendingDay.estimatedHours}h</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold leading-tight">{nextPendingDay.topicName}</h2>

            <div className="space-y-1.5 text-xs text-slate-200">
              <p className="font-semibold text-emerald-200">Objectifs de cette session :</p>
              <ul className="space-y-1 list-disc list-inside text-slate-300 text-xs">
                {nextPendingDay.objectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onOpenLesson(nextPendingDay.lessonId, nextPendingDay.topicId)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Ouvrir la leçon du jour</span>
              </button>
              <button
                onClick={() => onOpenQuiz(nextPendingDay.topicId, nextPendingDay.topicName)}
                className="px-5 py-2.5 bg-slate-800/90 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Passer le QCM de validation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weakness Alert / Recommendation */}
      {weakTopics.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start space-x-4">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Ajustement adaptatif : Lacunes détectées
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Vos scores aux tests récents indiquent une marge de progression sur :{' '}
              <strong>{weakTopics.map((w) => w.topicName).join(', ')}</strong>. Notre algorithme a automatiquement
              réinjecté des questions de révision ciblées dans vos prochaines sessions.
            </p>
            <div className="pt-1">
              <button
                onClick={() => onOpenLesson('les_subnetting', weakTopics[0].topicId)}
                className="text-xs font-bold text-amber-900 hover:text-amber-950 underline flex items-center space-x-1"
              >
                <span>Réviser les fiches de consolidation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-column Section: Topic Mastery & Recent Quiz Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Mastery Radar / Bars */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Maîtrise estimée par matière</h3>
              <p className="text-[11px] text-slate-500">Calculée à partir de vos tentatives de QCM</p>
            </div>
            <button
              onClick={() => onNavigateTab('stats')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Détails statistiques
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {userMasteryList.slice(0, 6).map((m) => (
              <div key={m.topicId} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-800">{m.topicName}</span>
                  <span className="text-slate-500 font-semibold">{m.masteryPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      m.masteryPercentage >= 75
                        ? 'bg-emerald-600'
                        : m.masteryPercentage >= 50
                        ? 'bg-amber-500'
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${Math.max(5, m.masteryPercentage)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attempts History */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Historique des évaluations</h3>
              <p className="text-[11px] text-slate-500">Derniers QCM passés avec correction détaillée</p>
            </div>
          </div>

          {summary.recentAttempts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <Award className="w-8 h-8 mx-auto text-slate-300" />
              <p>Aucun QCM complété pour le moment.</p>
              <p className="text-[11px]">Lancez le test du Jour 1 pour initialiser vos métriques !</p>
            </div>
          ) : (
            <div className="space-y-2.5 pt-2">
              {summary.recentAttempts.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">{att.topicName}</h4>
                    <p className="text-[11px] text-slate-500">
                      {att.correctAnswersCount} sur {att.totalQuestions} réponses correctes •{' '}
                      {new Date(att.submittedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                      att.scorePercentage >= 70
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {att.scorePercentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
