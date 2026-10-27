import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Shield,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Loader2,
  KeyRound,
  Database,
} from 'lucide-react';
import { UserProfile } from '../types';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { storageService, DEFAULT_CANDIDATE, DEFAULT_ADMIN } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

type AuthMode = 'login' | 'register' | 'forgot_password';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLiveSupabase = supabaseAuthService.isConfigured();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email) {
      setErrorMessage('Veuillez renseigner votre adresse email.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'forgot_password') {
        const result = await supabaseAuthService.requestPasswordReset(email);
        setIsLoading(false);
        if (result.success) {
          setInfoMessage(result.message);
        } else {
          setErrorMessage(result.message);
        }
        return;
      }

      if (mode === 'register') {
        if (!password || password.length < 6) {
          setIsLoading(false);
          setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
          return;
        }

        const result = await supabaseAuthService.register(email, password, {
          fullName: fullName.trim() || email.split('@')[0],
          specialtyId: 'spec_dev',
          levelId: 'lvl_bac2',
          preparationDays: 30,
          dailyHours: 2,
        });

        setIsLoading(false);

        if (!result.success) {
          setErrorMessage(result.error || 'Erreur lors de l\'inscription.');
          return;
        }

        if (result.isConfirmationPending) {
          setInfoMessage(
            result.error || 'Inscription initiée ! Veuillez vérifier votre boîte email pour valider votre compte.'
          );
          return;
        }

        if (result.user) {
          onLoginSuccess(result.user);
          onClose();
        }
        return;
      }

      // Login Mode
      if (!password) {
        setIsLoading(false);
        setErrorMessage('Veuillez renseigner votre mot de passe.');
        return;
      }

      const result = await supabaseAuthService.login(email, password);
      setIsLoading(false);

      if (!result.success || !result.user) {
        setErrorMessage(result.error || 'Identifiants invalides.');
        return;
      }

      onLoginSuccess(result.user);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Une erreur inattendue est survenue.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {mode === 'register'
                ? 'Créer un compte candidat'
                : mode === 'forgot_password'
                ? 'Réinitialisation du mot de passe'
                : 'Connexion à ConcoursDev Maroc'}
            </h3>
            <p className="text-xs text-slate-500">
              {isLiveSupabase
                ? 'Authentification sécurisée Supabase Auth & PostgreSQL'
                : 'Mode Démo localisé — accès instantané'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Connection Status Badge */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
            <span className="flex items-center space-x-1.5 text-slate-600">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fournisseur d'authentification :</span>
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                isLiveSupabase
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isLiveSupabase ? 'Supabase Auth (Cloud)' : 'Local Fallback (Démo)'}
            </span>
          </div>

          {/* Quick Demo Access Buttons */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                Accès Immédiat (Profils Types)
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
              {mode === 'forgot_password' ? 'Récupération' : 'Ou avec identifiants'}
            </span>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Info Message Alert */}
          {infoMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nom complet</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
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

            {mode !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-slate-700">Mot de passe</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setErrorMessage(null);
                        setInfoMessage(null);
                      }}
                      className="text-[11px] text-emerald-700 hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
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
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Traitement en cours...</span>
                </>
              ) : mode === 'register' ? (
                <>
                  <span>Créer mon compte candidat</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'forgot_password' ? (
                <>
                  <span>Envoyer le lien de réinitialisation</span>
                  <KeyRound className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Me connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Toggles */}
          <div className="text-center pt-2 space-y-1 text-xs">
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className="text-slate-600 hover:text-emerald-700 font-medium"
              >
                Pas encore de compte ? Créer un profil gratuit
              </button>
            )}

            {mode === 'register' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className="text-slate-600 hover:text-emerald-700 font-medium"
              >
                Déjà inscrit ? Connectez-vous ici
              </button>
            )}

            {mode === 'forgot_password' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className="text-slate-600 hover:text-emerald-700 font-medium"
              >
                ← Retour au formulaire de connexion
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
