import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, requireSupabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, userName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetStores: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,

  initialize: async () => {
    set({ loading: true });
    try {
      if (!isSupabaseConfigured()) {
        console.warn('Supabase non configuré. Mode hors ligne uniquement.');
        set({ loading: false, session: null, user: null });
        return;
      }
      const client = requireSupabase();
      const { data: { session } } = await client.auth.getSession();
      set({ session, user: session?.user ?? null, loading: false });

      // Écouter les changements de session (refresh token, logout depuis un autre appareil, etc.)
      client.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
      });
    } catch (e) {
      console.error('Auth initialize error:', e);
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase n\'est pas configuré. Veuillez configurer vos clés API dans .env' };
    }
    try {
      const client = requireSupabase();
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };

      const { data: { session } } = await client.auth.getSession();
      set({ session, user: session?.user ?? null });
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Erreur de connexion' };
    }
  },

  signUp: async (email, password, userName) => {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase n\'est pas configuré. Veuillez configurer vos clés API dans .env' };
    }
    try {
      const client = requireSupabase();
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { user_name: userName },
        },
      });
      if (error) return { error: error.message };

      // Si l'identifiant existe déjà mais non confirmé, Supabase renvoie 200 sans session
      // et avec un user dont identities est vide
      if (!data.session && data.user && data.user.identities?.length === 0) {
        return { error: 'Cet email est déjà utilisé. Essaie de te connecter.' };
      }

      const session = data.session;
      set({ session, user: session?.user ?? null });

      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Erreur d\'inscription' };
    }
  },

  signOut: async () => {
    if (isSupabaseConfigured()) {
      try {
        const client = requireSupabase();
        await client.auth.signOut();
      } catch (e) {
        console.error('Error signing out:', e);
      }
    }
    // Réinitialiser tous les stores locaux
    get().resetStores();
    set({ user: null, session: null });
  },

  resetStores: () => {
    // Import dynamique pour éviter les dépendances circulaires
    const { useHabitStore } = require('./habitStore');
    const { useGamificationStore } = require('./gamificationStore');
    const { useChallengeStore } = require('./challengeStore');
    const { usePremiumStore } = require('./premiumStore');
    const { useAppStore } = require('./appStore');

    useHabitStore.setState({ habits: [], logs: [] });
    useGamificationStore.setState({
      xp: 0,
      level: 1,
      totalXP: 0,
      xpHistory: [],
      unlockedBadges: [],
      showLevelUpModal: false,
      lastLevelUp: null,
    });
    useChallengeStore.setState({
      activeChallenges: [],
      completedChallengeIds: [],
      customChallenges: [],
    });
    usePremiumStore.setState({
      plan: 'free',
      expiresAt: null,
      streakProtectionsUsed: 0,
      lastProtectionReset: null,
    });
    useAppStore.setState({
      hasCompletedOnboarding: false,
      selectedCategories: [],
    });
  },
}));
