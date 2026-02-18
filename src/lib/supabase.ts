import { createClient } from '@supabase/supabase-js';
import ExpoSecureStoreAdapter from './supabaseAdapter';

// ⚠️  Remplacez ces valeurs par celles de votre projet Supabase
// Supabase Dashboard > Settings > API
// Créez un fichier .env à la racine avec :
// EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
// EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon-ici
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return SUPABASE_URL !== '' && 
         SUPABASE_ANON_KEY !== '' && 
         !SUPABASE_URL.includes('your-project') && 
         !SUPABASE_ANON_KEY.includes('your-anon-key');
};

// Créer le client Supabase seulement si configuré
export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Fonction helper pour vérifier avant d'utiliser Supabase
export const requireSupabase = () => {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase n\'est pas configuré. Veuillez créer un fichier .env avec EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Voir README_SUPABASE.md pour les instructions.'
    );
  }
  if (!supabase) {
    throw new Error('Client Supabase non initialisé');
  }
  return supabase;
};
