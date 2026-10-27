import React from 'react';
import { GraduationCap, ShieldCheck, ExternalLink, Heart } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand col */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight">ConcoursDev Maroc</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Plateforme indépendante de préparation ciblée aux concours informatiques de la fonction publique marocaine.
              Plans générés à partir des fréquences réelles des annales.
            </p>
            <div className="flex items-center space-x-2 text-emerald-400 text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Données officielles sourcées (emploi-public.ma)</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 text-xs tracking-wider uppercase">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectTab('landing')} className="hover:text-emerald-400 transition-colors">
                  Accueil & Démarche
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('annales')} className="hover:text-emerald-400 transition-colors">
                  Annales officielles décryptées
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('stats')} className="hover:text-emerald-400 transition-colors">
                  Statistiques & coefficients réels
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('lessons')} className="hover:text-emerald-400 transition-colors">
                  Fiches de révision & astuces concours
                </button>
              </li>
            </ul>
          </div>

          {/* Administrations cibles */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 text-xs tracking-wider uppercase">Concours analysés</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Ministère de l'Économie et des Finances (MEF)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>DGSN — Techniciens & Ingénieurs</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Ministère de la Justice</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>ONDA & Agence Nationale des Ports</span>
              </li>
            </ul>
          </div>

          {/* Compliance & disclaimers */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 text-xs tracking-wider uppercase">Transparence</h4>
            <p className="text-[11px] leading-relaxed mb-3">
              Le service ne garantit en aucun cas l'admission aux concours de l'État. La fréquence historique ne constitue
              pas une promesse de reconduction des sujets.
            </p>
            <button
              onClick={() => onSelectTab('legal')}
              className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 text-xs underline"
            >
              <span>Mentions légales & limitation de responsabilité</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} ConcoursDev Maroc. Conçu pour les lauréats et étudiants du Royaume du Maroc.</p>
          <div className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Fait avec rigueur pour les candidats de l'OFPPT, des EST et des Universités</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
