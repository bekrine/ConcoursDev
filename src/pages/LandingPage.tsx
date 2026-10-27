import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
  BarChart2,
  BookOpen,
  Award,
  Clock,
  Compass,
} from 'lucide-react';
import { examResearchService } from '../services/examResearchService';
import { topicStatisticsService } from '../services/topicStatisticsService';
import { SEED_SPECIALTIES, SEED_ADMINISTRATIONS } from '../data/seedData';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onNavigateTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding,
  onNavigateTab,
}) => {
  const catalogStats = examResearchService.getCatalogStats();
  const topicStats = topicStatisticsService.calculateTopicStatistics();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white p-8 sm:p-12 lg:p-16 border border-emerald-900/40 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plateforme Nationale Dédiée aux Concours Fonction Publique IT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Préparez les concours informatiques avec la{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              science des annales réelles
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Fini les plannings génériques et l'improvisation. ConcoursDev Maroc analyse les épreuves écrites antérieures
            des ministères (MEF, Justice, DGSN, ONDA...), calcule les fréquences exactes par chapitre et génère un
            programme d'étude sur-mesure adapté à votre temps disponible.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
            <button
              onClick={onStartOnboarding}
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 group cursor-pointer"
            >
              <span>Générer mon plan d'études personnalisé</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigateTab('annales')}
              className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Consulter les annales répertoriées</span>
            </button>
          </div>

          {/* Live Proof Badges */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-xs">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">{catalogStats.totalSources}</div>
              <div className="text-slate-400 text-[11px]">Concours officiels indexés</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">{catalogStats.totalPages}</div>
              <div className="text-slate-400 text-[11px]">Pages d'épreuves numérisées</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">100%</div>
              <div className="text-slate-400 text-[11px]">Questions avec provenance</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">{catalogStats.yearRange}</div>
              <div className="text-slate-400 text-[11px]">Période couverte</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Une méthode scientifique, zéro conjecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            L'application ne prétend jamais avoir analysé un document s'il n'est pas effectivement répertorié et vérifié.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Votre profil & Disponibilité réelle</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Indiquez votre spécialité (Développement, Réseaux, BDD), votre niveau (Bac+2 Technicien 3ème grade, Licence,
              Ingénieur d'État) et votre nombre d'heures réelles d'étude par jour.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Pondération par les annales marocaines</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Le moteur calcule la fréquence d'apparition de chaque matière dans les concours antérieurs réels (SQL, MERISE,
              IPv4, Linux, POO) et pondère selon les coefficients officiels vérifiés.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Étude, QCM & Révision adaptative</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Chaque jour combine cours approfondi en français, exercices d'application et QCM type concours. Vos points
              faibles sont automatiquement réinjectés dans les jours suivants.
            </p>
          </div>
        </div>
      </section>

      {/* Real Statistics Sample */}
      <section className="bg-slate-50 rounded-3xl p-8 border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Aperçu des fréquences réelles calculées sur notre échantillon
            </h3>
            <p className="text-xs text-slate-500">
              Calculé à partir des sessions 2021 à 2023 de la fonction publique marocaine
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('stats')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>Voir toute la méthodologie mathématique</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topicStats.slice(0, 6).map((topic) => (
            <div key={topic.topicId} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{topic.domainName}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {topic.appearancePercentage}% des concours
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs">{topic.topicName}</h4>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${topic.appearancePercentage}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500">{topic.sampleCoverageNote}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Target Administrations */}
      <section className="space-y-4 text-center">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Administrations et Établissements Publics Couverts
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {SEED_ADMINISTRATIONS.map((adm) => (
            <span
              key={adm.id}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-2xs hover:border-emerald-300 transition-colors"
            >
              {adm.name} ({adm.shortName})
            </span>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-2xl bg-emerald-700 text-white p-8 sm:p-10 text-center space-y-4 shadow-lg shadow-emerald-700/20">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Prêt pour votre prochain concours ?</h2>
        <p className="text-emerald-100 text-xs sm:text-sm max-w-xl mx-auto">
          Démarrez votre diagnostic gratuit en 2 minutes et obtenez votre plan de révision individualisé.
        </p>
        <div className="pt-2">
          <button
            onClick={onStartOnboarding}
            className="px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            Lancer l'assistant de configuration
          </button>
        </div>
      </section>
    </div>
  );
};
