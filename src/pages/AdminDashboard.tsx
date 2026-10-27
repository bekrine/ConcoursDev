import React, { useState } from 'react';
import {
  Shield,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  Upload,
  Layers,
  Database,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, ReviewStatus, ExtractedQuestion, ExamSource } from '../types';
import { adminReviewService } from '../services/learningServices';
import { examResearchService } from '../services/examResearchService';
import { storageService } from '../services/storage';
import { SEED_ADMINISTRATIONS, SEED_SPECIALTIES, SEED_LEVELS, SEED_TOPICS } from '../data/seedData';

interface AdminDashboardProps {
  currentUser: UserProfile;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'review' | 'sources' | 'stats'>('review');
  const [questions, setQuestions] = useState<ExtractedQuestion[]>(() => storageService.getAllQuestions());
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New source form state
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAdminId, setNewAdminId] = useState(SEED_ADMINISTRATIONS[0].id);
  const [newSpecialtyId, setNewSpecialtyId] = useState(SEED_SPECIALTIES[0].id);
  const [newLevelId, setNewLevelId] = useState(SEED_LEVELS[1].id);
  const [newYear, setNewYear] = useState(2023);
  const [newUrl, setNewUrl] = useState('');
  const [sourceMessage, setSourceMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Role Protection
  if (currentUser.role !== 'admin') {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Accès Restreint — Espace Réviseur</h2>
        <p className="text-xs text-slate-500">
          Cette section nécessite des privilèges d'administrateur ou d'auditeur de concours de la fonction publique.
        </p>
        <p className="text-[11px] text-slate-400">
          Vous pouvez utiliser le sélecteur d'utilisateur dans la barre supérieure pour basculer sur le compte de test
          administrateur (Dr. Amina Benali).
        </p>
      </div>
    );
  }

  const reviewStats = adminReviewService.getReviewQueueStats();

  const handleUpdateStatus = (questionId: string, status: ReviewStatus) => {
    adminReviewService.setQuestionStatus(questionId, status, currentUser.fullName);
    setQuestions(storageService.getAllQuestions());
  };

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    const adm = SEED_ADMINISTRATIONS.find((a) => a.id === newAdminId);

    const result = examResearchService.registerSource({
      adminId: newAdminId,
      adminName: adm?.name || 'Administration Publique',
      competitionTitle: newTitle,
      specialtyId: newSpecialtyId,
      levelId: newLevelId,
      year: newYear,
      originalDocumentUrl: newUrl,
      sourceWebsite: newUrl.includes('emploi-public.ma') ? 'emploi-public.ma' : 'portail officiel',
      sourceType: 'official',
      verificationStatus: 'verified',
      pageCount: 6,
      isScannedPdf: false,
      notes: `Ajouté manuellement par l'auditeur ${currentUser.fullName}`,
    });

    if (result.success) {
      setSourceMessage({ text: 'Nouvelle épreuve enregistrée et indexée avec succès !' });
      setIsAddingSource(false);
      setNewTitle('');
      setNewUrl('');
    } else {
      setSourceMessage({ text: result.error || 'Erreur lors de l\'enregistrement', error: true });
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (filterStatus === 'all') return true;
    return q.reviewStatus === filterStatus;
  });

  return (
    <div className="space-y-8 py-4">
      {/* Admin Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span>Console d'Audit & Administration</span>
            </span>
            <span className="text-xs text-slate-400">• Agent : {currentUser.fullName}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Contrôle Qualité du Pipeline d'Extraction des Annales
          </h1>
        </div>

        {/* Tab switch */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'review' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
            }`}
          >
            File de Relecture ({reviewStats.totalQuestions})
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'sources' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
            }`}
          >
            Sources & Concours
          </button>
        </div>
      </div>

      {/* Review Queue Tab */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          {/* Status KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-slate-400 text-[11px]">Total Questions</span>
              <div className="text-xl font-bold text-slate-900">{reviewStats.totalQuestions}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs space-y-1">
              <span className="text-emerald-700 text-[11px] font-semibold">Validées / Approuvées</span>
              <div className="text-xl font-bold text-emerald-700">{reviewStats.approved}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs space-y-1">
              <span className="text-amber-700 text-[11px] font-semibold">En attente audit</span>
              <div className="text-xl font-bold text-amber-700">{reviewStats.pending}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs space-y-1">
              <span className="text-rose-700 text-[11px] font-semibold">À corriger / Rejetées</span>
              <div className="text-xl font-bold text-rose-700">{reviewStats.needsCorrection + reviewStats.rejected}</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-600">Filtrer par statut :</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-700"
              >
                <option value="all">Tous les statuts</option>
                <option value="approved">Approuvées</option>
                <option value="pending_review">En attente</option>
                <option value="needs_correction">Nécessite correction</option>
                <option value="rejected">Rejetées</option>
              </select>
            </div>
          </div>

          {/* Questions review list */}
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const topic = SEED_TOPICS.find((t) => t.id === q.topicId);
              return (
                <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">ID: {q.id}</span>
                      <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                        {topic?.name || 'Chapitre IT'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          q.reviewStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : q.reviewStatus === 'pending_review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {q.reviewStatus}
                      </span>
                      {q.reviewedBy && (
                        <span className="text-[10px] text-slate-400">Réviseur : {q.reviewedBy}</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-slate-900">{q.questionText}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-lg border text-[11px] ${
                          opt.id === q.correctOptionId
                            ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {opt.id === q.correctOptionId && '✓ '}
                        {opt.text}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-600">
                    <strong>Explication enregistrée :</strong> {q.explanation}
                  </div>

                  {/* Auditor Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(q.id, 'approved')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approuver pour les candidats</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(q.id, 'needs_correction')}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center space-x-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Demander correction</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(q.id, 'rejected')}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rejeter</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sources Management Tab */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Catalogue des Épreuves Enregistrées</h3>
            <button
              onClick={() => setIsAddingSource(!isAddingSource)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingSource ? 'Fermer le formulaire' : 'Ajouter une épreuve vérifiée'}</span>
            </button>
          </div>

          {sourceMessage && (
            <div
              className={`p-4 rounded-xl border text-xs ${
                sourceMessage.error
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {sourceMessage.text}
            </div>
          )}

          {isAddingSource && (
            <form onSubmit={handleCreateSource} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Enregistrement d'un Arrêté / Épreuve Officielle</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Titre officiel du concours</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="ex: Concours Technicien 3ème grade 2024 - DGSN"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Administration / Ministère</label>
                  <select
                    value={newAdminId}
                    onChange={(e) => setNewAdminId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    {SEED_ADMINISTRATIONS.map((adm) => (
                      <option key={adm.id} value={adm.id}>
                        {adm.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Spécialité</label>
                  <select
                    value={newSpecialtyId}
                    onChange={(e) => setNewSpecialtyId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    {SEED_SPECIALTIES.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Année de session</label>
                  <input
                    type="number"
                    min={2018}
                    max={2026}
                    value={newYear}
                    onChange={(e) => setNewYear(parseInt(e.target.value) || 2023)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">URL publique du document PDF</label>
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://www.emploi-public.ma/annales/epreuve-technicien-2023.pdf"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSource(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Enregistrer et Lancer l'OCR
                </button>
              </div>
            </form>
          )}

          {/* List of existing exam sources */}
          <div className="space-y-3">
            {storageService.getAllExams().map((ex) => (
              <div key={ex.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{ex.competitionTitle}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {ex.year}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {ex.adminName} • {ex.sourceWebsite} • {ex.pageCount} pages
                  </p>
                </div>

                <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 font-semibold text-[10px] border border-emerald-200">
                  {ex.processingStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
