import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Building2,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Shield,
} from 'lucide-react';
import { UserProfile } from '../types';
import { storageService } from '../services/storage';
import { SEED_SPECIALTIES, SEED_LEVELS, SEED_ADMINISTRATIONS } from '../data/seedData';

interface ProfileSettingsPageProps {
  currentUser: UserProfile;
  onUserUpdated: (user: UserProfile) => void;
  onResetData: () => void;
}

export const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({
  currentUser,
  onUserUpdated,
  onResetData,
}) => {
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [specialtyId, setSpecialtyId] = useState(currentUser.specialtyId);
  const [levelId, setLevelId] = useState(currentUser.levelId);
  const [targetAdminId, setTargetAdminId] = useState<string | undefined>(currentUser.targetAdminId);
  const [preparationDays, setPreparationDays] = useState(currentUser.preparationDays);
  const [dailyHours, setDailyHours] = useState(currentUser.dailyHours);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      fullName,
      specialtyId,
      levelId,
      targetAdminId,
      preparationDays,
      dailyHours,
      totalAvailableHours: preparationDays * dailyHours,
    };

    storageService.setCurrentUser(updated);
    onUserUpdated(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const data = {
      user: currentUser,
      plans: storageService.getStudyPlansForUser(currentUser.id),
      attempts: storageService.getQuizAttempts(currentUser.id),
      mastery: storageService.getUserMastery(currentUser.id),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `concoursdev_donnees_${currentUser.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Paramètres du Candidat</h1>
        <p className="text-xs text-slate-500 mt-1">
          Gérez vos préférences de révision, vos disponibilités et la confidentialité de vos données.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Vos préférences ont été enregistrées avec succès.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Identité & Profil</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nom complet</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Spécialité & Rythme de Révision</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Spécialité informatique</label>
              <select
                value={specialtyId}
                onChange={(e) => setSpecialtyId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                {SEED_SPECIALTIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Niveau / Grade préparé</label>
              <select
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                {SEED_LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.publicSectorGrade})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Durée avant l'épreuve (Jours)</label>
              <input
                type="number"
                min={3}
                max={180}
                value={preparationDays}
                onChange={(e) => setPreparationDays(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Disponibilité par jour (Heures)</label>
              <input
                type="number"
                min={1}
                max={8}
                value={dailyHours}
                onChange={(e) => setDailyHours(parseInt(e.target.value) || 2)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Administration ciblée</label>
              <select
                value={targetAdminId || 'none'}
                onChange={(e) => setTargetAdminId(e.target.value === 'none' ? undefined : e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="none">Préparation Polyvalente (Tous concours)</option>
                {SEED_ADMINISTRATIONS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.shortName})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>

      {/* Data Management & Privacy */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 text-sm">Gestion des Données et Confidentialité</h3>
        <p className="text-slate-500 leading-relaxed text-[11px]">
          Conformément aux directives de la CNDP (Loi 09-08 relative à la protection des personnes physiques à l'égard
          du traitement des données à caractère personnel au Maroc), vous conservez le contrôle absolu sur votre
          historique d'apprentissage.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exporter mon profil & historique (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Voulez-vous réinitialiser l\'ensemble des données de test stockées localement ?')) {
                onResetData();
              }
            }}
            className="px-4 py-2 border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-700 rounded-xl font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>Réinitialiser les données locales</span>
          </button>
        </div>
      </div>
    </div>
  );
};
