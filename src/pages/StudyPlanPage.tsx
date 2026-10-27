import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Award,
  RotateCcw,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { StudyPlan, StudyPlanDay, UserProfile } from '../types';
import { studyPlanGeneratorService } from '../services/studyPlanGeneratorService';
import { storageService } from '../services/storage';

interface StudyPlanPageProps {
  currentUser: UserProfile;
  studyPlan: StudyPlan | null;
  onPlanUpdated: (plan: StudyPlan) => void;
  onOpenLesson: (lessonId: string, topicId: string) => void;
  onOpenQuiz: (topicId: string, topicName: string) => void;
  onStartOnboarding: () => void;
}

export const StudyPlanPage: React.FC<StudyPlanPageProps> = ({
  currentUser,
  studyPlan,
  onPlanUpdated,
  onOpenLesson,
  onOpenQuiz,
  onStartOnboarding,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedDay, setSelectedDay] = useState<StudyPlanDay | null>(null);

  if (!studyPlan) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Aucun plan d'études actif</h2>
        <p className="text-xs text-slate-500">
          Configurez votre spécialité, votre niveau et votre temps disponible pour générer votre planning basé sur les annales.
        </p>
        <button
          onClick={onStartOnboarding}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
        >
          Créer mon plan maintenant
        </button>
      </div>
    );
  }

  const handleToggleDayComplete = (dayNumber: number) => {
    const updatedDays = studyPlan.days.map((d) => {
      if (d.dayNumber === dayNumber) {
        return {
          ...d,
          isCompleted: !d.isCompleted,
          completedAt: !d.isCompleted ? new Date().toISOString() : undefined,
        };
      }
      return d;
    });

    const updatedPlan: StudyPlan = {
      ...studyPlan,
      days: updatedDays,
    };

    storageService.saveStudyPlan(updatedPlan);
    onPlanUpdated(updatedPlan);
  };

  const handleRegenerateRemaining = () => {
    const newPlan = studyPlanGeneratorService.generatePlan(currentUser, {
      preserveExistingPlanId: studyPlan.id,
      customDays: studyPlan.totalDays,
      customDailyHours: studyPlan.dailyHours,
    });
    onPlanUpdated(newPlan);
  };

  const filteredDays = studyPlan.days.filter((d) => {
    if (filter === 'pending') return !d.isCompleted;
    if (filter === 'completed') return d.isCompleted;
    return true;
  });

  const completedCount = studyPlan.days.filter((d) => d.isCompleted).length;
  const progressPercent = Math.round((completedCount / studyPlan.days.length) * 100);

  return (
    <div className="space-y-8 py-4">
      {/* Plan Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Programme de Révision — {studyPlan.totalDays} Jours
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                v{studyPlan.version}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rythme : {studyPlan.dailyHours}h/jour • Total prévu : {studyPlan.totalPlannedHours}h • Cible :{' '}
              {studyPlan.targetAdminName || 'Fonction Publique Générale'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRegenerateRemaining}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1.5"
              title="Régénère les jours futurs sans effacer le travail déjà validé"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Régénérer le reste</span>
            </button>
            <button
              onClick={onStartOnboarding}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Nouveau profil</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600">
              Progression globale : {completedCount} sur {studyPlan.totalDays} jours complétés
            </span>
            <span className="text-emerald-700 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Prioritization Rationale Notice */}
      {studyPlan.priorityExplanations && studyPlan.priorityExplanations.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3 text-xs">
          <div className="flex items-center space-x-2 text-emerald-950 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs uppercase tracking-wider">Pourquoi ce planning est-il priorisé ainsi ?</h3>
          </div>
          <p className="text-emerald-900 leading-relaxed text-[11px]">
            Conformément à la déontologie de ConcoursDev Maroc, vos chapitres sont ordonnés en fonction des fréquences
            réelles constatées dans les annales officielles des concours marocains :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {studyPlan.priorityExplanations.slice(0, 4).map((pe, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{pe.topicName}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    {pe.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{pe.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous les jours ({studyPlan.days.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            À réviser ({studyPlan.days.filter((d) => !d.isCompleted).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'completed'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terminés ({completedCount})
          </button>
        </div>
      </div>

      {/* Daily Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDays.map((day) => {
          const isMilestone = day.isMilestoneMockExam;
          return (
            <div
              key={day.dayNumber}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                day.isCompleted
                  ? 'bg-slate-50 border-slate-200 opacity-90'
                  : isMilestone
                  ? 'bg-gradient-to-br from-indigo-50 to-emerald-50 border-indigo-200 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
              }`}
            >
              <div className="space-y-3">
                {/* Header tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        isMilestone
                          ? 'bg-indigo-600 text-white'
                          : day.isCompleted
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Jour {day.dayNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{day.dateString}</span>
                  </div>

                  <button
                    onClick={() => handleToggleDayComplete(day.dayNumber)}
                    className="cursor-pointer text-slate-400 hover:text-emerald-600 transition-colors"
                    title={day.isCompleted ? 'Marquer comme non terminé' : 'Marquer comme validé'}
                  >
                    {day.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                </div>

                {/* Day Subject */}
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {day.domainName}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm leading-tight mt-0.5">{day.topicName}</h3>
                </div>

                {/* Objectives */}
                <div className="space-y-1 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700 text-[11px]">Objectifs :</p>
                  <ul className="space-y-0.5 list-disc list-inside text-[11px]">
                    {day.objectives.slice(0, 2).map((obj, i) => (
                      <li key={i} className="line-clamp-1">
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenLesson(day.lessonId, day.topicId)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cours</span>
                </button>

                <button
                  onClick={() => onOpenQuiz(day.topicId, day.topicName)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-200" />
                  <span>QCM</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
