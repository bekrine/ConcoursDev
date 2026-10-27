import React, { useState } from 'react';
import {
  Code,
  Network,
  Database,
  ShieldAlert,
  Layers,
  Cpu,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  Calendar,
  Building2,
  HelpCircle,
  Award,
} from 'lucide-react';
import { UserProfile, Specialty, AcademicLevel, Administration } from '../types';
import {
  SEED_SPECIALTIES,
  SEED_LEVELS,
  SEED_ADMINISTRATIONS,
  SEED_QUESTIONS,
} from '../data/seedData';
import { storageService } from '../services/storage';

interface OnboardingWizardProps {
  currentUser: UserProfile;
  onPlanGenerated: (user: UserProfile) => void;
  onCancel: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Code,
  Network,
  Database,
  ShieldAlert,
  Layers,
  Cpu,
};

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  currentUser,
  onPlanGenerated,
  onCancel,
}) => {
  const [step, setStep] = useState(1);

  // Form State
  const [specialtyId, setSpecialtyId] = useState(currentUser.specialtyId || 'spec_dev');
  const [levelId, setLevelId] = useState(currentUser.levelId || 'lvl_bac2');
  const [durationDays, setDurationDays] = useState(currentUser.preparationDays || 30);
  const [isCustomDays, setIsCustomDays] = useState(false);
  const [dailyHours, setDailyHours] = useState(currentUser.dailyHours || 2);
  const [targetAdminId, setTargetAdminId] = useState<string | undefined>(currentUser.targetAdminId || undefined);

  // Diagnostic Test State (Step 5)
  const [takeDiagnostic, setTakeDiagnostic] = useState(false);
  const [diagAnswers, setDiagAnswers] = useState<Record<string, string>>({});
  const diagQuestions = SEED_QUESTIONS.slice(0, 3); // 3 sample questions for diagnostic

  const totalCalculatedHours = durationDays * dailyHours;

  const handleNextStep = () => {
    if (step < 6) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinalSubmit = () => {
    // Calculate diagnostic score if taken
    let diagnosticScore: number | undefined = undefined;
    if (takeDiagnostic && Object.keys(diagAnswers).length > 0) {
      let correct = 0;
      diagQuestions.forEach((q) => {
        if (diagAnswers[q.id] === q.correctOptionId) correct++;
      });
      diagnosticScore = Math.round((correct / diagQuestions.length) * 100);
    }

    const updatedUser: UserProfile = {
      ...currentUser,
      specialtyId,
      levelId,
      targetAdminId: targetAdminId || undefined,
      preparationDays: durationDays,
      dailyHours,
      totalAvailableHours: totalCalculatedHours,
      diagnosticCompleted: takeDiagnostic,
      diagnosticScore: diagnosticScore ?? currentUser.diagnosticScore,
    };

    storageService.setCurrentUser(updatedUser);
    onPlanGenerated(updatedUser);
  };

  const selectedSpecialty = SEED_SPECIALTIES.find((s) => s.id === specialtyId);
  const selectedLevel = SEED_LEVELS.find((l) => l.id === levelId);
  const selectedAdmin = SEED_ADMINISTRATIONS.find((a) => a.id === targetAdminId);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Wizard Header with Progress Bar */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              Étape {step} sur 6
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Configuration de votre préparation
            </span>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
          >
            Quitter l'assistant
          </button>
        </div>

        {/* Step indicator pills */}
        <div className="grid grid-cols-6 gap-1.5 h-1.5">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`rounded-full transition-all ${
                s <= step ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* STEP 1: SPECIALTY */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Étape 1 — Choisissez votre spécialité informatique</h2>
              <p className="text-xs text-slate-500 mt-1">
                La taxonomie des matières et questions sera adaptée au profil technique sélectionné.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {SEED_SPECIALTIES.map((spec) => {
                const IconComponent = ICON_MAP[spec.iconName] || Code;
                const isSelected = specialtyId === spec.id;
                return (
                  <div
                    key={spec.id}
                    onClick={() => setSpecialtyId(spec.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{spec.name}</h4>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{spec.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: LEVEL */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Étape 2 — Choisissez votre niveau d'études</h2>
              <p className="text-xs text-slate-500 mt-1">
                Les arrêtés ministériels fixent des grades d'accès (Échelle 9, 10 ou 11) selon le diplôme requis.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {SEED_LEVELS.map((lvl) => {
                const isSelected = levelId === lvl.id;
                return (
                  <div
                    key={lvl.id}
                    onClick={() => setLevelId(lvl.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{lvl.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {lvl.publicSectorGrade}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 font-medium">Diplôme : {lvl.diplomaRequired}</p>
                      <p className="text-[11px] text-slate-500">{lvl.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 ml-3 mt-1">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: DURATION & DAILY HOURS */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Étape 3 — Définissez votre durée et rythme de révision
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Le plan d'études sera dimensionné sur-mesure pour respecter strictement votre temps réel.
              </p>
            </div>

            {/* Preparation duration options */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Combien de jours avez-vous avant le concours ?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[7, 15, 30, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDurationDays(d);
                      setIsCustomDays(false);
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      !isCustomDays && durationDays === d
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {d} jours
                  </button>
                ))}
              </div>

              {/* Custom duration toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomDays(!isCustomDays)}
                  className="text-xs text-emerald-700 font-medium hover:underline"
                >
                  {isCustomDays ? '← Utiliser une durée prédéfinie' : '+ Choisir un nombre de jours personnalisé'}
                </button>
                {isCustomDays && (
                  <div className="mt-2 flex items-center space-x-2">
                    <input
                      type="number"
                      min={3}
                      max={180}
                      value={durationDays}
                      onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-600">jours de préparation</span>
                  </div>
                )}
              </div>
            </div>

            {/* Daily study hours */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700">
                Combien d'heures pouvez-vous étudier sérieusement par jour ?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDailyHours(h)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center space-y-0.5 ${
                      dailyHours === h
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{h} heure{h > 1 ? 's' : ''}</span>
                    <span className={`text-[10px] ${dailyHours === h ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {h === 1 ? 'Régulier' : h === 2 ? 'Recommandé' : h === 3 ? 'Intensif' : 'Sprint'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Total Budget Callout */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-emerald-700" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">Budget total de révision alloué</h4>
                  <p className="text-[11px] text-emerald-800">
                    {durationDays} jours × {dailyHours}h/jour ={' '}
                    <span className="font-bold">{totalCalculatedHours} heures d'apprentissage effectif</span>
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                {totalCalculatedHours}h
              </span>
            </div>
          </div>
        )}

        {/* STEP 4: TARGET ADMINISTRATION */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Étape 4 — Ciblez un concours ou une administration</h2>
              <p className="text-xs text-slate-500 mt-1">
                La sélection d'un ministère priorise les annales et coefficients réels de cet organisme.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div
                onClick={() => setTargetAdminId(undefined)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  targetAdminId === undefined
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Préparation polyvalente (Tous concours fonction publique)</h4>
                  <p className="text-[11px] text-slate-500">
                    Pondération équilibrée basée sur l'ensemble de notre catalogue d'annales ministérielles.
                  </p>
                </div>
                {targetAdminId === undefined && <Check className="w-4 h-4 text-emerald-600" />}
              </div>

              {SEED_ADMINISTRATIONS.map((adm) => {
                const isSelected = targetAdminId === adm.id;
                return (
                  <div
                    key={adm.id}
                    onClick={() => setTargetAdminId(adm.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{adm.name} ({adm.shortName})</h4>
                      <p className="text-[11px] text-slate-500">
                        {adm.category === 'ministere' ? 'Ministère' : 'Établissement Public'} • Siège : {adm.city}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: OPTIONAL DIAGNOSTIC TEST */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Étape 5 — Test diagnostique express (Optionnel)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Répondez à 3 questions rapides pour calibrer vos points forts dès le premier jour. Vous pouvez sauter cette étape.
              </p>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <input
                type="checkbox"
                id="takeDiagCheck"
                checked={takeDiagnostic}
                onChange={(e) => setTakeDiagnostic(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="takeDiagCheck" className="text-slate-800 font-medium cursor-pointer">
                Je souhaite passer le test diagnostique de 3 questions (recommandé)
              </label>
            </div>

            {takeDiagnostic && (
              <div className="space-y-4 pt-2">
                {diagQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-200 space-y-2 bg-white">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                      <span>Question diagnostique {idx + 1}/3</span>
                      <span className="text-emerald-700">Annales réelles</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{q.questionText}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt) => {
                        const isChosen = diagAnswers[q.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setDiagAnswers({ ...diagAnswers, [q.id]: opt.id })}
                            className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                              isChosen
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-medium'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {opt.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 6: SYNTHESIS & LAUNCH */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Récapitulatif de votre profil</h2>
              <p className="text-xs text-slate-500">
                Vérifiez vos paramètres avant de lancer l'analyse des annales et la génération du calendrier.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Spécialité :</span>
                <span className="font-bold text-slate-900">{selectedSpecialty?.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Niveau d'études & Grade :</span>
                <span className="font-bold text-slate-900">{selectedLevel?.name} ({selectedLevel?.publicSectorGrade})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Durée de préparation :</span>
                <span className="font-bold text-emerald-700">{durationDays} jours</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Rythme journalier :</span>
                <span className="font-bold text-slate-900">{dailyHours}h par jour</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Total volume horaire :</span>
                <span className="font-bold text-emerald-700">{totalCalculatedHours} heures</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Administration cible :</span>
                <span className="font-bold text-slate-900">
                  {selectedAdmin ? `${selectedAdmin.name} (${selectedAdmin.shortName})` : 'Préparation Polyvalente'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong>Garantie d'intégrité :</strong> L'algorithme ne génère aucun contenu fictif. Les chapitres programmés
              proviennent des annales vérifiées de la fonction publique marocaine avec justification statistique complète.
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <button
              onClick={handlePrevStep}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 6 ? (
            <button
              onClick={handleNextStep}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>Suivant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Générer mon programme d'études</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
