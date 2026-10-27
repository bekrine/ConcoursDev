import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe environment variable retriever working in both Vite browser and Node.js test runners
const getEnvVar = (name: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[name]) {
      return (import.meta as any).env[name];
    }
  } catch {
    // ignore
  }
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name] as string;
    }
  } catch {
    // ignore
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey =
  getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') ||
  getEnvVar('VITE_SUPABASE_ANON_KEY');

// Detect whether valid Supabase credentials were provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseUrl.startsWith('http') &&
    supabaseKey &&
    supabaseKey.length > 20 &&
    !supabaseUrl.includes('votre-projet.supabase.co')
);

let clientInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    console.info('[ConcoursDev Maroc] Supabase Client initialisé avec succès.');
  } catch (err) {
    console.warn('[ConcoursDev Maroc] Erreur lors de l\'initialisation de Supabase Client:', err);
    clientInstance = null;
  }
} else {
  console.info(
    '[ConcoursDev Maroc] Mode Démonstration / Stockage local actif (variables VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY non configurées).'
  );
}

export const supabase = clientInstance;
