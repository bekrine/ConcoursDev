import React from 'react';
import {
  Sparkles,
  BarChart2,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Calculator,
  Layers,
  Award,
} from 'lucide-react';
import { topicStatisticsService, priorityScoringService } from '../services/topicStatisticsService';
import { examResearchService } from '../services/examResearchService';
import { SEED_TOPICS, SEED_DOMAINS } from '../data/seedData';
import { UserProfile } from '../types';

interface TopicStatisticsPageProps {
  currentUser: UserProfile;
}

export const TopicStatisticsPage: React.FC<TopicStatisticsPageProps> = ({ currentUser }) => {
  const stats = topicStatisticsService.calculateTopicStatistics();
  const catalogStats = examResearchService.getCatalogStats();
  const priorities = priorityScoringService.calculatePersonalizedPriorities(
    currentUser.specialtyId,
    currentUser.levelId,
    currentUser.totalAvailableHours
  );

  return (
    <div className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Transparence Algorithmique
          </span>
          <span className="text-xs text-slate-400">• Échantillon vérifié de {catalogStats.totalSources} concours</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Pondération Statistique et Fréquences par Matière
        </h1>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          ConcoursDev Maroc refuse le classement par intuition artificielle arbitraire. Nos recommandations s'appuient
          exclusivement sur les occurrences dénombrées dans notre catalogue d'annales vérifiées et sur les arrêtés
          ministériels publiés.
        </p>

        {/* Disclaimer banner */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
          <strong>Avertissement méthodologique :</strong> La fréquence d'apparition historique dans les concours passés
          ne garantit en aucun cas qu'une matière figurera dans le prochain concours. Les commissions ministérielles de
          recrutement demeurent souveraines dans le choix des sujets.
        </div>
      </div>

      {/* The 5-Component Formula Card */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-emerald-400">
          <Calculator className="w-5 h-5" />
          <h2 className="text-sm uppercase tracking-wider font-bold">Formule Mathématique de Calcul des Priorités</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2 text-xs">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-1">
            <span className="text-xl font-extrabold text-emerald-400">35%</span>
            <p className="font-bold text-slate-200 text-[11px]">Fréquence Annales</p>
            <p className="text-[10px] text-slate-400 leading-tight">
              Pourcentage des concours analysés comportant cette matière.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-1">
            <span className="text-xl font-extrabold text-emerald-400">25%</span>
            <p className="font-bold text-slate-200 text-[11px]">Coefficient Officiel</p>
            <p className="text-[10px] text-slate-400 leading-tight">
              Pondération officielle issue de l'arrêté ministériel (ex: coeff 2 ou 3).
            </p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-1">
            <span className="text-xl font-extrabold text-emerald-400">20%</span>
            <p className="font-bold text-slate-200 text-[11px]">Adéquation Spécialité</p>
            <p className="text-[10px] text-slate-400 leading-tight">
              Pertinence selon le diplôme (Développement, Réseaux, BDD).
            </p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-1">
            <span className="text-xl font-extrabold text-emerald-400">10%</span>
            <p className="font-bold text-slate-200 text-[11px]">Récence des Sujets</p>
            <p className="text-[10px] text-slate-400 leading-tight">
              Bonus pour les épreuves récentes (sessions 2022-2024).
            </p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-1">
            <span className="text-xl font-extrabold text-emerald-400">10%</span>
            <p className="font-bold text-slate-200 text-[11px]">Faiblesses Candidat</p>
            <p className="text-[10px] text-slate-400 leading-tight">
              Priorisation adaptative des notions ayant obtenu moins de 70%.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 pt-1">
          * Si l'arrêté d'un concours ne spécifie aucun coefficient par matière, les 4 autres composantes sont{' '}
          <strong>renormalisées mathématiquement</strong> pour former 100% de la note.
        </p>
      </div>

      {/* Topics Ranking Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Tableau Détaillé des Matières et Chapitres</h3>
            <p className="text-[11px] text-slate-500">Classé par score de priorité personnalisée décroissant</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            {priorities.length} Matières Répertoriées
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Chapitre & Domaine</th>
                <th className="py-3 px-4">Fréquence Concours</th>
                <th className="py-3 px-4">Questions Indexées</th>
                <th className="py-3 px-4">Coefficient Officiel</th>
                <th className="py-3 px-4">Niveau de Confiance</th>
                <th className="py-3 px-4">Temps Recommandé</th>
                <th className="py-3 px-4 text-right">Score Priorité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {priorities.map((item) => (
                <tr key={item.topicId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.topicName}</div>
                    <div className="text-[11px] text-slate-400">{item.domainName}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700">
                    {item.appearancePercentage}%
                    <span className="text-slate-400 font-normal text-[11px] block">
                      ({item.analyzedExamsCount}/{item.totalExamsInSample} épreuves)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    {item.questionsCount} question{item.questionsCount > 1 ? 's' : ''}
                  </td>
                  <td className="py-3.5 px-4">
                    {item.officialCoefficient ? (
                      <span className="px-2 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Coeff {item.officialCoefficient}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Non spécifié</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        item.confidenceLevel === 'Élevé'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.confidenceLevel === 'Moyen'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.confidenceLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {item.recommendedStudyHours}h
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg font-bold ${
                        item.personalPriorityScore >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.personalPriorityScore >= 60
                          ? 'bg-teal-50 text-teal-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.personalPriorityScore}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
