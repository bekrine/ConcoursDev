import React, { useEffect, useState } from 'react';
import { Sparkles, Search, FileCheck, Cpu, CheckCircle2, Loader2 } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onComplete: () => void;
  targetAdminName?: string;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onComplete,
  targetAdminName,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(10);

  const steps = [
    {
      title: 'Recherche et filtrage des annales vérifiées',
      detail: targetAdminName
        ? `Recherche prioritaire sur les arrêtés et épreuves de : ${targetAdminName}`
        : 'Exploration du catalogue emploi-public.ma et des annales ministérielles IT',
      icon: Search,
    },
    {
      title: 'Contrôle d\'intégrité & vérification OCR',
      detail: 'Validation des structures PDF, détection des scans haute résolution et vérification des pages',
      icon: FileCheck,
    },
    {
      title: 'Segmentation des questions & classification des chapitres',
      detail: 'Rapprochement avec la taxonomie des 6 domaines (MERISE, SQL, Réseaux, Linux, POO)',
      icon: Cpu,
    },
    {
      title: 'Calcul de la formule de priorisation et budget temps',
      detail: 'Pondération mathématique (35% annales, 25% coefficients, 20% spécialité, 10% récence)',
      icon: Sparkles,
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(10);
      return;
    }

    const t1 = setTimeout(() => {
      setCurrentStep(1);
      setProgress(40);
    }, 700);

    const t2 = setTimeout(() => {
      setCurrentStep(2);
      setProgress(70);
    }, 1500);

    const t3 = setTimeout(() => {
      setCurrentStep(3);
      setProgress(95);
    }, 2300);

    const t4 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Génération de votre plan d'études personnalisé
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Analyse des annales réelles et ajustement selon votre temps de révision disponible
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Analyse en cours...</span>
            <span className="text-emerald-700">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Steps list */}
        <div className="space-y-3 pt-2">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > idx;
            const isCurrent = currentStep === idx;
            const Icon = s.icon;

            return (
              <div
                key={idx}
                className={`flex items-start space-x-3 p-3 rounded-xl border text-xs transition-all ${
                  isCurrent
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-900'
                    : isCompleted
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'border-transparent text-slate-400 opacity-60'
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Icon className="w-4 h-4 text-emerald-600 animate-pulse" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{s.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-[11px] text-slate-400">
          Source : Annales officielles de la fonction publique marocaine (DGSN, MEF, Justice, ONDA, MTNRA)
        </div>
      </div>
    </div>
  );
};
