import React from 'react';
import { ShieldCheck, ExternalLink, Scale, FileText, AlertCircle } from 'lucide-react';

interface LegalPrivacyPageProps {
  onBack: () => void;
}

export const LegalPrivacyPage: React.FC<LegalPrivacyPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-8 text-xs text-slate-700 leading-relaxed">
      <div className="border-b border-slate-200 pb-4 space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Mentions Légales, Propriété & Déontologie
        </h1>
        <p className="text-slate-500">
          Cadre réglementaire régissant l'utilisation des annales publiques et la protection des données des candidats.
        </p>
      </div>

      {/* Honesty & Disclaimer Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center space-x-2 text-amber-950 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-amber-700" />
          <span>Avertissement et Non-Affiliation Gouvernementale</span>
        </div>
        <p className="text-amber-900">
          <strong>ConcoursDev Maroc</strong> est une initiative pédagogique indépendante. Elle n'est affiliée, mandatée ou
          financée par aucun ministère, ni par le Ministère de l'Économie et des Finances, ni par la Direction Générale
          de la Sûreté Nationale (DGSN), ni par le portail www.emploi-public.ma.
        </p>
        <p className="text-amber-900">
          L'utilisation de la plateforme ne constitue pas une garantie d'admission aux épreuves d'admissibilité ou
          d'admission des concours de la fonction publique marocaine.
        </p>
      </div>

      {/* Section 1: Provenance des annales */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>1. Provenance des Documents et Annales</span>
        </h2>
        <p>
          Les épreuves de concours référencées sur ConcoursDev Maroc proviennent de documents administratifs rendus publics
          par les départements ministériels organisateurs, conformément au droit d'accès à l'information (Loi 31-13 du
          Royaume du Maroc).
        </p>
        <p>
          Tous les documents numérisés conservent la mention explicite de leur source officielle d'origine, de leur date de
          session et de leur URL publique de publication.
        </p>
      </div>

      {/* Section 2: Loi 09-08 et Protection des données */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>2. Protection des Données Personnelles (Loi marocaine 09-08 / CNDP)</span>
        </h2>
        <p>
          Les informations collectées lors de l'onboarding (spécialité, niveau d'études, temps de révision quotidien,
          résultats aux QCM) ont pour finalité exclusive la génération et l'adaptation du calendrier d'étude de
          l'utilisateur.
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          <li>Aucune donnée n'est commercialisée ou transmise à des tiers.</li>
          <li>Chaque candidat dispose du droit d'exportation intégrale de ses données au format JSON.</li>
          <li>
            Chaque utilisateur peut à tout moment supprimer l'intégralité de son profil et de ses historiques en un clic.
          </li>
        </ul>
      </div>

      {/* Section 3: Traitement algorithmique */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Scale className="w-4 h-4 text-emerald-600" />
          <span>3. Transparence Algorithmique et Relecture Humaine</span>
        </h2>
        <p>
          Toute proposition de corrigé générée ou assistée par intelligence artificielle est soumise à une file d'audit
          humain (statut <em>pending_review</em>, <em>approved</em>, <em>needs_correction</em>). Les explications
          fournies sont rédigées dans un objectif de vulgarisation pédagogique rigoureuse.
        </p>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors cursor-pointer"
        >
          Retour à l'application
        </button>
      </div>
    </div>
  );
};
