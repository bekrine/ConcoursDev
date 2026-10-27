import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  FileText,
  BarChart2,
  Shield,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../types';
import { storageService, DEFAULT_CANDIDATE, DEFAULT_ADMIN } from '../services/storage';
import { supabaseAuthService } from '../services/supabaseAuthService';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onOpenAuth: () => void;
  onStartOnboarding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onUserChange,
  onOpenAuth,
  onStartOnboarding,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart2 },
    { id: 'plan', label: 'Mon Plan d\'études', icon: Calendar },
    { id: 'annales', label: 'Annales & Concours', icon: FileText },
    { id: 'stats', label: 'Statistiques & Priorités', icon: Sparkles },
    { id: 'lessons', label: 'Cours & Fiches', icon: BookOpen },
    ...(currentUser.role === 'admin'
      ? [{ id: 'admin', label: 'Audit & Admin', icon: Shield }]
      : []),
  ];

  const handleSwitchToAdmin = () => {
    storageService.setCurrentUser(DEFAULT_ADMIN);
    onUserChange(DEFAULT_ADMIN);
    setUserDropdownOpen(false);
  };

  const handleSwitchToCandidate = () => {
    storageService.setCurrentUser(DEFAULT_CANDIDATE);
    onUserChange(DEFAULT_CANDIDATE);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">ConcoursDev</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  MAROC
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Fonction Publique IT • Techniciens & Ingénieurs
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & Profile Switcher */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={onStartOnboarding}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Nouveau Plan</span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 border border-slate-200 text-left transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="text-left hidden lg:block pr-1">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {currentUser.fullName.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-medium">
                    {currentUser.role === 'admin' ? 'Auditeur / Admin' : 'Candidat'}
                  </div>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900">{currentUser.fullName}</p>
                    <p className="text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      Rôle actuel : {currentUser.role === 'admin' ? 'Administrateur / Réviseur' : 'Candidat Préparation'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onSelectTab('profile');
                      }}
                      className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mon Profil & Disponibilités</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onSelectTab('legal');
                      }}
                      className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mentions légales & Sources</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <p className="px-3 py-1 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      Basculer de rôle de test :
                    </p>
                    {currentUser.role === 'candidate' ? (
                      <button
                        onClick={handleSwitchToAdmin}
                        className="w-full text-left px-3 py-1.5 text-amber-700 hover:bg-amber-50 flex items-center space-x-2 font-medium"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-600" />
                        <span>Passer au mode Administrateur</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSwitchToCandidate}
                        className="w-full text-left px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 flex items-center space-x-2 font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Passer au mode Candidat</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left px-3 py-1.5 text-slate-600 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Connexion / Changer de compte</span>
                    </button>
                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await supabaseAuthService.logout();
                        onUserChange(DEFAULT_CANDIDATE);
                      }}
                      className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            <button
              onClick={() => {
                onStartOnboarding();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 text-white font-medium text-sm flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Générer un plan de révision</span>
            </button>
            <button
              onClick={() => {
                currentUser.role === 'candidate' ? handleSwitchToAdmin() : handleSwitchToCandidate();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center space-x-2"
            >
              <span>Basculer : {currentUser.role === 'candidate' ? 'Mode Admin' : 'Mode Candidat'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
