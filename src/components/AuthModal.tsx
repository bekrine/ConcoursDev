import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { storageService, DEFAULT_CANDIDATE, DEFAULT_ADMIN } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleQuickCandidate = () => {
    storageService.setCurrentUser(DEFAULT_CANDIDATE);
    onLoginSuccess(DEFAULT_CANDIDATE);
    onClose();
  };

  const handleQuickAdmin = () => {
    storageService.setCurrentUser(DEFAULT_ADMIN);
    onLoginSuccess(DEFAULT_ADMIN);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      fullName: fullName || email.split('@')[0],
      role: 'candidate',
      createdAt: new Date().toISOString(),
      specialtyId: 'spec_dev',
      levelId: 'lvl_bac2',
      preparationDays: 30,
      dailyHours: 2,
      totalAvailableHours: 60,
      diagnosticCompleted: false,
    };

    storageService.setCurrentUser(newUser);
    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {isRegister ? 'Créer un compte candidat' : 'Connexion à ConcoursDev Maroc'}
            </h3>
            <p className="text-xs text-slate-500">Accédez à vos plans d'études, scores et révisions</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick Demo Access Buttons */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                Accès Immédiat (Comptes Démo)
              </span>
              <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-1.5 py-0.5 rounded font-medium">
                Sans mot de passe
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickCandidate}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-white rounded-lg border border-emerald-200 hover:border-emerald-300 text-emerald-800 font-medium text-xs shadow-2xs hover:shadow-xs transition-all"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Candidat (Yassine)</span>
              </button>
              <button
                type="button"
                onClick={handleQuickAdmin}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-white rounded-lg border border-amber-200 hover:border-amber-300 text-amber-900 font-medium text-xs shadow-2xs hover:shadow-xs transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin (Dr. Amina)</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] uppercase text-slate-400 font-medium tracking-wider absolute">
              Ou par identifiants
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {isRegister && (
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nom complet</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required={isRegister}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ex: Mehdi Tazi"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-medium text-slate-700 mb-1">Adresse email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidat@domaine.ma"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>{isRegister ? 'Créer mon profil' : 'Me connecter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-slate-600 hover:text-emerald-700 font-medium"
            >
              {isRegister
                ? 'Déjà inscrit ? Connectez-vous ici'
                : 'Pas encore de compte ? Créer un profil gratuit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
