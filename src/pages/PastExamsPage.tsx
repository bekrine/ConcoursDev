import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileText,
  Calendar,
  Building2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { ExamSource, SourceType } from '../types';
import { examResearchService } from '../services/examResearchService';
import { SEED_ADMINISTRATIONS, SEED_SPECIALTIES, SEED_LEVELS } from '../data/seedData';

interface PastExamsPageProps {
  onSelectExam: (examId: string) => void;
}

export const PastExamsPage: React.FC<PastExamsPageProps> = ({ onSelectExam }) => {
  const [query, setQuery] = useState('');
  const [selectedAdminId, setSelectedAdminId] = useState<string>('all');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('all');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('all');

  const filteredExams = examResearchService.searchSources({
    query: query || undefined,
    adminId: selectedAdminId === 'all' ? undefined : selectedAdminId,
    specialtyId: selectedSpecialtyId === 'all' ? undefined : selectedSpecialtyId,
    sourceType: selectedSourceType === 'all' ? undefined : (selectedSourceType as SourceType),
  });

  const catalogStats = examResearchService.getCatalogStats();

  return (
    <div className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Annales & Épreuves Officielles
          </span>
          <span className="text-xs text-slate-400">• Source www.emploi-public.ma</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Catalogue des Concours et Sujets Antérieurs Dématérialisés
        </h1>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          Consultez les épreuves écrites réelles numérisées par notre pipeline. Chaque document est contrôlé, vérifié par OCR
          pour les scans administratifs, et indexé par matière avec références précises de pages.
        </p>

        {/* Catalog quick indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Concours répertoriés</span>
            <span className="font-bold text-slate-900 text-sm">{catalogStats.totalSources} sessions</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Pages d'épreuves vérifiées</span>
            <span className="font-bold text-slate-900 text-sm">{catalogStats.totalPages} pages</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Sources officielles</span>
            <span className="font-bold text-emerald-700 text-sm">{catalogStats.officialCount} sur {catalogStats.totalSources}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Période des sessions</span>
            <span className="font-bold text-slate-900 text-sm">{catalogStats.yearRange}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par titre, ministère, mots-clés (ex: MEF, SQL, Technicien)..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Admin filter */}
          <select
            value={selectedAdminId}
            onChange={(e) => setSelectedAdminId(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">Toutes les administrations</option>
            {SEED_ADMINISTRATIONS.map((adm) => (
              <option key={adm.id} value={adm.id}>
                {adm.name} ({adm.shortName})
              </option>
            ))}
          </select>

          {/* Specialty filter */}
          <select
            value={selectedSpecialtyId}
            onChange={(e) => setSelectedSpecialtyId(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">Toutes les spécialités</option>
            {SEED_SPECIALTIES.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>

          {/* Source Type filter */}
          <select
            value={selectedSourceType}
            onChange={(e) => setSelectedSourceType(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">Tous types de sources</option>
            <option value="official">Source officielle (Gouvernement)</option>
            <option value="archive">Archives publiques</option>
          </select>
        </div>
      </div>

      {/* Exams Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>{filteredExams.length} épreuve(s) répertoriée(s)</span>
          <span>Tri par récence de session</span>
        </div>

        {filteredExams.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Aucun concours correspondant</h3>
            <p className="text-xs text-slate-500">
              Modifiez vos critères de recherche ou réinitialisez les filtres.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExams.map((exam) => {
              const spec = SEED_SPECIALTIES.find((s) => s.id === exam.specialtyId);
              const lvl = SEED_LEVELS.find((l) => l.id === exam.levelId);

              return (
                <div
                  key={exam.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header tags */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        Session {exam.year}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center space-x-1 ${
                          exam.sourceType === 'official'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{exam.sourceType === 'official' ? 'Source Officielle' : 'Archive Publique'}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        {exam.adminName}
                      </span>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 leading-snug">
                        {exam.competitionTitle}
                      </h3>
                    </div>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                        {spec?.name || 'Informatique'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                        {lvl?.publicSectorGrade || 'Technicien / Ingénieur'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                        {exam.pageCount} pages
                      </span>
                      {exam.isScannedPdf && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          OCR Tesseract validé
                        </span>
                      )}
                    </div>

                    {exam.notes && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {exam.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onSelectExam(exam.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Examiner les questions & métadonnées</span>
                    </button>

                    <a
                      href={exam.originalDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center space-x-1"
                    >
                      <span>Lien source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
