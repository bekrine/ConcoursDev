import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { storageService, DEFAULT_CANDIDATE, DEFAULT_ADMIN } from './storage';

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
  isConfirmationPending?: boolean;
}

export class SupabaseAuthService {
  /**
   * Check if Supabase connection is active
   */
  isConfigured(): boolean {
    return isSupabaseConfigured && supabase !== null;
  }

  /**
   * Restore existing session on page load
   */
  async restoreSession(): Promise<UserProfile | null> {
    if (!this.isConfigured() || !supabase) {
      return storageService.getCurrentUser();
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        return storageService.getCurrentUser();
      }

      // Fetch corresponding profile from PostgreSQL
      const profile = await this.fetchProfile(session.user.id, session.user.email || '');
      if (profile) {
        storageService.setCurrentUser(profile);
        return profile;
      }
    } catch (err) {
      console.warn('[SupabaseAuth] Erreur lors de la restauration de session:', err);
    }

    return storageService.getCurrentUser();
  }

  /**
   * Register with Email & Password
   */
  async register(
    email: string,
    password: string,
    metadata: {
      fullName: string;
      specialtyId?: string;
      levelId?: string;
      preparationDays?: number;
      dailyHours?: number;
    }
  ): Promise<AuthResponse> {
    if (!this.isConfigured() || !supabase) {
      // Local fallback registration
      const localUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        fullName: metadata.fullName,
        role: 'candidate',
        createdAt: new Date().toISOString(),
        specialtyId: metadata.specialtyId || 'spec_dev',
        levelId: metadata.levelId || 'lvl_bac2',
        preparationDays: metadata.preparationDays || 30,
        dailyHours: metadata.dailyHours || 2,
        totalAvailableHours: (metadata.preparationDays || 30) * (metadata.dailyHours || 2),
        diagnosticCompleted: false,
      };
      storageService.setCurrentUser(localUser);
      return { success: true, user: localUser };
    }

    try {
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.fullName,
            role: 'candidate',
            specialty_id: metadata.specialtyId || 'spec_dev',
            level_id: metadata.levelId || 'lvl_bac2',
            preparation_days: metadata.preparationDays || 30,
            daily_hours: metadata.dailyHours || 2,
            total_available_hours: (metadata.preparationDays || 30) * (metadata.dailyHours || 2),
          },
          emailRedirectTo: `${origin}/#auth-callback`,
        },
      });

      if (error) {
        return { success: false, error: this.translateAuthError(error.message) };
      }

      if (!data.user) {
        return { success: false, error: 'Impossible de créer le compte.' };
      }

      // Check if email confirmation is required
      if (data.session === null && data.user.identities && data.user.identities.length > 0) {
        return {
          success: true,
          isConfirmationPending: true,
          error: 'Un email de confirmation vous a été envoyé. Veuillez cliquer sur le lien pour valider votre inscription.',
        };
      }

      const profile = await this.fetchProfile(data.user.id, data.user.email || email);
      if (profile) {
        storageService.setCurrentUser(profile);
        return { success: true, user: profile };
      }

      // Fallback profile if trigger is still processing
      const fallbackProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: metadata.fullName,
        role: 'candidate',
        createdAt: new Date().toISOString(),
        specialtyId: metadata.specialtyId || 'spec_dev',
        levelId: metadata.levelId || 'lvl_bac2',
        preparationDays: metadata.preparationDays || 30,
        dailyHours: metadata.dailyHours || 2,
        totalAvailableHours: (metadata.preparationDays || 30) * (metadata.dailyHours || 2),
        diagnosticCompleted: false,
      };
      storageService.setCurrentUser(fallbackProfile);
      return { success: true, user: fallbackProfile };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur inattendue lors de l\'inscription.' };
    }
  }

  /**
   * Login with Email & Password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    if (!this.isConfigured() || !supabase) {
      // Local fallback matching demo credentials or creating local session
      if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('amina')) {
        storageService.setCurrentUser(DEFAULT_ADMIN);
        return { success: true, user: DEFAULT_ADMIN };
      }
      const localUser: UserProfile = {
        ...DEFAULT_CANDIDATE,
        email,
        fullName: email.split('@')[0],
      };
      storageService.setCurrentUser(localUser);
      return { success: true, user: localUser };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: this.translateAuthError(error.message) };
      }

      if (!data.user) {
        return { success: false, error: 'Identifiants invalides.' };
      }

      const profile = await this.fetchProfile(data.user.id, data.user.email || email);
      if (profile) {
        storageService.setCurrentUser(profile);
        return { success: true, user: profile };
      }

      // Construct profile from user metadata if database table row is delayed
      const meta = data.user.user_metadata || {};
      const fallback: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: meta.full_name || email.split('@')[0],
        role: meta.role || 'candidate',
        createdAt: data.user.created_at,
        specialtyId: meta.specialty_id || 'spec_dev',
        levelId: meta.level_id || 'lvl_bac2',
        preparationDays: meta.preparation_days || 30,
        dailyHours: meta.daily_hours || 2,
        totalAvailableHours: (meta.preparation_days || 30) * (meta.daily_hours || 2),
        diagnosticCompleted: false,
      };
      storageService.setCurrentUser(fallback);
      return { success: true, user: fallback };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de la connexion.' };
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    if (this.isConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[SupabaseAuth] Erreur lors de la déconnexion:', err);
      }
    }
    // Reset to default candidate or clear session
    storageService.setCurrentUser(DEFAULT_CANDIDATE);
  }

  /**
   * Password Recovery: sends password reset email
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured() || !supabase) {
      return {
        success: true,
        message: 'Mode local : simulation de l\'envoi d\'un lien de réinitialisation à votre adresse email.',
      };
    }

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/#reset-password`,
      });

      if (error) {
        return { success: false, message: this.translateAuthError(error.message) };
      }

      return {
        success: true,
        message: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erreur lors de la demande de réinitialisation.' };
    }
  }

  /**
   * Update password (after following password reset link)
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured() || !supabase) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: this.translateAuthError(error.message) };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de la modification du mot de passe.' };
    }
  }

  /**
   * Fetch profile from public.profiles table
   */
  private async fetchProfile(userId: string, email: string): Promise<UserProfile | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        email: data.email || email,
        fullName: data.full_name || 'Candidat',
        role: data.role || 'candidate',
        createdAt: data.created_at || new Date().toISOString(),
        specialtyId: data.specialty_id || 'spec_dev',
        levelId: data.academic_level_id || 'lvl_bac2',
        targetAdminId: data.target_admin_id || undefined,
        targetCompetitionId: data.target_competition_id || undefined,
        preparationDays: data.preparation_days || 30,
        dailyHours: Number(data.daily_hours) || 2,
        totalAvailableHours: Number(data.total_available_hours) || 60,
        diagnosticCompleted: data.diagnostic_completed || false,
        diagnosticScore: data.diagnostic_score ? Number(data.diagnostic_score) : undefined,
      };
    } catch (err) {
      console.warn('[SupabaseAuth] Erreur de lecture du profil:', err);
      return null;
    }
  }

  /**
   * Translate common Supabase auth error messages to French
   */
  private translateAuthError(msg: string): string {
    const m = msg.toLowerCase();
    if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
      return 'Email ou mot de passe incorrect.';
    }
    if (m.includes('user already registered') || m.includes('already exists')) {
      return 'Un compte existe déjà avec cette adresse email.';
    }
    if (m.includes('password should be at least')) {
      return 'Le mot de passe doit comporter au moins 6 caractères.';
    }
    if (m.includes('email not confirmed')) {
      return 'Veuillez confirmer votre adresse email en cliquant sur le lien reçu.';
    }
    if (m.includes('rate limit')) {
      return 'Trop de tentatives. Veuillez patienter un instant avant de réessayer.';
    }
    return msg;
  }
}

export const supabaseAuthService = new SupabaseAuthService();
